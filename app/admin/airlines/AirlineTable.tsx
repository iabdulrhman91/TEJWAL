'use client'

import { useState } from 'react'
import { toggleAirlineStatus, deleteAirline } from './actions'
import AddAirlineModal from './AddAirlineModal'

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
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 justify-center"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    إضافة شركة طيران جديدة
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">الكود (IATA)</th>
                            <th className="px-6 py-4 font-medium">الاسم (عربي)</th>
                            <th className="px-6 py-4 font-medium">الاسم (انجليزي)</th>
                            <th className="px-6 py-4 font-medium text-center">الحالة</th>
                            <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredAirlines.map((airline) => (
                            <tr key={airline.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-bold text-blue-600">{airline.code}</td>
                                <td className="px-6 py-4">{airline.nameAr}</td>
                                <td className="px-6 py-4 text-gray-500">{airline.nameEn}</td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => handleToggle(airline.id, airline.isActive)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${airline.isActive
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                            }`}
                                    >
                                        {airline.isActive ? 'نشط' : 'غير نشط'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => handleDelete(airline.id)}
                                        className="text-red-500 hover:text-red-700 transition p-2"
                                        title="حذف"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
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
                onSuccess={(newAirline) => {
                    setAirlines(prev => [...prev, newAirline].sort((a, b) => a.code.localeCompare(b.code)))
                    setIsModalOpen(false)
                }}
            />
        </div>
    )
}
