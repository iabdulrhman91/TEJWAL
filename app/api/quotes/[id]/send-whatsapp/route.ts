import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recordSendAttempt } from '@/app/quotes/actions'
import { getSession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = parseInt(params.id)
    if (isNaN(id)) {
        return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })
    }

    // 1. Fetch Quote
    const quote = await prisma.quote.findUnique({
        where: { id }
    })

    if (!quote) {
        return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 })
    }

    // Normalize phone (remove non-digits, ensuring it's just numbers)
    const phone = quote.customerPhone?.replace(/\D/g, '') || ''
    if (!phone) {
        await recordSendAttempt(id, { sentTo: 'unknown', success: false, error: 'No phone number' })
        return NextResponse.json({ success: false, error: 'No phone number' }, { status: 400 })
    }

    // 2. Prepare Content
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const pdfUrl = `${baseUrl}/api/quotes/${id}/pdf`
    const caption = `Hello ${quote.customerName || 'Customer'}, Here is your quote from Tejwal: ${pdfUrl}`

    // 3. Send with Timeout
    // Hard timeout of 15 seconds
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
        let sent = false
        let errorMsg = ''

        // Check Trigger: We need an actual API URL to send. 
        // If not present, we can't send.
        const apiUrl = process.env.WHATSAPP_API_URL
        const apiToken = process.env.WHATSAPP_API_TOKEN

        if (!apiUrl || !apiToken) {
            throw new Error('Missing WHATSAPP_API_URL or WHATSAPP_API_TOKEN env variables')
        }

        // A) Attempt to send as Document (PDF)
        try {
            const resDoc = await fetch(`${apiUrl}/messages/document`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: apiToken,
                    to: phone,
                    document: pdfUrl,
                    filename: `Quote-${quote.quoteNumber}.pdf`,
                    caption: caption
                }),
                signal: controller.signal
            })

            if (resDoc.ok) {
                sent = true
            } else {
                console.warn('WhatsApp PDF send failed, falling back to text.')
            }
        } catch (e) {
            console.warn('WhatsApp PDF send network error, falling back to text.', e)
        }

        // B) Fallback: Text Message
        if (!sent) {
            const resText = await fetch(`${apiUrl}/messages/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: apiToken,
                    to: phone,
                    body: caption
                }),
                signal: controller.signal
            })

            if (!resText.ok) {
                const txt = await resText.text()
                throw new Error(`WhatsApp Send Failed: ${resText.status} ${txt}`)
            }
            sent = true
        }

        clearTimeout(timeoutId)

        // Success Update
        await recordSendAttempt(id, { sentTo: phone, success: true })

        const session = await getSession()
        if (session) {
            await createAuditLog({
                action: 'SEND_WHATSAPP',
                userId: session.id,
                quoteId: id,
                metadata: { phone }
            })
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        clearTimeout(timeoutId)

        // Error Update
        const errorMessage = error.name === 'AbortError' ? 'Timeout (15s)' : (error.message || 'Unknown Error')
        await recordSendAttempt(id, { sentTo: phone, success: false, error: errorMessage })

        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
    }
}
