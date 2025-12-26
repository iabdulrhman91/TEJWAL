'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2 print-btn"
        >
            <Printer size={20} />
            <span>طباعة العرض</span>
        </button>
    )
}
