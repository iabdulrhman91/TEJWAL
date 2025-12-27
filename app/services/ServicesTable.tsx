'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2, CheckCircle, XCircle, Loader2, Plus, Search } from 'lucide-react'
import { toggleServiceStatus, deleteService } from './actions'
import CurrencySymbol from '@/app/components/CurrencySymbol'
import StatusBadge from '@/app/components/StatusBadge'

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
    const [searchTerm, setSearchTerm] = useState('')

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
            <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row justify-between gap-4">
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="بحث باسم الخدمة..."
                        className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-right"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                </div>
                <Link
                    href="/services/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 justify-center font-bold shadow-sm"
                >
                    <Plus size={18} />
                    <span>إضافة خدمة جديدة</span>
                </Link>
            </div>
            <table className="w-full text-right border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">اسم الخدمة</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">السعر الافتراضي</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">إجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredServices.map((service) => (
                        <tr key={service.id} className="hover:bg-blue-50/50 transition duration-150 ease-in-out border-b border-gray-50 last:border-b-0">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{service.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                <div className="flex items-center gap-1 font-bold">
                                    {service.defaultUnitPrice ? service.defaultUnitPrice.toLocaleString('en-US') : '0'}
                                    <CurrencySymbol className="w-3 h-3 text-gray-400" />
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge
                                    isActive={service.isActive}
                                    isLoading={loadingId === service.id}
                                    onToggle={() => handleToggle(service.id, service.isActive)}
                                    activeText="مفعّل"
                                    inactiveText="غير مفعّل"
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap flex gap-2">
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
                    {filteredServices.length === 0 && (
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
