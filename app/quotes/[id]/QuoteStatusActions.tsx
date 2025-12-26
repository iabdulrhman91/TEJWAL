'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { approveQuote, cancelQuote } from '../actions'

export default function QuoteStatusActions({ quoteId, status, userRole }: { quoteId: number, status: string, userRole?: string }) {
    const [isLoading, setIsLoading] = useState(false)

    // Helper to handle actions
    const handleAction = async (action: 'approve' | 'cancel') => {
        const isApprove = action === 'approve'
        const message = isApprove
            ? 'هل أنت متأكد من اعتماد هذا العرض؟ لن تتمكن من تعديله بعد الانتهاء.'
            : 'هل أنت متأكد من إلغاء هذا العرض؟'

        if (!confirm(message)) return

        setIsLoading(true)
        try {
            if (isApprove) {
                await approveQuote(quoteId)
            } else {
                await cancelQuote(quoteId)
            }
        } catch (error) {
            console.error(error)
            alert('حدث خطأ أثناء تحديث الحالة')
        } finally {
            setIsLoading(false)
        }
    }

    // Don't show buttons if cancelled or approved (depending on logic, approved might just want to hide approve button)
    // Req: Approve button (Draft/Sent), Cancel button (Not Cancelled)

    // logic:
    // Show Approve IF status is 'Draft' or 'Sent'
    // Show Cancel IF status is NOT 'Cancelled'

    const isAdmin = userRole === 'Admin'
    const showApprove = isAdmin && ['Draft', 'Sent'].includes(status)
    const showCancel = isAdmin && status !== 'Cancelled'

    if (!showApprove && !showCancel) return null

    return (
        <div className="flex gap-2">
            {showApprove && (
                <button
                    onClick={() => handleAction('approve')}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                    <span>اعتماد</span>
                </button>
            )}

            {showCancel && (
                <button
                    onClick={() => handleAction('cancel')}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <XCircle size={20} />}
                    <span>إلغاء</span>
                </button>
            )}
        </div>
    )
}
