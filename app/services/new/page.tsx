import { createService } from '../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewServicePage() {
    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/services" className="p-2 hover:bg-gray-100 rounded-full transition">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold">إضافة خدمة جديدة</h1>
            </div>

            <form action={createService} className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        اسم الخدمة
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        placeholder="مثال: حجز طيران داخلي"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                </div>

                <div>
                    <label htmlFor="defaultUnitPrice" className="block text-sm font-medium text-gray-700 mb-1">
                        السعر الافتراضي (اختياري)
                    </label>
                    <input
                        type="number" lang="en" dir="ltr"
                        step="0.01"
                        name="defaultUnitPrice"
                        id="defaultUnitPrice"
                        placeholder="0.00"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="isActive"
                        id="isActive"
                        defaultChecked
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        مفعّل (يظهر في القوائم)
                    </label>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Link
                        href="/services"
                        className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                    >
                        إلغاء
                    </Link>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                    >
                        حفظ الخدمة
                    </button>
                </div>
            </form>
        </div>
    )
}
