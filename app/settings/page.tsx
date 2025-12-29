import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import SettingsContainer from './SettingsContainer'

export default async function SettingsPage() {
    const session = await getSession()
    if (!session) {
        redirect('/login')
    }

    let initialUsers: any[] = []
    let initialSuppliers: any[] = []
    let initialCountries: any[] = []
    if (session.role === 'Admin') {
        initialUsers = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        })
        initialSuppliers = await prisma.supplier.findMany({
            orderBy: { createdAt: 'desc' }
        })
        initialCountries = await prisma.country.findMany({
            orderBy: { createdAt: 'desc' }
        })
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">الإعدادات</h1>
                <p className="text-gray-500 font-medium">
                    {session.role === 'Admin'
                        ? 'تحكم في حسابك، الموظفين، والموردين، والروابط التقنية'
                        : 'تحكم في إعدادات حسابك الشخصي وتغيير كلمة المرور'}
                </p>
            </header>

            <SettingsContainer
                session={session}
                initialUsers={JSON.parse(JSON.stringify(initialUsers))}
                initialSuppliers={JSON.parse(JSON.stringify(initialSuppliers))}
                initialCountries={JSON.parse(JSON.stringify(initialCountries))}
            />
        </div>
    )
}
