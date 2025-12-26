import LoginForm from './login-form'

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 selection:bg-blue-100 selection:text-blue-900">
            <div className="w-full max-w-[440px] space-y-8 bg-white p-8 md:p-12 rounded-[24px] shadow-2xl shadow-gray-200/50 border border-gray-100">
                <div className="text-center space-y-3">
                    <img src="/logo.png" alt="Tejwal Logo" className="h-20 w-auto mx-auto mb-4" />
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">نظام إدارة عروض السفر</h1>
                    <p className="text-sm font-medium text-gray-500 bg-gray-50 py-2 px-4 rounded-full inline-block">
                        الدخول مخصص لموظفي تجوال فقط
                    </p>
                </div>

                <LoginForm />

                <div className="pt-6 border-t border-gray-50 text-center">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        © Tejwal Travel – Internal System
                    </p>
                </div>
            </div>
        </div>
    )
}
