'use client'

import { useState } from 'react'
import { toggleUserStatus } from './actions'

export default function UserList({ initialUsers }: { initialUsers: any[] }) {
    const [users, setUsers] = useState(initialUsers)

    async function handleToggle(userId: number, currentStatus: boolean) {
        const result = await toggleUserStatus(userId, !currentStatus)
        if (result.success) {
            setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u))
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-right border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b text-gray-600 text-sm">
                        <th className="px-6 py-4 font-semibold">الاسم</th>
                        <th className="px-6 py-4 font-semibold">البريد الإلكتروني</th>
                        <th className="px-6 py-4 font-semibold">الدور</th>
                        <th className="px-6 py-4 font-semibold">الحالة</th>
                        <th className="px-6 py-4 font-semibold text-left">الإجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4">{user.name}</td>
                            <td className="px-6 py-4 font-mono text-sm">{user.email}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {user.role === 'Admin' ? 'مدير' : 'موظف'}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {user.isActive ? 'نشط' : 'معطل'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-left">
                                <button
                                    onClick={() => handleToggle(user.id, user.isActive)}
                                    className={`text-sm font-semibold transition ${user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
                                        }`}
                                >
                                    {user.isActive ? 'تعطيل' : 'تفعيل'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
