'use client'

import { MessageSquare, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function WhatsAppButton({ quoteId, phone, status }: { quoteId: number, phone: string | null, status?: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    const isLocked = status === 'Approved' || status === 'Cancelled'
    const shouldAutoSend = searchParams.get('action') === 'send'

    // Auto-trigger send if requested via URL
    useEffect(() => {
        if (shouldAutoSend && !isLocked && phone && !isLoading) {
            handleSend()
        }
    }, [shouldAutoSend, phone, isLocked])

    const handleSend = async () => {
        if (!phone) {
            alert('لا يوجد رقم جوال للعميل')
            return
        }

        const confirmed = window.confirm(`هل أنت متأكد من إرسال العرض إلى ${phone} عبر واتساب؟`)
        if (!confirmed) return

        setIsLoading(true)

        try {
            const res = await fetch(`/api/quotes/${quoteId}/send-whatsapp`, {
                method: 'POST',
            })

            const data = await res.json()

            if (res.ok && data.success) {
                alert('تم إرسال العرض بنجاح ✅')
                router.refresh() // Refresh server data
            } else {
                throw new Error(data.error || 'فشل الإرسال')
            }
        } catch (error: any) {
            console.error(error)
            alert(`فشل الإرسال: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLocked) return null

    return (
        <button
            onClick={handleSend}
            disabled={isLoading || !phone}
            className={`
                px-4 py-2 rounded-lg flex items-center gap-2 transition font-medium
                ${!phone ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#25D366] hover:bg-[#128C7E] text-white shadow-sm'}
            `}
            title={!phone ? 'لا يوجد رقم جوال' : 'إرسال عبر واتساب'}
        >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <MessageSquare size={20} />}
            <span>{isLoading ? 'جاري الإرسال...' : 'إرسال واتساب'}</span>
        </button>
    )
}
