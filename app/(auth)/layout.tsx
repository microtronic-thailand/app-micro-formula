export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md space-y-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tighter">Micro Account</h1>
                    <p className="text-sm text-muted-foreground">ระบบบริหารจัดการบัญชีสำหรับธุรกิจขนาดเล็ก</p>
                </div>
                {children}
            </div>
        </div>
    )
}
