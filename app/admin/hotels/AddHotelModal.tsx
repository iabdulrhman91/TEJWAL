'use client'

import { useState, useEffect } from 'react'
import { addHotel, updateHotel } from './actions'
import { Building2, X, Star } from 'lucide-react'

interface HotelData {
    id?: number
    name: string
    city: string
    stars: number
    description: string | null
}

export default function AddHotelModal({
    isOpen,
    onClose,
    onSuccess,
    initialData
}: {
    isOpen: boolean,
    onClose: () => void,
    onSuccess: (hotel: any) => void,
    initialData?: HotelData | null
}) {
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        stars: 3,
        description: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                city: initialData.city,
                stars: initialData.stars,
                description: initialData.description || ''
            })
        } else {
            setFormData({ name: '', city: '', stars: 3, description: '' })
        }
    }, [initialData, isOpen])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            let result;
            if (initialData && initialData.id) {
                result = await updateHotel(initialData.id, formData)
            } else {
                result = await addHotel(formData)
            }
            onSuccess(result)
            if (!initialData) {
                setFormData({ name: '', city: '', stars: 3, description: '' })
            } else {
                onClose()
            }
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء الحفظ')
        } finally {
            setLoading(false)
        }
    }

    const isEdit = !!initialData

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Building2 className="text-purple-600" size={24} />
                        {isEdit ? 'تعديل بيانات الفندق' : 'إضافة فندق جديد للمكتبة'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم الفندق *</label>
                        <input
                            required
                            type="text"
                            placeholder="مثلاً: فندق هيلتون الرياض"
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-right uppercase"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">المدينة *</label>
                            <input
                                required
                                type="text"
                                placeholder="الرياض"
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-right"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">النجوم *</label>
                            <select
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-right"
                                value={formData.stars}
                                onChange={(e) => setFormData({ ...formData, stars: parseInt(e.target.value) })}
                            >
                                {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                    <option key={n} value={n}>{n} نجوم</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">التفاصيل (اختياري)</label>
                        <textarea
                            placeholder="وصف مختصر للفندق..."
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-right h-24 resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition disabled:opacity-50 shadow-lg shadow-purple-200"
                        >
                            {loading ? 'جاري الحفظ...' : (isEdit ? 'حفظ التغييرات' : 'إضافة الفندق')}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
