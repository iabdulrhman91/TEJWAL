'use client'

import { useState } from 'react'
import { toggleAirportStatus, deleteAirport } from './actions'
import AddAirportModal from './AddAirportModal'
import StatusBadge from '@/app/components/StatusBadge'

interface Airport {
    id: number
    code: string
    cityAr: string
    cityEn: string
    countryAr: string | null
    isActive: boolean
}

export default function AirportTable({ initialAirports }: { initialAirports: Airport[] }) {
    const [airports, setAirports] = useState(initialAirports)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)

    const filteredAirports = airports.filter(a =>
        a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.cityAr.includes(searchTerm) ||
        a.cityEn.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleToggle = async (id: number, currentStatus: boolean) => {
        try {
            await toggleAirportStatus(id, !currentStatus)
            setAirports(airports.map(a => a.id === id ? { ...a, isActive: !currentStatus } : a))
        } catch (error) {
            alert('حدث خطأ أثناء تحديث الحالة')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا المطار؟')) return
        try {
            await deleteAirport(id)
            setAirports(airports.filter(a => a.id !== id))
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
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
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
                    إضافة مطار جديد
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">الكود (IATA)</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">المدينة (عربي)</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">المدينة (انجليزي)</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">الدولة</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">الحالة</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredAirports.map((airport) => (
                            <tr key={airport.id} className="hover:bg-blue-50/50 transition duration-150 ease-in-out border-b border-gray-50 last:border-b-0">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{airport.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{airport.cityAr}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-sans">{airport.cityEn}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{airport.countryAr || '-'}</td>
                                <td className="px-6 py-4 text-center">
                                    <StatusBadge
                                        isActive={airport.isActive}
                                        isLoading={false}
                                        onToggle={() => handleToggle(airport.id, airport.isActive)}
                                        inactiveText="غير نشط"
                                    />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => handleDelete(airport.id)}
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

            {filteredAirports.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    لا توجد مطارات مطابقة للبحث
                </div>
            )}

            <AddAirportModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={(newAirport) => {
                    setAirports(prev => [...prev, newAirport].sort((a, b) => a.code.localeCompare(b.code)))
                    setIsModalOpen(false)
                }}
            />
        </div>
    )
}
