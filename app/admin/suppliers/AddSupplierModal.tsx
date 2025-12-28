'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Check, Building2, Plane, Hotel } from 'lucide-react'
import { createSupplier, updateSupplier } from './actions'

interface SupplierData {
    id: number
    name: string
    supportsFlights: boolean
    supportsHotels: boolean
    supportsServices: boolean
}

interface AddSupplierModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    initialData?: SupplierData | null
}

export default function AddSupplierModal({ isOpen, onClose, onSuccess, initialData }: AddSupplierModalProps) {
    const [name, setName] = useState('')
    const [supportsFlights, setSupportsFlights] = useState(false)
    const [supportsHotels, setSupportsHotels] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (initialData) {
            setName(initialData.name)
            setSupportsFlights(initialData.supportsFlights)
            setSupportsHotels(initialData.supportsHotels)
        } else {
            setName('')
            setSupportsFlights(false)
            setSupportsHotels(false)
        }
    }, [initialData, isOpen])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (initialData) {
                await updateSupplier(initialData.id, {
                    name,
                    supportsFlights,
                    supportsHotels,
                    supportsServices: initialData.supportsServices // Preserve existing value or add field if needed
                })
            } else {
                await createSupplier({
                    name,
                    supportsFlights,
                    supportsHotels,
                    supportsServices: false
                })
            }
            onSuccess?.()
            onClose()
            if (!initialData) {
                setName('')
                setSupportsFlights(false)
                setSupportsHotels(false)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const isEdit = !!initialData

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Building2 className="text-blue-600" />
                        {isEdit ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">اسم المورد</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="مثال: Amadeus, Booking..."
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700">خدمات المورد</label>

                        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${supportsFlights ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="checkbox" checked={supportsFlights} onChange={e => setSupportsFlights(e.target.checked)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                            <Plane size={20} />
                            <span className="font-bold">حجوزات طيران</span>
                        </label>

                        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${supportsHotels ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="checkbox" checked={supportsHotels} onChange={e => setSupportsHotels(e.target.checked)} className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500" />
                            <Hotel size={20} />
                            <span className="font-bold">حجوزات فنادق</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading || !name}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={20} />}
                            {isEdit ? 'حفظ التغييرات' : 'حفظ المورد'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
