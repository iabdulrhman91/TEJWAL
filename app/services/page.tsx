import { getServices } from './actions'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import ServicesTable from './ServicesTable'

export default async function ServicesPage() {
    const services = await getServices()

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold font-sans text-gray-900">كتالوج الخدمات</h1>
                    <p className="text-gray-500">إدارة قائمة الخدمات والمنتجات المتاحة للعروض</p>
                </div>
            </div>

            <ServicesTable initialServices={services} />
        </div>
    )
}
