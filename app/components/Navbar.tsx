import Link from 'next/link'
import { getSession } from '@/lib/auth'
import LogoutButton from './LogoutButton'
import NavLinks from './NavLinks'

export default async function Navbar() {
    const session = await getSession()

    if (!session) return null

    return (
        <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2 py-2">
                            <img src="/logo.png" alt="Tejwal Logo" className="h-14 w-auto object-contain" />
                        </Link>

                        <NavLinks isAdmin={session.role === 'Admin'} />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-bold text-gray-900 leading-none mb-1">{session.name}</span>
                            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">
                                {session.role === 'Admin' ? 'مدير' : 'موظف مبيعات'}
                            </span>
                        </div>
                        <div className="w-px h-8 bg-gray-100 mx-1 hidden sm:block"></div>
                        <LogoutButton />
                    </div>
                </div>
            </div>
        </nav>
    )
}
