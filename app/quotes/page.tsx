import { getQuotes, deleteQuote } from './actions'
import Link from 'next/link'
import { Plus, Trash2, FileText, Calendar, Users, Eye, Printer, MessageSquare, Clock } from 'lucide-react'
import QuotesFilter from './QuotesFilter'
import WhatsAppButton from './[id]/WhatsAppButton'
import CurrencySymbol from '@/app/components/CurrencySymbol'

export default async function QuotesPage({
    searchParams,
}: {
    searchParams: { query?: string, status?: string, date?: string }
}) {
    const quotes = await getQuotes(searchParams.query, searchParams.status, searchParams.date)

    const getStatusBadge = (status: string) => {
        const styles: any = {
            'Draft': 'bg-gray-100 text-gray-700 border-gray-200',
            'Sent': 'bg-blue-100 text-blue-700 border-blue-200',
            'Approved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'Cancelled': 'bg-red-100 text-red-700 border-red-200'
        }
        const labels: any = {
            'Draft': 'مسودة',
            'Sent': 'تم الإرسال',
            'Approved': 'معتمد',
            'Cancelled': 'ملغي'
        }
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles['Draft']}`}>
                {labels[status] || status}
            </span>
        )
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">لوحة إدارة العروض</h1>
                    <p className="text-gray-500">متابعة وإدارة عروض الأسعار وحالاتها</p>
                </div>
                <Link
                    href="/quotes/new"
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center gap-2 font-medium"
                >
                    <Plus size={20} />
                    <span>عرض سعر جديد</span>
                </Link>
            </div>

            <QuotesFilter />

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 text-gray-600 border-b text-sm uppercase tracking-wider">
                            <tr>
                                <th className="p-4 font-medium min-w-[120px]">رقم العرض</th>
                                <th className="p-4 font-medium min-w-[200px]">العميل</th>
                                <th className="p-4 font-medium">الوجهة</th>
                                <th className="p-4 font-medium">الإجمالي</th>
                                <th className="p-4 font-medium">الحالة</th>
                                <th className="p-4 font-medium">تاريخ الإنشاء</th>
                                <th className="p-4 font-medium text-center min-w-[180px]">إجراءات سريعة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-sm">
                            {quotes.map((quote) => (
                                <tr key={quote.id} className="hover:bg-gray-50/50 transition group">
                                    <td className="p-4 font-bold text-blue-600 font-mono">
                                        <Link href={`/quotes/${quote.id}`} className="hover:underline">
                                            {quote.quoteNumber}
                                        </Link>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-900">{quote.customerName}</div>
                                        {quote.customerPhone && (
                                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                <span dir="ltr">{quote.customerPhone}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 font-medium text-gray-700">{quote.destination || '-'}</td>
                                    <td className="p-4 font-bold text-gray-900">
                                        <div className="flex items-center gap-1 justify-end">
                                            {quote.grandTotal.toLocaleString('en-US')}
                                            <CurrencySymbol className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {getStatusBadge(quote.status)}
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        <div className="flex items-center gap-1.5" title={new Date(quote.createdAt).toLocaleString('en-US')}>
                                            <Calendar size={14} />
                                            <span>{new Date(quote.createdAt).toLocaleDateString('en-US')}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">

                                            {/* 1. Open */}
                                            <Link
                                                href={`/quotes/${quote.id}`}
                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition border border-transparent hover:border-blue-100"
                                                title="فتح"
                                            >
                                                <Eye size={18} />
                                            </Link>

                                            {/* 2. PDF */}
                                            <a
                                                href={`/api/quotes/${quote.id}/pdf`}
                                                target="_blank"
                                                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition border border-transparent hover:border-purple-100"
                                                title="PDF"
                                            >
                                                <Printer size={18} />
                                            </a>

                                            {/* 3. WhatsApp (If not locked) */}
                                            {quote.status !== 'Approved' && quote.status !== 'Cancelled' && (
                                                <div className="scale-90">
                                                    {/* We reuse the button but minimal style might be better, sticking to requested logic */}
                                                    <WhatsAppButton quoteId={quote.id} phone={quote.customerPhone} status={quote.status} />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {quotes.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-16 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-gray-50 rounded-full">
                                                <FileText size={32} className="text-gray-300" />
                                            </div>
                                            <p className="font-medium">لا توجد عروض مطابقة للبحث</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="mt-4 text-center text-xs text-gray-400">
                عرض آخر 20 نتيجة
            </div>
        </div>
    )
}
