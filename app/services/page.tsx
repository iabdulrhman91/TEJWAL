import { getServices } from './actions'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import ServicesTable from './ServicesTable'

export default async function ServicesPage() {
    const services = await getServices()

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                    كتالوج الخدمات
                </h1>
                <Link
                    href="/services/new"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition shadow-sm"
                >
                    <Plus size={18} />
                    <span>إضافة خدمة جديدة</span>
                </Link>
            </div>

            <ServicesTable initialServices={services} />
        </div>
    )
}
