export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return <main className="min-h-screen flex items-center justify-center p-4">
        <div className="">
            <div className="mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-[#3B9702] text-center mb-1">Green Messenger</h1>
                    <p className="text-center text-[#7d8b99] text-sm mb-6">
                        Войдите, используя данные GREEN-API
                    </p>
                </div>
                
            </div>  
             {children}
        </div>
    </main>
}