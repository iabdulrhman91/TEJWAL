'use client'

import { useState } from 'react'
import { addAirport } from './actions'

export default function AddAirportModal({
    isOpen,
    onClose,
    onSuccess
}: {
    isOpen: boolean,
    onClose: () => void,
    onSuccess: (airport: any) => void
}) {
    const [formData, setFormData] = useState({
        code: '',
        cityAr: '',
        cityEn: '',
        countryAr: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const result = await addAirport(formData)
            onSuccess({ ...formData, id: Math.random(), isActive: true }) // Simplified for UI update
            setFormData({ code: '', cityAr: '', cityEn: '', countryAr: '' })
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء إضافة المطار')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-900">إضافة مطار جديد</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1 italic">IATA Code *</label>
                            <input
                                required
                                type="text"
                                maxLength={3}
                                placeholder="e.g. RUH"
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">المدينة (عربي) *</label>
                            <input
                                required
                                type="text"
                                placeholder="مثلاً: الرياض"
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-right"
                                value={formData.cityAr}
                                onChange={(e) => setFormData({ ...formData, cityAr: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City Name (English) *</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Riyadh"
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.cityEn}
                            onChange={(e) => setFormData({ ...formData, cityEn: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الدولة (اختياري)</label>
                        <input
                            type="text"
                            placeholder="مثلاً: السعودية"
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-right"
                            value={formData.countryAr}
                            onChange={(e) => setFormData({ ...formData, countryAr: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-200"
                        >
                            {loading ? 'جاري الإضافة...' : 'إضافة المطار'}
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
