"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/use-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginPage from "./(auth)/login/page";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { profile, loading, user } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          {/* Placeholder for Client Logo - can be updated in Settings */}
          <div className="mx-auto h-20 w-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
            M
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">MicroAccount</h1>
          <p className="text-slate-500 font-medium italic">ระบบบริหารจัดการบัญชีระดับองค์กร</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-2 border border-slate-100">
          <LoginPage />
        </div>

        <div className="text-center text-slate-400 text-sm">
          © {new Date().getFullYear()} Power by Microtronic Thailand
        </div>
      </div>
    </div>
  );
}
