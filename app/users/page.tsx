import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UserList from './user-list'

export default async function UsersPage() {
    const session = await getSession()

    if (!session || session.role !== 'Admin') {
        redirect('/')
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="max-w-7xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">إدارة المستخدمين</h1>
                    <p className="text-gray-500 mt-1">إضافة وتعطيل صلاحيات الموظفين</p>
                </div>
                <a
                    href="/users/new"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    إضافة مستخدم
                </a>
            </div>

            <UserList initialUsers={users} />
        </div>
    )
}
