import { getCustomer } from '@/app/customers/actions'
import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { formatPhoneDisplay } from '@/lib/phone'
import Link from 'next/link'
import { ArrowRight, Phone, Mail, Building2, Calendar } from 'lucide-react'
import EditCustomerForm from './EditCustomerForm'
import CurrencySymbol from '@/app/components/CurrencySymbol'

export default async function CustomerDetailsPage({ params }: { params: { id: string } }) {
    const session = await getSession()

    if (!session || session.role !== 'Admin') {
        redirect('/')
    }

    const customer = await getCustomer(parseInt(params.id))

    if (!customer) {
        notFound()
    }

    // Calculate stats
    const totalQuotes = customer.quotes.length
    const approvedQuotes = customer.quotes.filter(q => q.status === 'Approved')
    const totalSpent = approvedQuotes.reduce((sum, q) => sum + q.grandTotal, 0)
    const avgQuoteValue = totalQuotes > 0 ? customer.quotes.reduce((sum, q) => sum + q.grandTotal, 0) / totalQuotes : 0

    return (
        <div className="max-w-7xl mx-auto p-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin/customers"
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-4"
                >
                    <ArrowRight size={20} />
                    <span>عودة للقائمة</span>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                <p className="text-gray-500 mt-1">تفاصيل العميل وسجل العروض</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Customer Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Contact Card */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-bold mb-4">معلومات الاتصال</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Phone className="text-gray-400" size={20} />
                                <div>
                                    <div className="text-xs text-gray-500">الجوال</div>
                                    <div className="font-mono" dir="ltr">{formatPhoneDisplay(customer.phone)}</div>
                                </div>
                            </div>
                            {customer.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="text-gray-400" size={20} />
                                    <div>
                                        <div className="text-xs text-gray-500">البريد الإلكتروني</div>
                                        <div dir="ltr">{customer.email}</div>
                                    </div>
                                </div>
                            )}
                            {customer.company && (
                                <div className="flex items-center gap-3">
                                    <Building2 className="text-gray-400" size={20} />
                                    <div>
                                        <div className="text-xs text-gray-500">الشركة</div>
                                        <div>{customer.company}</div>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Calendar className="text-gray-400" size={20} />
                                <div>
                                    <div className="text-xs text-gray-500">تاريخ التسجيل</div>
                                    <div>{new Date(customer.createdAt).toLocaleDateString('en-US')}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-bold mb-4">الإحصائيات</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-gray-500">إجمالي العروض</div>
                                <div className="text-2xl font-bold text-blue-600">{totalQuotes}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">العروض المعتمدة</div>
                                <div className="text-2xl font-bold text-green-600">{approvedQuotes.length}</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                                    {totalSpent.toLocaleString('en-US')}
                                    <CurrencySymbol className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <div className="text-xl font-bold text-gray-700 flex items-center gap-1">
                                    {avgQuoteValue.toLocaleString('en-US')}
                                    <CurrencySymbol className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <EditCustomerForm customer={customer} />
                </div>

                {/* Quotes History */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border">
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-bold">سجل العروض</h2>
                        </div>
                        <div className="divide-y">
                            {customer.quotes.map((quote) => (
                                <Link
                                    key={quote.id}
                                    href={`/quotes/${quote.id}`}
                                    className="block p-6 hover:bg-gray-50 transition"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-gray-900">{quote.quoteNumber}</div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                بواسطة: {quote.createdBy.name}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {new Date(quote.createdAt).toLocaleDateString('en-US')}
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-lg font-bold text-gray-900 flex items-center justify-end gap-1">
                                                {quote.grandTotal.toLocaleString('en-US')}
                                                <CurrencySymbol className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${quote.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                quote.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                                                    quote.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {quote.status === 'Approved' ? 'معتمد' :
                                                    quote.status === 'Sent' ? 'مُرسل' :
                                                        quote.status === 'Cancelled' ? 'ملغي' :
                                                            'مسودة'}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {customer.quotes.length === 0 && (
                                <div className="p-12 text-center text-gray-500">
                                    لا توجد عروض لهذا العميل بعد
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
