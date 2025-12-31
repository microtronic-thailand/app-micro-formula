"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Loader2, Megaphone } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { useEffect, useState } from "react";
import { getSettings, getAnnouncements } from "@/lib/data-service";
import { Announcement } from "@/types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Menu } from "lucide-react";

interface HeaderProps {
    onMobileMenuClick?: () => void;
}

export function Header({ onMobileMenuClick }: HeaderProps) {
    const { profile, loading } = useProfile();
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error);
        getAnnouncements().then(setAnnouncements).catch(console.error);
    }, []);

    const companyName = settings.company_name || 'MicroFormula';
    const logoUrl = settings.company_logo_url;

    return (
        <header className="flex h-14 items-center justify-between border-b bg-white px-4 md:px-6">
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={onMobileMenuClick}
                >
                    <Menu size={20} className="text-slate-500" />
                </Button>
                {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain" />
                ) : (
                    <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">MF</div>
                )}
                <div className="font-bold text-slate-700 hidden sm:block">{companyName}</div>
                <div className="h-4 w-px bg-slate-200 mx-2 hidden sm:block" />
                <div className="text-sm font-medium text-slate-500">
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    ) : (
                        `สวัสดี, ${profile?.email?.split('@')[0]}`
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell size={20} className="text-slate-500" />
                            {announcements.length > 0 && (
                                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex items-center gap-2">
                            <Megaphone className="h-4 w-4 text-blue-500" />
                            ประกาศจากระบบ
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {announcements.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground italic">
                                ไม่มีประกาศใหม่
                            </div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto">
                                {announcements.map((a) => (
                                    <DropdownMenuItem key={a.id} className="flex flex-col items-start p-4 cursor-default focus:bg-slate-50">
                                        <div className="font-bold flex items-center justify-between w-full mb-1">
                                            <span>{a.title}</span>
                                            <span className="text-[10px] text-muted-foreground font-normal">
                                                {format(new Date(a.createdAt), "d MMM", { locale: th })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 line-clamp-3">{a.content}</p>
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                {/* Points Display (Gimmick) */}
                {profile && profile.points > 0 && (
                    <div className="hidden md:flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs font-bold border border-amber-200 cursor-default" title="Your activity points!">
                        <span className="text-base leading-none">✨</span>
                        {profile.points}
                    </div>
                )}
                <Link href="/profile" className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-lg transition-colors">
                    <Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-blue-100">
                        <AvatarFallback>{profile?.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden md:block text-slate-700">{profile?.email || 'User'}</span>
                </Link>
            </div>
        </header>
    );
}
