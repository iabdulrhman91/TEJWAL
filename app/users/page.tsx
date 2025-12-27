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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-sans text-gray-900 leading-tight">إدارة الموظفين</h1>
                    <p className="text-gray-500 mt-1">إضافة وتعطيل صلاحيات الموظفين - محدث</p>
                </div>
            </div>

            <UserList initialUsers={users} />
        </div>
    )
}
