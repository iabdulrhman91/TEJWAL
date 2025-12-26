'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, Trash2, CheckCircle, XCircle, Plane, Hotel, Loader2 } from 'lucide-react'
import { toggleSupplierStatus, deleteSupplier } from './actions'

export default function SupplierTable({ initialSuppliers }: { initialSuppliers: any[] }) {
    const router = useRouter()
    const [loadingId, setLoadingId] = useState<number | null>(null)

    // Use initialSuppliers directly (Next.js server component pattern)
    // When router.refresh() is called, this component re-renders with new props
    const suppliers = initialSuppliers

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
            <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                    <tr>
                        <th className="p-4">اسم المورد</th>
                        <th className="p-4">الخدمات المدعومة</th>
                        <th className="p-4">الحالة</th>
                        <th className="p-4">إجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {suppliers.map((supplier) => (
                        <tr key={supplier.id} className="hover:bg-blue-50/50 transition">
                            <td className="p-4 font-bold text-gray-800">{supplier.name}</td>
                            <td className="p-4">
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
                            <td className="p-4">
                                <button
                                    onClick={() => handleToggle(supplier.id, supplier.isActive)}
                                    disabled={loadingId === supplier.id}
                                    className="transition hover:opacity-80 disabled:opacity-50"
                                >
                                    {supplier.isActive ?
                                        <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold"><CheckCircle size={12} /> نشط</span> :
                                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold"><XCircle size={12} /> متوقف</span>
                                    }
                                </button>
                            </td>
                            <td className="p-4 flex gap-2">
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
                    {suppliers.length === 0 && (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-400">
                                لا يوجد موردين مضافين حالياً
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
