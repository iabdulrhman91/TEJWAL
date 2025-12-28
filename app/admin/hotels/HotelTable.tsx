'use client'

import { useState } from 'react'
import { toggleHotelStatus, deleteHotel } from './actions'
import { Star, Trash2, Search, Building2, Plus, Pencil } from 'lucide-react'
import AddHotelModal from './AddHotelModal'
import StatusBadge from '@/app/components/StatusBadge'

interface Hotel {
    id: number
    name: string
    city: string
    stars: number
    description: string | null
    isActive: boolean
}

export default function HotelTable({ initialHotels }: { initialHotels: Hotel[] }) {
    const [hotels, setHotels] = useState(initialHotels)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)

    const filteredHotels = hotels.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.city.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleToggle = async (id: number, currentStatus: boolean) => {
        try {
            await toggleHotelStatus(id, !currentStatus)
            setHotels(hotels.map(h => h.id === id ? { ...h, isActive: !currentStatus } : h))
        } catch (error) {
            alert('حدث خطأ أثناء تحديث الحالة')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا الفندق؟')) return
        try {
            await deleteHotel(id)
            setHotels(hotels.filter(h => h.id !== id))
        } catch (error) {
            alert('حدث خطأ أثناء الحذف')
        }
    }

    const handleEdit = (hotel: Hotel) => {
        setEditingHotel(hotel)
        setIsModalOpen(true)
    }

    const handleAddNew = () => {
        setEditingHotel(null)
        setIsModalOpen(true)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="بحث باسم الفندق أو المدينة..."
                        className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-right"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition flex items-center gap-2 justify-center shadow-lg shadow-purple-100"
                >
                    <Plus size={20} />
                    إضافة فندق للمكتبة
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">اسم الفندق</th>
                            <th className="px-6 py-4 font-medium">المدينة</th>
                            <th className="px-6 py-4 font-medium text-center">النجوم</th>
                            <th className="px-6 py-4 font-medium text-center">الحالة</th>
                            <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredHotels.map((hotel) => (
                            <tr key={hotel.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                                            <Building2 size={16} />
                                        </div>
                                        <span className="font-bold text-gray-900 uppercase">{hotel.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{hotel.city}</td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center text-yellow-500">
                                        {Array.from({ length: hotel.stars }).map((_, i) => (
                                            <Star key={i} size={14} fill="currentColor" />
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <StatusBadge
                                        isActive={hotel.isActive}
                                        isLoading={false}
                                        onToggle={() => handleToggle(hotel.id, hotel.isActive)}
                                        inactiveText="غير نشط"
                                    />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(hotel)}
                                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                            title="تعديل"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(hotel.id)}
                                            className="text-red-500 hover:text-red-700 transition p-2"
                                            title="حذف"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredHotels.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                    <Building2 className="mx-auto mb-4 text-gray-300" size={48} />
                    <p>لا توجد فنادق مضافة في المكتبة بعد</p>
                </div>
            )}
            <AddHotelModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingHotel}
                onSuccess={(newHotel) => {
                    if (editingHotel) {
                        setHotels(prev => prev.map(h => h.id === newHotel.id ? { ...newHotel, isActive: h.isActive } : h))
                    } else {
                        setHotels(prev => [...prev, newHotel].sort((a, b) => a.name.localeCompare(b.name)))
                    }
                    setIsModalOpen(false)
                }}
            />
        </div>
    )
}
