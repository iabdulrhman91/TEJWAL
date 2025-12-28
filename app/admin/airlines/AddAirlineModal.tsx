'use client'

import { useState, useEffect } from 'react'
import { addAirline, updateAirline } from './actions'

interface AirlineData {
    id?: number
    code: string
    nameAr: string
    nameEn: string
}

export default function AddAirlineModal({
    isOpen,
    onClose,
    onSuccess,
    initialData
}: {
    isOpen: boolean,
    onClose: () => void,
    onSuccess: (airline: any) => void,
    initialData?: AirlineData | null
}) {
    const [formData, setFormData] = useState({
        code: '',
        nameAr: '',
        nameEn: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (initialData) {
            setFormData({
                code: initialData.code,
                nameAr: initialData.nameAr,
                nameEn: initialData.nameEn
            })
        } else {
            setFormData({ code: '', nameAr: '', nameEn: '' })
        }
    }, [initialData, isOpen])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (initialData && initialData.id) {
                await updateAirline(initialData.id, formData)
                onSuccess({ ...formData, id: initialData.id, isActive: true }) // Maintain active status or fetch fresh
            } else {
                await addAirline(formData)
                onSuccess({ ...formData, id: Math.random(), isActive: true })
            }
            onClose()
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
                    <h2 className="text-xl font-bold text-gray-900">
                        {isEdit ? 'تعديل بيانات شركة الطيران' : 'إضافة شركة طيران جديدة'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100 italic">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1 italic">IATA Code *</label>
                            <input
                                required
                                type="text"
                                maxLength={2}
                                placeholder="e.g. SV"
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم (عربي) *</label>
                            <input
                                required
                                type="text"
                                placeholder="مثلاً: الخطوط السعودية"
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-right"
                                value={formData.nameAr}
                                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Airline Name (English) *</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Saudi Arabian Airlines"
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.nameEn}
                            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-200"
                        >
                            {loading ? 'جاري الحفظ...' : (isEdit ? 'حفظ التغييرات' : 'إضافة الشركة')}
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
