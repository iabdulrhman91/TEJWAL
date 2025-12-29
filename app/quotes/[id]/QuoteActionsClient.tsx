'use client'

import React, { useEffect } from 'react'
import { Printer } from 'lucide-react'

interface QuoteActionsClientProps {
    quote: any
}

export default function QuoteActionsClient({ quote }: QuoteActionsClientProps) {

    // Set Page Title for correct PDF Filename
    useEffect(() => {
        const firstName = quote.customerName?.split(' ')[0] || 'عميل'
        const dest = quote.destination
        const title = `عرض ${firstName}${dest ? ' إلى ' + dest : ''}`
        document.title = title
    }, [quote])

    return (
        <div className="flex gap-2">
            <button
                onClick={() => window.print()}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition shadow-blue-200 shadow-md text-sm font-bold print:hidden"
            >
                <Printer size={18} />
                <span>طباعة / حفظ PDF</span>
            </button>
        </div>
    )
}
