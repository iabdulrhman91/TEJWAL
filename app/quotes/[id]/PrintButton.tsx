'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition shadow-blue-200 shadow-lg text-sm font-medium"
        >
            <Printer size={16} />
            <span>طباعة / PDF</span>
        </button>
    )
}
