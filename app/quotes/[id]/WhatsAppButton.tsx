'use client'

import { Share2 } from 'lucide-react'

interface WhatsAppButtonProps {
    quote: any
}

export default function WhatsAppButton({ quote }: WhatsAppButtonProps) {
    const handleWhatsAppShare = () => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        const quoteUrl = `${baseUrl}/quotes/${quote.id}`

        let message = `مرحباً ${quote.customerName}،\n`
        message += `إليك عرض السعر الخاص برحلتك إلى ${quote.destination || 'وجهتك المختارة'}:\n\n`
        message += `رقم العرض: #${quote.quoteNumber}\n`

        if (quote.flightSegments.length > 0) {
            message += `✈️ الطيران:\n`
            quote.flightSegments.forEach((seg: any) => {
                message += `- من ${seg.fromAirport} إلى ${seg.toAirport} (${seg.airline})\n`
            })
            message += `\n`
        }

        if (quote.hotelStays.length > 0) {
            message += `🏨 الفنادق:\n`
            quote.hotelStays.forEach((stay: any) => {
                message += `- ${stay.hotelName} (${stay.city})\n`
            })
            message += `\n`
        }

        message += `💰 الإجمالي: ${quote.grandTotal.toLocaleString('en-US')} SAR\n\n`
        message += `تفاصيل العرض كاملة:\n${quoteUrl}\n\n`
        message += `نتمنى لك رحلة سعيدة!`

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
    }

    return (
        <button
            onClick={handleWhatsAppShare}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2 transition shadow-sm"
        >
            <Share2 size={18} />
            <span className="hidden md:inline">واتساب</span>
        </button>
    )
}
