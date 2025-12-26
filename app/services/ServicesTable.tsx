'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toggleServiceStatus, deleteService } from './actions'
import CurrencySymbol from '@/app/components/CurrencySymbol'

interface Service {
    id: number
    name: string
    defaultUnitPrice: number | null
    isActive: boolean
}

export default function ServicesTable({ initialServices }: { initialServices: Service[] }) {
    const router = useRouter()
    const [loadingId, setLoadingId] = useState<number | null>(null)

    // Using initialServices directly as per server component pattern
    const services = initialServices

    const handleToggle = async (id: number, currentStatus: boolean) => {
        setLoadingId(id)
        try {
            await toggleServiceStatus(id, currentStatus)
            router.refresh()
        } catch (e) {
            alert('فشل تغيير الحالة')
        } finally {
            setLoadingId(null)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return
        setLoadingId(id)
        try {
            await deleteService(id)
            router.refresh()
        } catch (e) {
            alert('فشل الحذف')
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                    <tr>
                        <th className="p-4">اسم الخدمة</th>
                        <th className="p-4">السعر الافتراضي</th>
                        <th className="p-4">الحالة</th>
                        <th className="p-4">إجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {services.map((service) => (
                        <tr key={service.id} className="hover:bg-blue-50/50 transition">
                            <td className="p-4 font-bold text-gray-800">{service.name}</td>
                            <td className="p-4 text-gray-600">
                                <div className="flex items-center gap-1 font-bold">
                                    {service.defaultUnitPrice ? service.defaultUnitPrice.toLocaleString('en-US') : '0'}
                                    <CurrencySymbol className="w-3 h-3 text-gray-400" />
                                </div>
                            </td>
                            <td className="p-4">
                                <button
                                    onClick={() => handleToggle(service.id, service.isActive)}
                                    disabled={loadingId === service.id}
                                    className="transition hover:opacity-80 disabled:opacity-50"
                                >
                                    {service.isActive ?
                                        <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold"><CheckCircle size={12} /> مفعّل</span> :
                                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold"><XCircle size={12} /> غير مفعّل</span>
                                    }
                                </button>
                            </td>
                            <td className="p-4 flex gap-2">
                                <Link
                                    href={`/services/${service.id}`}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="تعديل"
                                >
                                    <Pencil size={16} />
                                </Link>
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    disabled={loadingId === service.id}
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                                    title="حذف"
                                >
                                    {loadingId === service.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                </button>
                            </td>
                        </tr>
                    ))}
                    {services.length === 0 && (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-400">
                                لا توجد خدمات مضافة حالياً
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
