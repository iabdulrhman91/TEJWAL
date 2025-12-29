import React from 'react'
import { getQuote } from '../actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Printer, Share2, Phone, MapPin, Mail, Globe, MessageCircle } from 'lucide-react'
import QuoteStatusActions from './QuoteStatusActions'
import { getSession } from '@/lib/auth'
import AuditLogList from './AuditLogList'
import CurrencySymbol from '@/app/components/CurrencySymbol'
import QuoteActionsClient from './QuoteActionsClient'
import AutoPrint from '@/app/components/AutoPrint'
import { differenceInCalendarDays } from 'date-fns'

export default async function QuoteDetailsPage({ params, searchParams }: { params: { id: string }, searchParams?: { print?: string } }) {
    const rawQuote = await getQuote(parseInt(params.id))
    const session = await getSession()

    if (!rawQuote) {
        notFound()
    }

    // Cast to any to handle newly added fields
    const quote = rawQuote as any

    // Check edit permission
    const canEdit = session?.role === 'Admin' || (session?.id && quote.createdByUserId === parseInt(session.id))

    // Calculate Passengers String
    const pax = []
    if (quote.travelersCountAdults > 0) pax.push(`${quote.travelersCountAdults} بالغ`)
    if (quote.travelersCountChildren > 0) pax.push(`${quote.travelersCountChildren} طفل`)
    if (quote.travelersCountInfants > 0) pax.push(`${quote.travelersCountInfants} رضيع`)
    const passengersStr = pax.join('، ') || '1 بالغ'

    return (
        <div className="min-h-screen bg-gray-100 py-8 print:py-0 print:bg-white" dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            <div className="max-w-[210mm] mx-auto print:max-w-none print:w-full">
                {searchParams?.print === 'true' && <AutoPrint />}

                {/* Actions Bar (Hidden in Print) */}
                <div className="flex flex-col md:flex-row justify-start items-center mb-8 gap-4 px-4 md:px-0 print:hidden" dir="rtl">
                    <div className="flex gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200 items-center">
                        <Link
                            href="/quotes"
                            className="text-gray-600 hover:text-blue-600 transition flex items-center gap-2 font-medium px-2 text-sm"
                        >
                            <span>&rarr; عودة للقائمة</span>
                        </Link>

                        <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>

                        {quote.status === 'Draft' && canEdit && (
                            <Link
                                href={`/quotes/${quote.id}/edit`}
                                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition"
                            >
                                تعديل
                            </Link>
                        )}
                        <QuoteStatusActions quoteId={quote.id} status={quote.status} userRole={session?.role} isOwner={canEdit} />
                        <QuoteActionsClient quote={quote} />
                    </div>
                </div>

                {/* THE QUOTE PAPER (A4 Styles - Premium Version) */}
                <div id="quote-content" className="bg-white shadow-xl mx-auto overflow-hidden relative min-h-[297mm] text-[#000]" style={{ width: '210mm' }}>

                    {/* Header */}
                    <div className="flex justify-between items-center px-10 py-6 border-b-2 border-gray-100 mb-2">
                        {/* 1. Info (Right in RTL) */}
                        {/* 1. Info (Right in RTL) */}
                        <div className="text-right text-xs text-gray-600 leading-snug w-[150px]">
                            <div className="text-right font-bold text-blue-900 mb-1.5 text-base">تجوال للسياحة</div>
                            <div className="flex items-center justify-end gap-1.5 text-gray-700" dir="ltr">
                                <Phone size={14} className="text-gray-500" />
                                <MessageCircle size={14} className="text-green-600" />
                                <span className="font-bold tracking-wide">0172227999</span>
                            </div>
                        </div>

                        {/* 2. Title (Center) */}
                        <div className="flex-grow text-center">
                            <h1 className="text-2xl text-gray-900 uppercase font-extrabold m-0">عرض السفر</h1>
                        </div>

                        {/* 3. Logo (Left in RTL) */}
                        <div className="w-[150px] text-left">
                            <img src="/logo.png" alt="Tejwal Travel" className="max-w-full h-auto max-h-[80px]" />
                        </div>
                    </div>

                    {/* Info Bar */}
                    <div className="bg-gray-50 px-10 py-3 flex justify-between items-center border-y border-gray-200 mb-5">
                        <div className="flex gap-8">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-gray-500 font-bold mb-0.5">العميل</span>
                                <span className="text-xs font-bold text-gray-800">{quote.customerName}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-gray-500 font-bold mb-0.5">المسافرين</span>
                                <span className="text-xs font-bold text-gray-800">{passengersStr}</span>
                            </div>
                            {quote.destination && (
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-gray-500 font-bold mb-0.5">الوجهة</span>
                                    <span className="text-xs font-bold text-gray-800">{quote.destination}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-8 text-left" dir="ltr">
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] text-gray-500 font-bold mb-0.5">رقم العرض</span>
                                <span className="text-xs font-bold text-gray-800" dir="ltr">#{quote.quoteNumber}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] text-gray-500 font-bold mb-0.5">التاريخ</span>
                                <span className="text-xs font-bold text-gray-800" dir="ltr">
                                    {new Date(quote.createdAt).toLocaleDateString("en-GB")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="px-10">

                        {/* FLIGHTS SECTION */}
                        {quote.flightSegments.length > 0 && (
                            <div className="mb-5">
                                <h3 className="text-sm font-bold mb-2 pb-1 border-b-2 border-gray-200 text-blue-800">رحلات الطيران</h3>
                                <table className="w-full text-right border-collapse text-[11px]">
                                    <thead className="bg-gray-100 text-gray-700 font-bold">
                                        <tr>
                                            <th className="p-2 rounded-r-md">خط السير</th>
                                            <th className="p-2">شركة الطيران</th>
                                            <th className="p-2">المغادرة / الوصول</th>
                                            <th className="p-2 rounded-l-md whitespace-nowrap">الدرجة / الوزن / العدد</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quote.flightSegments.map((seg: any) => {
                                            const clean = (s: any) => s ? s.replace(/^[A-Z]{3}\s*-\s*/, '').replace(/\s*-\s*[A-Z]{3}$/, '').replace(/\s*\([A-Z]{3}\)/, '').trim() : '';
                                            const dateOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };

                                            const formatDuration = (h: any) => {
                                                if (!h) return '';
                                                const num = parseFloat(h);
                                                if (isNaN(num)) return '';

                                                // Check for simple half-hour increments
                                                if (num === 0.5) return 'نصف ساعة';

                                                const intPart = Math.floor(num);
                                                const decimalPart = num - intPart;

                                                let str = "";
                                                if (intPart === 1) str = "ساعة";
                                                else if (intPart === 2) str = "ساعتين";
                                                else if (intPart > 2 && intPart <= 10) str = `${intPart} ساعات`;
                                                else str = `${intPart} ساعة`;

                                                if (decimalPart === 0.5) str += " ونصف";
                                                else if (decimalPart > 0) return `${num}س`; // Fallback for non-half increments

                                                return str;
                                            };

                                            return (
                                                <React.Fragment key={seg.id}>
                                                    {/* Outbound Row */}
                                                    <tr className="border-b border-gray-100">
                                                        {/* Route Cell */}
                                                        <td className="p-3 w-[35%] align-middle">
                                                            {/* Date */}
                                                            <div className="text-[11px] font-bold text-gray-800 mb-1 text-right">
                                                                {seg.departureDateTime ? new Date(seg.departureDateTime).toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                                                            </div>
                                                            <div className="flex items-center justify-start gap-0">
                                                                <span className="font-bold text-[13px] text-gray-800 w-[60px] text-right truncate">
                                                                    {clean(seg.fromAirport)}
                                                                </span>

                                                                <div className="flex items-center justify-center relative mx-2">
                                                                    <div className="w-[80px] h-[2px] bg-gray-200"></div>
                                                                    <div className="absolute text-blue-600 text-[16px] bg-white px-1.5 flex items-center justify-center h-[20px]" style={{ transform: 'scaleX(-1)' }}>
                                                                        ✈
                                                                    </div>
                                                                </div>

                                                                <span className="font-bold text-[13px] text-gray-800 w-[60px] text-right truncate">
                                                                    {clean(seg.toAirport)}
                                                                </span>
                                                            </div>
                                                            {seg.stopoverAirport && (
                                                                <div className="mt-2 text-[10px] text-gray-500">
                                                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                                                        توقف في {clean(seg.stopoverAirport)}
                                                                        {seg.stopoverTime ? ` لمدة ${formatDuration(seg.stopoverTime)}` : ''}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* Airline */}
                                                        <td className="p-3 w-[20%] font-bold text-gray-800 align-middle">
                                                            {seg.airline}
                                                        </td>

                                                        {/* Times */}
                                                        <td className="p-3 w-[25%] align-middle text-right">
                                                            <div className="flex justify-start gap-2 mb-1" dir="rtl">
                                                                <span className="text-[10px] text-gray-500 w-[40px] shrink-0">إقلاع:</span>
                                                                <span className="font-bold text-gray-800">
                                                                    {seg.departureDateTime ? new Date(seg.departureDateTime).toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit' }) : '---'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-start gap-2" dir="rtl">
                                                                <span className="text-[10px] text-gray-500 w-[40px] shrink-0">وصول:</span>
                                                                <span className="font-bold text-gray-800">
                                                                    {seg.arrivalDateTime ? new Date(seg.arrivalDateTime).toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit' }) : '---'}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Class/Weight */}
                                                        <td className="p-3 w-[20%] align-middle">
                                                            <div className="font-semibold mb-1">{seg.cabinClass === 'Business' ? 'رجال أعمال' : 'سياحية'}</div>
                                                            <div className="text-[10px] text-gray-500" dir="rtl">
                                                                {seg.weight ? `${seg.weight} كجم` : '23 كجم'}
                                                                <span className="mx-1 text-gray-300">|</span>
                                                                <span className="text-blue-600 font-bold">{seg.ticketCount || 1} تذاكر</span>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* Return Row (if exists) */}
                                                    {seg.returnDepartureDateTime && (
                                                        <tr className="border-b border-gray-100 bg-blue-50/30">
                                                            <td className="p-3 w-[35%] align-middle">
                                                                {/* Date */}
                                                                <div className="text-[11px] font-bold text-gray-800 mb-1 text-right">
                                                                    {new Date(seg.returnDepartureDateTime).toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                                </div>
                                                                <div className="flex items-center justify-start gap-0">
                                                                    <span className="font-bold text-[13px] text-gray-800 w-[60px] text-right truncate">
                                                                        {clean(seg.returnFromAirport || seg.toAirport)}
                                                                    </span>

                                                                    <div className="flex items-center justify-center relative mx-2">
                                                                        <div className="w-[80px] h-[2px] bg-gray-200"></div>
                                                                        <div className="absolute text-blue-600 text-[16px] bg-white px-1.5 flex items-center justify-center h-[20px]" style={{ transform: 'scaleX(-1)' }}>
                                                                            ✈
                                                                        </div>
                                                                    </div>

                                                                    <span className="font-bold text-[13px] text-gray-800 w-[60px] text-right truncate">
                                                                        {clean(seg.returnToAirport || seg.fromAirport)}
                                                                    </span>
                                                                </div>
                                                                {seg.returnStopoverAirport && (
                                                                    <div className="mt-2 text-[10px] text-gray-500">
                                                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                                                            توقف في {clean(seg.returnStopoverAirport)}
                                                                            {seg.returnStopoverTime ? ` لمدة ${formatDuration(seg.returnStopoverTime)}` : ''}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </td>

                                                            <td className="p-3 w-[20%] font-bold text-gray-800 align-middle">
                                                                {seg.returnAirline || seg.airline}
                                                            </td>

                                                            <td className="p-3 w-[25%] align-middle text-right">
                                                                <div className="flex justify-start gap-2 mb-1" dir="rtl">
                                                                    <span className="text-[10px] text-gray-500 w-[40px] shrink-0">إقلاع:</span>
                                                                    <span className="font-bold text-gray-800">
                                                                        {new Date(seg.returnDepartureDateTime).toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-start gap-2" dir="rtl">
                                                                    <span className="text-[10px] text-gray-500 w-[40px] shrink-0">وصول:</span>
                                                                    <span className="font-bold text-gray-800">
                                                                        {seg.returnArrivalDateTime ? new Date(seg.returnArrivalDateTime).toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit' }) : '---'}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            <td className="p-3 w-[20%] align-middle">
                                                                <div className="font-semibold mb-1">{(seg.returnCabinClass || seg.cabinClass) === 'Business' ? 'رجال أعمال' : 'سياحية'}</div>
                                                                <div className="text-[10px] text-gray-500" dir="rtl">
                                                                    {seg.returnWeight ? `${seg.returnWeight} كجم` : (seg.weight ? `${seg.weight} كجم` : '23 كجم')}
                                                                    <span className="mx-1 text-gray-300">|</span>
                                                                    <span className="text-blue-600 font-bold">{seg.ticketCount || 1} تذاكر</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* HOTELS SECTION */}
                        {quote.hotelStays.length > 0 && (
                            <div className="mb-5">
                                <h3 className="text-sm font-bold mb-2 pb-1 border-b-2 border-gray-200 text-blue-800">الفنادق والإقامة</h3>
                                {quote.hotelStays.map((stay: any) => {
                                    const calculatedNights = (stay.checkInDate && stay.checkOutDate) ? Math.max(0, differenceInCalendarDays(new Date(stay.checkOutDate), new Date(stay.checkInDate))) : 0;
                                    const nights = calculatedNights > 0 ? calculatedNights : (stay.nights || 1);

                                    return (
                                        <div key={stay.id} className="flex justify-between items-start p-2.5 bg-gray-50 rounded-md mb-1.5 border-b border-gray-100 break-inside-avoid">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center text-lg">
                                                    🏨
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[13px] text-gray-900 mb-0.5">{stay.hotelName}</div>
                                                    <div className="text-[11px] text-gray-500 mb-1">
                                                        {stay.city} | {stay.roomType || 'غرفة قياسية'}
                                                    </div>

                                                    {/* Dates */}
                                                    <div className="text-[10px] text-gray-600 mb-1">
                                                        <span className="font-bold">دخول:</span> <span className="ltr mx-1">{stay.checkInDate ? new Date(stay.checkInDate).toLocaleDateString('en-GB') : '-'}</span>
                                                        |
                                                        <span className="font-bold mr-1">خروج:</span> <span className="ltr mx-1">{stay.checkOutDate ? new Date(stay.checkOutDate).toLocaleDateString('en-GB') : '-'}</span>
                                                    </div>

                                                    <div className="flex gap-2 items-center">
                                                        {/* Stars */}
                                                        {stay.hotelStars > 0 && (
                                                            <div className="text-yellow-500 text-[10px]">
                                                                {Array(stay.hotelStars).fill('★').join('')}
                                                            </div>
                                                        )}
                                                        {/* Room Count */}
                                                        <div className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">
                                                            عدد الوحدات: {stay.roomCount || 1}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-md font-bold text-[11px]">
                                                {nights} ليالي
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* SERVICES SECTION */}
                        {quote.quoteServices.length > 0 && (
                            <div className="mb-5">
                                <h3 className="text-sm font-bold mb-2 pb-1 border-b-2 border-gray-200 text-blue-800">خدمات أخرى</h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {quote.quoteServices.map((svc: any) => (
                                        <div key={svc.id} className="bg-gray-100 px-4 py-1.5 rounded-2xl text-[11px] text-gray-800 font-medium">
                                            ✨ {svc.serviceName} {svc.quantity > 1 && <span className="text-blue-600 font-bold mx-0.5">({svc.quantity}x)</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TOTAL */}
                        <div className="mt-8 bg-blue-600 text-white p-4 rounded-lg flex justify-between items-center shadow-lg">
                            <div className="font-bold text-sm">السعر الإجمالي (شامل الضريبة)</div>
                            <div>
                                <span className="text-2xl font-extrabold tracking-tight" dir="ltr">{quote.grandTotal.toLocaleString('en-US')}</span>
                                <span className="inline-flex items-center justify-center mr-2">
                                    <CurrencySymbol className="w-5 h-5 text-blue-200" />
                                </span>
                            </div>
                        </div>

                        {/* Bottom Separator Line */}
                        <div className="mt-10 border-t border-gray-200 w-full opacity-50"></div>
                        <div className="h-8"></div>

                    </div>



                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
                
                @media print {
                    @page { 
                        margin: 10mm 0 10mm 0;
                        size: A4; 
                    }
                    @page :first {
                        margin-top: 0;
                    }
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: white; margin: 0 !important; padding: 0 !important; }

                    /* HIDE UI ELEMENTS */
                    nav, header, aside, .sidebar, .navbar, .no-print { display: none !important; }

                    /* PREVENT CUTTING */
                    .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
                    tr, .card-item { break-inside: avoid; page-break-inside: avoid; }
                }
            `}} />
        </div>
    )
}
