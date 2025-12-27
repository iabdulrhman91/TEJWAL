import { Suspense } from 'react'
import { Building2 } from 'lucide-react'
import { getSuppliers } from './actions'
import SupplierTable from './SupplierTable'

export default async function SuppliersPage() {
    const { data: suppliers } = await getSuppliers()

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                            <Building2 size={32} />
                        </span>
                        إدارة الموردين
                    </h1>
                    <p className="mt-2 text-gray-500 mr-16">تحكم في قائمة مزودي الخدمات (طيران، فنادق، إلخ) وصلاحياتهم - محدث</p>
                </div>
            </div>

            <Suspense fallback={<div className="text-center py-12 text-gray-400">جاري التحميل...</div>}>
                <SupplierTable initialSuppliers={suppliers || []} />
            </Suspense>
        </div>
    )
}
