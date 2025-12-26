'use client'

import { useState } from 'react'
import { formatPhoneDisplay } from '@/lib/phone'
import Link from 'next/link'
import { Search, Eye } from 'lucide-react'
import CurrencySymbol from '@/app/components/CurrencySymbol'

export default function CustomersTable({ initialCustomers }: { initialCustomers: any[] }) {
    const [customers] = useState(initialCustomers)
    const [searchQuery, setSearchQuery] = useState('')

    // Filter customers based on search
    const filteredCustomers = customers.filter(customer => {
        const query = searchQuery.toLowerCase()
        return (
            customer.name.toLowerCase().includes(query) ||
            customer.phone.includes(query) ||
            customer.email?.toLowerCase().includes(query) ||
            customer.company?.toLowerCase().includes(query)
        )
    })

    // Calculate stats for each customer
    const getCustomerStats = (customer: any) => {
        const totalQuotes = customer.quotes.length
        const totalSpent = customer.quotes
            .filter((q: any) => q.status === 'Approved')
            .reduce((sum: number, q: any) => sum + q.grandTotal, 0)

        return { totalQuotes, totalSpent }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border">
            {/* Search */}
            <div className="p-6 border-b">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="بحث بالاسم، الجوال، البريد، أو الشركة..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50 text-gray-600 font-medium">
                        <tr>
                            <th className="p-4">العميل</th>
                            <th className="p-4">الجوال</th>
                            <th className="p-4 text-center">العروض</th>
                            <th className="p-4 text-center">الإجمالي</th>
                            <th className="p-4 text-center">آخر عرض</th>
                            <th className="p-4 text-center">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredCustomers.map((customer) => {
                            const stats = getCustomerStats(customer)
                            return (
                                <tr key={customer.id} className="hover:bg-blue-50/50 transition">
                                    <td className="p-4 font-bold text-gray-800">
                                        <div>
                                            {customer.name}
                                            {customer.email && (
                                                <div className="text-xs text-gray-400 font-normal mt-0.5">{customer.email}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600 font-mono text-xs" dir="ltr">
                                        {formatPhoneDisplay(customer.phone)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700">
                                            {stats.totalQuotes}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center font-bold text-gray-800">
                                        <div className="flex items-center justify-center gap-1">
                                            {stats.totalSpent.toLocaleString('en-US')}
                                            <CurrencySymbol className="w-3 h-3 text-gray-400" />
                                        </div>
                                    </td>
                                    <td className="p-4 text-center text-gray-500 text-xs">
                                        {customer.lastQuoteDate
                                            ? new Date(customer.lastQuoteDate).toLocaleDateString('en-GB')
                                            : '-'
                                        }
                                    </td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <Link
                                            href={`/admin/customers/${customer.id}`}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="عرض التفاصيل"
                                        >
                                            <Eye size={18} />
                                        </Link>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {filteredCustomers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد عملاء بعد'}
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="p-4 border-t bg-gray-50 text-xs text-gray-500">
                إجمالي العملاء: <span className="font-bold text-gray-900">{filteredCustomers.length}</span>
                {searchQuery && ` (من أصل ${customers.length})`}
            </div>
        </div>
    )
}
