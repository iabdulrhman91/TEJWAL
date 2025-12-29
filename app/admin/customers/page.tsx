import { getCustomers } from '@/app/customers/actions'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CustomersTable from './CustomersTable'

export default async function CustomersPage() {
    const session = await getSession()

    if (!session) {
        redirect('/')
    }

    const customers = await getCustomers()

    return (
        <div className="max-w-7xl mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">إدارة العملاء</h1>
                <p className="text-gray-500 mt-1">عرض وإدارة جميع عملاء النظام</p>
            </div>

            <CustomersTable initialCustomers={customers} />
        </div>
    )
}
