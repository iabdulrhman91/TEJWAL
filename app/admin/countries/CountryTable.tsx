'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Edit2, Trash2, CheckCircle, XCircle, Loader2, Plus, Pencil } from 'lucide-react'
import AddCountryModal from './AddCountryModal'
import StatusBadge from '@/app/components/StatusBadge'
import { deleteCountry, toggleCountryStatus } from './actions'

// Using the same server actions for manageability, assuming we add delete/toggle actions there later
// For now, mostly display and visual management

interface Country {
    id: number
    code: string
    nameAr: string
    nameEn: string
    isActive: boolean
}

interface CountryTableProps {
    countries: Country[]
}

export default function CountryTable({ countries }: CountryTableProps) {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [loadingId, setLoadingId] = useState<number | null>(null)
    const [editingCountry, setEditingCountry] = useState<Country | null>(null)

    const filtered = countries.filter(c =>
        c.nameAr.includes(searchTerm) ||
        c.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذه الوجهة؟')) return
        setLoadingId(id)
        try {
            await deleteCountry(id)
            router.refresh()
        } catch (e) {
            alert('فشل الحذف')
        } finally {
            setLoadingId(null)
        }
    }

    const handleToggle = async (id: number) => {
        setLoadingId(id)
        try {
            await toggleCountryStatus(id)
            router.refresh()
        } catch (e) {
            alert('فشل تغيير الحالة')
        } finally {
            setLoadingId(null)
        }
    }

    const handleEdit = (country: Country) => {
        setEditingCountry(country)
        setIsAddModalOpen(true)
    }

    const handleAddNew = () => {
        setEditingCountry(null)
        setIsAddModalOpen(true)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row justify-between gap-4">
                <input
                    type="text"
                    placeholder="بحث في الوجهات..."
                    className="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-right placeholder-gray-400 bg-white"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />

                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition shadow-sm justify-center"
                >
                    <Plus size={18} />
                    <span>إضافة وجهة جديدة</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">الاسم (عربي)</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">الاسم (انجليزي)</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map(country => (
                            <tr key={country.id} className="hover:bg-blue-50/50 transition duration-150 ease-in-out border-b border-gray-50 last:border-b-0">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{country.nameAr}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-sans">{country.nameEn}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><span className="font-mono text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5 border">{country.code}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge
                                        isActive={country.isActive}
                                        isLoading={loadingId === country.id}
                                        onToggle={() => handleToggle(country.id)}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                                    <button
                                        onClick={() => handleEdit(country)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="تعديل"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(country.id)}
                                        disabled={loadingId === country.id}
                                        title="حذف"
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                                    >
                                        {loadingId === country.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <div className="p-8 text-center text-gray-400">لا توجد نتائج</div>}
            </div>

            <AddCountryModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                initialData={editingCountry}
                onSuccess={() => router.refresh()}
            />
        </div>
    )
}
