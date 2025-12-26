import { getQuote } from '../actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Phone, MapPin, Users, Calendar, Printer } from 'lucide-react'
import PrintButton from './PrintButton'
import WhatsAppButton from './WhatsAppButton'
import QuoteStatusActions from './QuoteStatusActions'
import { getSession } from '@/lib/auth'
import AuditLogList from './AuditLogList'
import CurrencySymbol from '@/app/components/CurrencySymbol'

export default async function QuoteDetailsPage({ params }: { params: { id: string } }) {
    const quote = await getQuote(parseInt(params.id))
    const session = await getSession()

    if (!quote) {
        notFound()
    }

    // Status Badge Helpers
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200'
            case 'Sent': return 'bg-blue-100 text-blue-700 border-blue-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Approved': return 'معتمد'
            case 'Cancelled': return 'ملغي'
            case 'Sent': return 'تم الإرسال'
            default: return 'مسودة'
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto print:p-0 print:max-w-none">
            {/* Header / Actions - Hidden in Print */}
            <div className="flex justify-between items-center mb-8 print:hidden">
                <Link
                    href="/quotes"
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
                >
                    <ArrowRight size={20} />
                    <span>عودة للقائمة</span>
                </Link>
                <div className="flex gap-3 items-center">
                    {/* Edit Button - Only for Draft quotes */}
                    {quote.status === 'Draft' && (
                        <Link
                            href={`/quotes/${quote.id}/edit`}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>تعديل</span>
                        </Link>
                    )}

                    <QuoteStatusActions quoteId={quote.id} status={quote.status} userRole={session?.role} />

                    <WhatsAppButton quoteId={quote.id} phone={quote.customerPhone} status={quote.status} />

                    <a
                        href={`/api/quotes/${params.id}/pdf`}
                        target="_blank"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Printer size={20} />
                        <span>تحميل PDF</span>
                    </a>

                    <PrintButton />
                </div>
            </div>

            {/* Quote Paper */}
            <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg border print:shadow-none print:border-none print:p-0 relative overflow-hidden">

                {/* Status Badge */}
                <div className={`absolute top-8 left-8 px-4 py-1 rounded-full border text-sm font-bold print:hidden ${getStatusColor(quote.status)}`}>
                    {getStatusLabel(quote.status)}
                </div>

                {/* Letterhead */}
                <div className="flex justify-between items-start border-b pb-8 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-900 mb-2">عرض سعر</h1>
                        <div className="text-gray-500 text-sm">التاريخ: {new Date(quote.createdAt).toLocaleDateString('en-US')}</div>
                        <div className="text-gray-500 text-sm font-mono mt-1">{quote.quoteNumber}</div>

                        {/* Status for Print Only */}
                        <div className="hidden print:block mt-2 font-bold text-sm text-gray-900 border px-2 py-1 inline-block rounded">
                            الحالة: {getStatusLabel(quote.status)}
                        </div>
                    </div>
                    <div className="text-left">
                        <div className="text-2xl font-bold text-gray-900 mb-1">تجوال للسفر والسياحة</div>
                        <div className="text-gray-500 text-sm">الرياض، المملكة العربية السعودية</div>
                        <div className="text-gray-500 text-sm" dir="ltr">+966 50 000 0000</div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-8 mb-12">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">معلومات العميل</h3>
                        <div className="space-y-3">
                            <div className="text-lg font-bold text-gray-900">{quote.customerName}</div>
                            {quote.customerPhone && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone size={16} />
                                    <span dir="ltr">{quote.customerPhone}</span>
                                </div>
                            )}
                            {quote.destination && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin size={16} />
                                    <span>{quote.destination}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-left">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-left">تفاصيل الرحلة</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-end gap-2 text-gray-600">
                                <span>{quote.travelersCountAdults} بالغين، {quote.travelersCountChildren} أطفال</span>
                                <Users size={16} />
                            </div>
                            {/* Placeholder for Dates if we had them */}
                        </div>
                    </div>
                </div>

                {/* Flight Segments Table */}
                {quote.flightSegments.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                            جدول الطيران
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="p-3 font-medium">خط السير</th>
                                        <th className="p-3 font-medium">التواريخ</th>
                                        <th className="p-3 font-medium">الخطوط / النوع</th>
                                        <th className="p-3 font-medium text-center">التذاكر</th>
                                        <th className="p-3 font-medium">السعر</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {quote.flightSegments.map((segment) => (
                                        <tr key={segment.id}>
                                            <td className="p-3">
                                                <div className="font-bold">{segment.fromAirport} ← {segment.toAirport}</div>
                                                {segment.stopoverAirport && <div className="text-xs text-gray-500">توقف في: {segment.stopoverAirport}</div>}
                                            </td>
                                            <td className="p-3">
                                                <div><span className="text-gray-400 text-xs">ذهاب:</span> {segment.departureDateTime ? new Date(segment.departureDateTime).toLocaleString('en-US') : '—'}</div>
                                                {segment.flightType !== 'OneWay' && (
                                                    <div><span className="text-gray-400 text-xs">عودة:</span> {segment.arrivalDateTime ? new Date(segment.arrivalDateTime).toLocaleString('en-US') : '—'}</div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="font-medium">{segment.airline}</div>
                                                <div className="text-xs text-gray-500">
                                                    {segment.flightType === 'OneWay' ? 'ذهاب فقط' :
                                                        segment.flightType === 'RoundTrip' ? 'ذهاب وعودة' : 'وجهات متعددة'}
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">{segment.ticketCount}</td>
                                            <td className="p-3 font-bold">
                                                <div className="flex items-center gap-1 justify-end">
                                                    {segment.segmentTotal.toLocaleString('en-US')}
                                                    <CurrencySymbol className="w-3 h-3 text-gray-400" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={4} className="p-3 font-bold text-left bg-gray-50">إجمالي الطيران</td>
                                        <td className="p-3 font-bold bg-gray-50 uppercase tracking-wider">
                                            <div className="flex items-center gap-1 justify-end">
                                                {quote.totalFlights.toLocaleString('en-US')}
                                                <CurrencySymbol className="w-3 h-3 text-blue-600" />
                                            </div>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {/* Hotel Stays Table */}
                {quote.hotelStays.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
                            حجوزات الفنادق
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="p-3 font-medium">الفندق / المدينة</th>
                                        <th className="p-3 font-medium">التواريخ</th>
                                        <th className="p-3 font-medium">تفاصيل الغرفة</th>
                                        <th className="p-3 font-medium text-center">العدد</th>
                                        <th className="p-3 font-medium">السعر</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {quote.hotelStays.map((stay) => (
                                        <tr key={stay.id}>
                                            <td className="p-3">
                                                <div className="font-bold">{stay.hotelName}</div>
                                                <div className="text-xs text-gray-500">{stay.city} ({stay.hotelStars} نجوم)</div>
                                            </td>
                                            <td className="p-3">
                                                <div><span className="text-gray-400 text-xs">دخول:</span> {stay.checkInDate ? new Date(stay.checkInDate).toLocaleDateString('en-US') : '—'}</div>
                                                <div><span className="text-gray-400 text-xs">خروج:</span> {stay.checkOutDate ? new Date(stay.checkOutDate).toLocaleDateString('en-US') : '—'}</div>
                                            </td>
                                            <td className="p-3">
                                                <div>{stay.roomType || '-'}</div>
                                                <div className="text-xs text-gray-500">{stay.mealPlan || '-'}</div>
                                            </td>
                                            <td className="p-3 text-center">{stay.roomCount}</td>
                                            <td className="p-3 font-bold">
                                                <div className="flex items-center gap-1 justify-end">
                                                    {stay.stayTotal.toLocaleString('en-US')}
                                                    <CurrencySymbol className="w-3 h-3 text-gray-400" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={4} className="p-3 font-bold text-left bg-gray-50">إجمالي الفنادق</td>
                                        <td className="p-3 font-bold bg-gray-50">
                                            <div className="flex items-center gap-1 justify-end">
                                                {quote.totalHotels.toLocaleString('en-US')}
                                                <CurrencySymbol className="w-3 h-3 text-purple-600" />
                                            </div>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {/* Services Table */}
                <div className="mb-12">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                        الخدمات الإضافية
                    </h3>
                    <table className="w-full text-right">
                        <thead>
                            <tr className="border-b-2 border-gray-100">
                                <th className="py-3 text-sm font-medium text-gray-500">الخدمة</th>
                                <th className="py-3 text-sm font-medium text-gray-500 text-center">الكمية</th>
                                <th className="py-3 text-sm font-medium text-gray-500">سعر الوحدة</th>
                                <th className="py-3 text-sm font-medium text-gray-500 text-left">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-5">
                            {quote.quoteServices.map((service) => (
                                <tr key={service.id}>
                                    <td className="py-4">
                                        <div className="font-medium text-gray-900">{service.serviceName}</div>
                                        {/* <div className="text-sm text-gray-500">وصف إضافي إذا وجد</div> */}
                                    </td>
                                    <td className="py-4 text-center text-gray-600">{service.quantity}</td>
                                    <td className="py-4 text-gray-600">
                                        <div className="flex items-center gap-1">
                                            {service.unitPrice.toLocaleString('en-US')}
                                            <CurrencySymbol className="w-3 h-3 text-gray-300" />
                                        </div>
                                    </td>
                                    <td className="py-4 font-bold text-gray-900 text-left">
                                        <div className="flex items-center gap-1 justify-end">
                                            {service.serviceTotal.toLocaleString('en-US')}
                                            <CurrencySymbol className="w-3 h-3 text-gray-400" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {quote.quoteServices.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-4 text-center text-gray-400 text-sm">لا توجد خدمات إضافية</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={3} className="py-4 font-bold text-left bg-gray-50">إجمالي الخدمات</td>
                                <td className="py-4 font-bold bg-gray-50">
                                    <div className="flex items-center gap-1 justify-end">
                                        {quote.totalServices.toLocaleString('en-US')}
                                        <CurrencySymbol className="w-3 h-3 text-green-600" />
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-t-2 border-gray-900">
                                <td colSpan={3} className="py-6 text-xl font-bold text-gray-900 pt-6">الإجمالي الكلي</td>
                                <td className="py-6 text-2xl font-bold text-blue-600 text-left pt-6">
                                    <div className="flex items-center gap-1 justify-end">
                                        {quote.grandTotal.toLocaleString('en-US')}
                                        <CurrencySymbol className="w-6 h-6 text-blue-600" />
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Footer */}
                <div className="border-t pt-8 text-center text-gray-500 text-sm print:fixed print:bottom-8 print:left-0 print:right-0 print:border-none">
                    <p className="mb-2">شكراً لثقتكم بنا. هذا العرض صالح لمدة 7 أيام من تاريخه.</p>
                    <p>تجوال للسفر والسياحة - سجل تجاري: 1010000000</p>
                </div>

                {/* Print specific styles */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page { margin: 0; }
                        body { background: white; }
                        .print-btn { display: none !important; }
                    }
                `}} />
            </div>

            {/* Audit Logs - Admin Only */}
            {session?.role === 'Admin' && (
                <AuditLogList quoteId={quote.id} />
            )}
        </div>
    )
}
