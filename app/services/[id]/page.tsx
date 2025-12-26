import { updateService, getService } from '../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function EditServicePage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id)
    const service = await getService(id)

    if (!service) {
        notFound()
    }

    const updateServiceWithId = updateService.bind(null, id)

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/services" className="p-2 hover:bg-gray-100 rounded-full transition">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold">تعديل الخدمة</h1>
            </div>

            <form action={updateServiceWithId} className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        اسم الخدمة
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        defaultValue={service.name}
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
                        defaultValue={service.defaultUnitPrice || ''}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="isActive"
                        id="isActive"
                        defaultChecked={service.isActive}
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
                        حفظ التغييرات
                    </button>
                </div>
            </form>
        </div>
    )
}
