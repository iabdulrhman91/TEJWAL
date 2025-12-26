import Link from 'next/link'
import { getSession } from '@/lib/auth'
import {
    LayoutDashboard,
    FileText,
    Settings,
    Users,
    Plane,
    Hotel,
    MapPin,
    Briefcase,
    LogOut,
    UserCircle,
    Building2,
    Globe
} from 'lucide-react'
import LogoutButton from './LogoutButton'

export default async function Sidebar() {
    const session = await getSession()

    if (!session) return null

    const navItems = [
        { label: 'العروض', href: '/quotes', icon: FileText, group: 'الأساسية' },
        { label: 'التقارير', href: '/dashboard', icon: LayoutDashboard, group: 'الأساسية', adminOnly: true },

        { label: 'الخدمات', href: '/services', icon: Briefcase, group: 'مكونات الرحلة' },
        { label: 'المطارات', href: '/admin/airports', icon: MapPin, group: 'مكونات الرحلة', adminOnly: true },
        { label: 'الطيران', href: '/admin/airlines', icon: Plane, group: 'مكونات الرحلة', adminOnly: true },
        { label: 'الفنادق', href: '/admin/hotels', icon: Hotel, group: 'مكونات الرحلة', adminOnly: true },
        { label: 'الموردين', href: '/admin/suppliers', icon: Building2, group: 'مكونات الرحلة', adminOnly: true },
        { label: 'إدارة الوجهات', href: '/admin/countries', icon: Globe, group: 'مكونات الرحلة', adminOnly: true },
        { label: 'المستخدمين', href: '/users', icon: Users, group: 'النظام', adminOnly: true },
        { label: 'العملاء', href: '/admin/customers', icon: UserCircle, group: 'النظام', adminOnly: true },
    ]

    const groups = ['الأساسية', 'مكونات الرحلة', 'النظام']

    return (
        <aside className="w-72 h-screen bg-[#0a0a0a] border-l border-[#262626] flex flex-col fixed right-0 top-0 z-50">
            <div className="p-8">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-[#10b981] rounded-xl flex items-center justify-center">
                        <Plane className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">تجوال</h1>
                        <p className="text-[10px] text-[#10b981] font-bold uppercase tracking-widest leading-none">Travel Portal</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {groups.map(group => {
                        const items = navItems.filter(item => item.group === group && (!item.adminOnly || session.role === 'Admin'))
                        if (items.length === 0) return null

                        return (
                            <div key={group} className="space-y-2">
                                <h3 className="text-[10px] font-black text-[#404040] uppercase tracking-[2px] px-4">{group}</h3>
                                <div className="space-y-1">
                                    {items.map(item => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#737373] hover:text-[#10b981] hover:bg-[#141414] rounded-2xl transition-all group"
                                        >
                                            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            <span>{item.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="mt-auto p-8 space-y-4">
                <div className="bg-[#141414] p-4 rounded-3xl border border-[#262626]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#10b981] to-emerald-800 flex items-center justify-center text-white font-bold">
                            {session.name.charAt(0)}
                        </div>
                        <div>
                            <div className="text-sm font-black text-white">{session.name}</div>
                            <div className="text-[10px] text-[#737373]">{session.role === 'Admin' ? 'مدير النظام' : 'موظف مبيعات'}</div>
                        </div>
                    </div>
                    <LogoutButton className="w-full" />
                </div>
            </div>
        </aside>
    )
}
