'use client'

import { useState } from 'react'
import { toggleUserStatus } from './actions'
import { Plus, Search, CheckCircle, XCircle, User, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/app/components/StatusBadge'

export default function UserList({ initialUsers }: { initialUsers: any[] }) {
    const [users, setUsers] = useState(initialUsers)
    const [searchTerm, setSearchTerm] = useState('')
    const [loadingId, setLoadingId] = useState<number | null>(null)
    const router = useRouter()

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    async function handleToggle(userId: number, currentStatus: boolean) {
        setLoadingId(userId)
        try {
            const result = await toggleUserStatus(userId, !currentStatus)
            if (result.success) {
                setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u))
                router.refresh()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row justify-between gap-4">
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="بحث عن موظف..."
                        className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-right placeholder-gray-400 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
                <Link
                    href="/users/new"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition shadow-sm justify-center"
                >
                    <Plus size={18} />
                    <span>إضافة موظف</span>
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">الاسم</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">الدور</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-blue-50/50 transition duration-150 ease-in-out border-b border-gray-50 last:border-b-0">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-gray-100 rounded-full">
                                            <User size={16} className="text-gray-500" />
                                        </div>
                                        <span className="font-bold text-gray-800">{user.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {user.role === 'Admin' ? 'مدير' : 'موظف'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge
                                        isActive={user.isActive}
                                        isLoading={loadingId === user.id}
                                        onToggle={() => handleToggle(user.id, user.isActive)}
                                    />
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400">
                                    لا يوجد مستخدمين مطابقين للبحث
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
