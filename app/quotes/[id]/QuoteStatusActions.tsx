'use client'
import { useState } from 'react'
import { CheckCircle2, XCircle, Loader2, Send, RotateCcw } from 'lucide-react'
import { approveQuote, cancelQuote, markAsSent, revertToDraft } from '../actions'

export default function QuoteStatusActions({ quoteId, status, userRole, isOwner }: { quoteId: number, status: string, userRole?: string, isOwner: boolean }) {
    const [isLoading, setIsLoading] = useState(false)

    // Helper to handle actions
    const handleAction = async (action: 'approve' | 'cancel' | 'send' | 'revert') => {
        let message = ''
        switch (action) {
            case 'approve': message = 'هل أنت متأكد من اعتماد هذا العرض؟'; break;
            case 'cancel': message = 'هل أنت متأكد من إلغاء هذا العرض؟'; break;
            case 'send': message = 'هل قمت بإرسال العرض للعميل؟ سيتم تغيير الحالة إلى "تم الإرسال".'; break;
            case 'revert': message = 'هل تريد إعادة العرض للمسودة للتعديل عليه؟'; break;
        }

        if (!confirm(message)) return

        setIsLoading(true)
        try {
            if (action === 'approve') await approveQuote(quoteId)
            else if (action === 'cancel') await cancelQuote(quoteId)
            else if (action === 'send') await markAsSent(quoteId)
            else if (action === 'revert') await revertToDraft(quoteId)
        } catch (error) {
            console.error(error)
            alert('حدث خطأ أثناء تحديث الحالة')
        } finally {
            setIsLoading(false)
        }
    }

    // Logic:
    // Actions are available to Admin OR Quote Owner
    // 1. Mark as Sent: Available if status is 'Draft' AND (Admin or Owner)
    // 2. Approve: Available if status is 'Draft' or 'Sent' AND (Admin or Owner)
    // 3. Cancel: Available if not Cancelled AND (Admin or Owner)
    // 4. Revert to Draft: Available if 'Sent' or 'Approved' AND (Admin or Owner)

    const isAdmin = userRole === 'Admin'
    const isAuthorized = isAdmin || isOwner

    const showApprove = isAuthorized && ['Draft', 'Sent'].includes(status)
    const showCancel = isAuthorized && status !== 'Cancelled'
    const showSend = isAuthorized && status === 'Draft'
    const showRevert = isAuthorized && ['Sent', 'Approved', 'Cancelled'].includes(status)

    if (!showApprove && !showCancel && !showSend && !showRevert) return null

    return (
        <div className="flex gap-2">
            {showSend && (
                <button
                    onClick={() => handleAction('send')}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition text-sm font-medium"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    <span>تم الإرسال للعميل</span>
                </button>
            )}

            {showApprove && (
                <button
                    onClick={() => handleAction('approve')}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition text-sm font-medium"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                    <span>اعتماد</span>
                </button>
            )}

            {showCancel && (
                <button
                    onClick={() => handleAction('cancel')}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition text-sm font-medium"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                    <span>إلغاء</span>
                </button>
            )}

            {showRevert && (
                <button
                    onClick={() => handleAction('revert')}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-200 disabled:opacity-50 transition text-sm font-medium"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : <RotateCcw size={16} />}
                    <span>تعديل (رجوع)</span>
                </button>
            )}
        </div>
    )
}
