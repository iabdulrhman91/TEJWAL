import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getServices } from './actions'
import ServicesTable from './ServicesTable'

export default async function ServicesPage() {
    const session = await getSession()
    if (!session || session.role !== 'Admin') {
        redirect('/quotes')
    }

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
