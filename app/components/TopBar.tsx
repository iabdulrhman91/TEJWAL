import { Search, Bell, Plus, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { getSession } from '@/lib/auth'

export default async function TopBar() {
    const session = await getSession()
    if (!session) return null

    return (
        <header className="h-20 border-b border-[#262626] flex items-center justify-between px-10 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-40">
            <div className="flex items-center gap-6 flex-1">
                <div className="text-sm font-bold text-[#737373]">
                    الرئيسية <span className="mx-2">/</span> <span className="text-white">لوحة التحكم</span>
                </div>
                <div className="relative w-96">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737373] w-4 h-4" />
                    <input
                        type="text"
                        placeholder="ابحث عن العروض، العملاء، التقارير..."
                        className="w-full bg-[#141414] border border-[#262626] rounded-2xl py-2.5 pr-12 pl-4 text-sm text-white focus:outline-none focus:border-[#10b981] transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-[#262626] px-1.5 py-0.5 rounded text-[10px] text-[#737373] font-bold">
                        <span>⌘</span>
                        <span>K</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Link href="/quotes/new" className="bg-[#10b981] hover:bg-[#059669] text-white text-sm font-black py-2.5 px-6 rounded-full transition-all flex items-center gap-2 active:scale-95">
                    <Plus className="w-4 h-4" />
                    <span>عرض جديد</span>
                </Link>

                <button className="w-10 h-10 flex items-center justify-center text-[#737373] hover:text-[#10b981] transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 left-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0a0a]"></span>
                </button>

                <div className="w-px h-6 bg-[#262626] mx-2"></div>

                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="text-left">
                        <div className="text-xs font-black text-white group-hover:text-[#10b981] transition-colors">{session.name}</div>
                        <div className="text-[10px] text-[#737373]">@{session.email.split('@')[0]}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center text-[#10b981] font-black">
                        {session.name.charAt(0)}
                    </div>
                    <ChevronDown className="w-4 h-4 text-[#737373]" />
                </div>
            </div>
        </header>
    )
}
