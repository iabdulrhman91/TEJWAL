'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, Trash2, CheckCircle, XCircle, Plane, Hotel, Loader2, Plus, Search } from 'lucide-react'
import { toggleSupplierStatus, deleteSupplier } from './actions'
import AddSupplierModal from './AddSupplierModal'
import StatusBadge from '@/app/components/StatusBadge'

export default function SupplierTable({ initialSuppliers }: { initialSuppliers: any[] }) {
    const router = useRouter()
    const [loadingId, setLoadingId] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // Use initialSuppliers directly
    const suppliers = initialSuppliers

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleToggle = async (id: number, currentStatus: boolean) => {
        setLoadingId(id)
        try {
            const res = await toggleSupplierStatus(id, !currentStatus)
            if (res.success) {
                router.refresh()
            } else {
                alert('فشل تغيير الحالة')
            }
        } catch (e) {
            alert('حدث خطأ')
        } finally {
            setLoadingId(null)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return
        setLoadingId(id)
        try {
            const res = await deleteSupplier(id)
            if (res.success) {
                router.refresh()
            } else {
                alert('فشل الحذف')
            }
        } catch (e) {
            alert('حدث خطأ')
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
                        placeholder="بحث عن مورد..."
                        className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-right placeholder-gray-400 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition shadow-sm justify-center"
                >
                    <Plus size={18} />
                    <span>إضافة مورد جديد</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">اسم المورد</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">الخدمات المدعومة</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredSuppliers.map((supplier) => (
                            <tr key={supplier.id} className="hover:bg-blue-50/50 transition duration-150 ease-in-out border-b border-gray-50 last:border-b-0">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{supplier.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex gap-2">
                                        {supplier.supportsFlights && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg font-bold" title="طيران">
                                                <Plane size={12} /> طيران
                                            </span>
                                        )}
                                        {supplier.supportsHotels && (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-lg font-bold" title="فنادق">
                                                <Hotel size={12} /> فنادق
                                            </span>
                                        )}
                                        {!supplier.supportsFlights && !supplier.supportsHotels && (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge
                                        isActive={supplier.isActive}
                                        isLoading={loadingId === supplier.id}
                                        onToggle={() => handleToggle(supplier.id, supplier.isActive)}
                                        inactiveText="متوقف"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                                    <button
                                        onClick={() => handleDelete(supplier.id)}
                                        disabled={loadingId === supplier.id}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                                        title="حذف"
                                    >
                                        {loadingId === supplier.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredSuppliers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-400">
                                    لا يوجد موردين مضافين حالياً
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <AddSupplierModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setIsAddModalOpen(false)
                    router.refresh()
                }}
            />
        </div>
    )
}
