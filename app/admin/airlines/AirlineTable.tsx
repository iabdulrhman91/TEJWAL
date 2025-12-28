'use client'

import { useState } from 'react'
import { toggleAirlineStatus, deleteAirline } from './actions'
import AddAirlineModal from './AddAirlineModal'
import StatusBadge from '@/app/components/StatusBadge'
import { Pencil } from 'lucide-react'

interface Airline {
    id: number
    code: string
    nameAr: string
    nameEn: string
    isActive: boolean
}

export default function AirlineTable({ initialAirlines }: { initialAirlines: Airline[] }) {
    const [airlines, setAirlines] = useState(initialAirlines)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingAirline, setEditingAirline] = useState<Airline | null>(null)

    const filteredAirlines = airlines.filter(a =>
        a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.nameAr.includes(searchTerm) ||
        a.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleToggle = async (id: number, currentStatus: boolean) => {
        try {
            await toggleAirlineStatus(id, !currentStatus)
            setAirlines(airlines.map(a => a.id === id ? { ...a, isActive: !currentStatus } : a))
        } catch (error) {
            alert('حدث خطأ أثناء تحديث الحالة')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف شركة الطيران هذه؟')) return
        try {
            await deleteAirline(id)
            setAirlines(airlines.filter(a => a.id !== id))
        } catch (error) {
            alert('حدث خطأ أثناء الحذف')
        }
    }

    const handleEdit = (airline: Airline) => {
        setEditingAirline(airline)
        setIsModalOpen(true)
    }

    const handleAddNew = () => {
        setEditingAirline(null)
        setIsModalOpen(true)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row justify-between gap-4">
                <input
                    type="text"
                    placeholder="بحث بالكود أو الاسم..."
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 text-right"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                    onClick={handleAddNew}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 justify-center"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    إضافة شركة طيران جديدة
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">الكود (IATA)</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">الاسم (عربي)</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">الاسم (انجليزي)</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">الحالة</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredAirlines.map((airline) => (
                            <tr key={airline.id} className="hover:bg-blue-50/50 transition duration-150 ease-in-out border-b border-gray-50 last:border-b-0">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{airline.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{airline.nameAr}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-sans">{airline.nameEn}</td>
                                <td className="px-6 py-4 text-center">
                                    <StatusBadge
                                        isActive={airline.isActive}
                                        isLoading={false}
                                        onToggle={() => handleToggle(airline.id, airline.isActive)}
                                        inactiveText="غير نشط"
                                    />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(airline)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="تعديل"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(airline.id)}
                                            className="text-red-500 hover:text-red-700 transition p-2"
                                            title="حذف"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredAirlines.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    لا توجد شركات طيران مطابقة للبحث
                </div>
            )}

            <AddAirlineModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingAirline}
                onSuccess={(savedAirline) => {
                    if (editingAirline) {
                        setAirlines(prev => prev.map(a => a.id === savedAirline.id ? { ...savedAirline, isActive: a.isActive } : a))
                    } else {
                        setAirlines(prev => [...prev, savedAirline].sort((a, b) => a.code.localeCompare(b.code)))
                    }
                    setIsModalOpen(false)
                }}
            />
        </div>
    )
}
