'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createCountry } from './actions'

interface AddCountryModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AddCountryModal({ isOpen, onClose, onSuccess }: AddCountryModalProps) {
    const [nameAr, setNameAr] = useState('')
    const [nameEn, setNameEn] = useState('')
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await createCountry(nameAr, code)
            onSuccess()
            onClose()
            setNameAr('')
            setNameEn('')
            setCode('')
        } catch (error) {
            alert('حدث خطأ أثناء الإضافة')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">إضافة وجهة جديدة</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم الوجهة (عربي) <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="text"
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="مثلاً: سنغافورة"
                            value={nameAr}
                            onChange={e => setNameAr(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">كود الدولة (ISO Code) <span className="text-red-500">*</span></label>
                        <input
                            required
                            type="text"
                            maxLength={3}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                            placeholder="مثلاً: SA, QA, AE"
                            value={code}
                            onChange={e => setCode(e.target.value.toUpperCase())}
                        />
                    </div>
                    {/* Placeholder for English name if we update backend later 
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">اسم الوجهة (إنجليزي)</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="e.g. Singapore"
                            value={nameEn}
                            onChange={e => setNameEn(e.target.value)}
                        />
                    </div>
                    */}

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? 'جاري الإضافة...' : 'إضافة الوجهة'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
