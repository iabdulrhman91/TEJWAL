'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { ensureHotelInLibrary } from '../admin/hotels/actions'

export async function getActiveSuppliers(type: 'flight' | 'hotel' | 'service') {
    const where: any = { isActive: true }

    if (type === 'flight') where.supportsFlights = true
    if (type === 'hotel') where.supportsHotels = true
    if (type === 'service') where.supportsServices = true

    return await prisma.supplier.findMany({
        where,
        orderBy: { name: 'asc' }
    })
}

export async function getQuotes(
    query?: string,
    filterStatus?: string,
    filterDate?: string,
    filterCreator?: string
) {
    const where: any = {}

    // 1. Text Search
    if (query) {
        where.OR = [
            { customerName: { contains: query } },
            { quoteNumber: { contains: query } },
            { customerPhone: { contains: query } },
            { destination: { contains: query } },
        ]
    }

    // 2. Status Filter
    if (filterStatus && filterStatus !== 'All') {
        where.status = filterStatus
    }

    // 3. Creator Filter (My Quotes)
    if (filterCreator === 'me') {
        const session = await getSession()
        if (session) {
            where.createdByUserId = session.id
        }
    }

    // 4. Date Filter
    if (filterDate && filterDate !== 'All') {
        const now = new Date()
        let startDate: Date

        switch (filterDate) {
            case 'Today':
                startDate = new Date(now.setHours(0, 0, 0, 0))
                break
            case 'Week':
                const lastWeek = new Date(now)
                lastWeek.setDate(lastWeek.getDate() - 7)
                startDate = new Date(lastWeek.setHours(0, 0, 0, 0))
                break
            case 'Month':
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                startDate = firstDayOfMonth
                break
            default:
                startDate = new Date(0)
        }

        where.createdAt = { gte: startDate }
    }

    return await prisma.quote.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 20, // Pagination limit
        include: {
            createdBy: {
                select: {
                    name: true
                }
            }
        }
    })
}

export async function getQuote(id: number) {
    return await prisma.quote.findUnique({
        where: { id },
        include: {
            quoteServices: true,
            flightSegments: true,
            hotelStays: true
        }
    })
}

export async function deleteQuote(id: number) {
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')

    const quote = await prisma.quote.findUnique({ where: { id } })
    if (!quote) return

    // Prevent deleting Approved or Cancelled quotes
    if (quote.status === 'Approved' || quote.status === 'Cancelled') {
        throw new Error('لا يمكن حذف عرض معتمد أو ملغي')
    }

    await prisma.quote.delete({
        where: { id }
    })
    revalidatePath('/quotes')
}

// Status Actions
export async function approveQuote(id: number) {
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')

    const quote = await prisma.quote.findUnique({ where: { id } })
    if (!quote) throw new Error('Quote not found')

    if (session.role !== 'Admin' && quote.createdByUserId !== session.id) {
        throw new Error('Unauthorized: Admin or Owner only')
    }

    await prisma.quote.update({
        where: { id },
        data: {
            status: 'Approved',
            approvedAt: new Date()
        }
    })
    revalidatePath(`/quotes/${id}`)



    await createAuditLog({
        action: 'APPROVE_QUOTE',
        userId: session.id,
        quoteId: id
    })
}

export async function revertToDraft(id: number) {
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')

    const quote = await prisma.quote.findUnique({ where: { id } })
    if (!quote) throw new Error('Quote not found')

    if (session.role !== 'Admin' && quote.createdByUserId !== session.id) {
        throw new Error('Unauthorized: Admin or Owner only')
    }

    await prisma.quote.update({
        where: { id },
        data: {
            status: 'Draft',
            // We keep approvedAt/sentAt as history or clear them? 
            // Better to keep them in audit log, but here maybe just status change.
        }
    })
    revalidatePath(`/quotes/${id}`)

    await createAuditLog({
        action: 'REVERT_TO_DRAFT',
        userId: session.id,
        quoteId: id
    })
}

export async function cancelQuote(id: number) {
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')

    const quote = await prisma.quote.findUnique({ where: { id } })
    if (!quote) throw new Error('Quote not found')

    if (session.role !== 'Admin' && quote.createdByUserId !== session.id) {
        throw new Error('Unauthorized: Admin or Owner only')
    }

    await prisma.quote.update({
        where: { id },
        data: {
            status: 'Cancelled',
            cancelledAt: new Date()
        }
    })
    revalidatePath(`/quotes/${id}`)

    await createAuditLog({
        action: 'CANCEL_QUOTE',
        userId: session.id,
        quoteId: id
    })
}

export async function markAsSent(id: number) {
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')

    const quote = await prisma.quote.findUnique({ where: { id } })
    if (!quote) throw new Error('Quote not found')

    if (session.role !== 'Admin' && quote.createdByUserId !== session.id) {
        throw new Error('Unauthorized')
    }

    await prisma.quote.update({
        where: { id },
        data: {
            status: 'Sent',
            sentAt: new Date()
        }
    })
    revalidatePath(`/quotes/${id}`)

    await createAuditLog({
        action: 'SEND_QUOTE',
        userId: session.id,
        quoteId: id
    })
}

async function generateQuoteNumber() {
    const year = new Date().getFullYear()
    const prefix = `Q-${year}`

    // Find last quote of this year
    const lastQuote = await prisma.quote.findFirst({
        where: {
            quoteNumber: {
                startsWith: prefix
            }
        },
        orderBy: {
            quoteNumber: 'desc'
        }
    })

    if (!lastQuote) {
        return `${prefix}-000001`
    }

    const parts = lastQuote.quoteNumber.split('-')
    if (parts.length < 3) return `${prefix}-000001`

    const lastNum = parseInt(parts[2])
    const newNum = lastNum + 1
    return `${prefix}-${newNum.toString().padStart(6, '0')}`
}

export async function createQuote(data: any) {
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')

    const quoteNumber = await generateQuoteNumber()

    const {
        customerName,
        customerPhone,
        customerEmail,
        customerCompany,
        destination,
        travelersCountAdults,
        travelersCountChildren,
        travelersCountInfants,
        notesInternal,
        selectedServices,
        flights,
        hotels,
        markup,
        status // Extract status
    } = data

    if (!customerName?.trim() || !customerPhone?.trim()) {
        throw new Error('الاسم ورقم الجوال حقول إلزامية')
    }
    if (!destination || (Array.isArray(destination) && destination.length === 0)) {
        throw new Error('الوجهة حقل إلزامي')
    }

    // Find or create customer
    const { findOrCreateCustomer } = require('@/app/customers/actions')
    let customerId = null

    if (customerPhone) {
        try {
            const customer = await findOrCreateCustomer({
                name: customerName,
                phone: customerPhone,
                email: customerEmail,
                company: customerCompany
            })
            customerId = customer.id
        } catch (error) {
            console.error('Error creating customer:', error)
            // Continue without customer link if phone is invalid
        }
    }

    // Filter valid flights (at least city info)
    const validFlights = (flights || []).filter((f: any) => f.from || f.to)

    // Filter valid hotels (at least name info)
    const validHotels = (hotels || []).filter((h: any) => h.hotelName || h.city)

    // Calculate totals (sum cost prices regardless of dates)
    const totalServices = (selectedServices || []).reduce((acc: number, curr: any) => acc + (parseFloat(curr.costPrice) || 0), 0)
    const totalFlights = validFlights.reduce((acc: number, curr: any) => acc + (parseFloat(curr.costPrice) || 0), 0)
    const totalHotels = validHotels.reduce((acc: number, curr: any) => acc + (parseFloat(curr.costPrice) || 0), 0)

    const quoteMarkup = parseFloat(markup) || 0
    const grandTotal = totalServices + totalFlights + totalHotels + quoteMarkup

    const quote = await prisma.quote.create({
        data: {
            quoteNumber,
            customerName,
            customerPhone,
            customerId, // Link to customer
            destination,
            travelersCountAdults: parseInt(travelersCountAdults) || 1,
            travelersCountChildren: parseInt(travelersCountChildren) || 0,
            travelersCountInfants: parseInt(travelersCountInfants) || 0,
            notesInternal,
            totalServices,
            totalFlights,
            totalHotels,
            markup: quoteMarkup,
            grandTotal,
            status: status || 'Draft',
            sentAt: status === 'Sent' ? new Date() : null,
            createdByUserId: session.id,
            quoteServices: {
                create: (selectedServices || []).map((s: any) => ({
                    serviceName: s.name,
                    unitPrice: parseFloat(s.costPrice),
                    quantity: parseInt(s.quantity),
                    supplier: s.supplier,
                    costPrice: parseFloat(s.costPrice),
                    serviceTotal: parseFloat(s.costPrice)
                }))
            },
            flightSegments: {
                create: validFlights.map((f: any) => ({
                    fromAirport: f.from,
                    toAirport: f.to,
                    stopoverAirport: f.stopover,
                    departureDateTime: f.departure ? new Date(f.departure) : null,
                    arrivalDateTime: f.arrival ? new Date(f.arrival) : null,
                    // Return fields
                    returnFromAirport: f.returnFrom,
                    returnToAirport: f.returnTo,
                    returnStopoverAirport: f.returnStopover,
                    returnDepartureDateTime: f.returnDeparture ? new Date(f.returnDeparture) : null,
                    returnArrivalDateTime: f.returnArrival ? new Date(f.returnArrival) : null,
                    returnAirline: f.returnAirline,
                    returnCabinClass: f.returnCabinClass,
                    airline: f.airline,
                    flightType: f.flightType,
                    cabinClass: f.cabinClass,
                    weight: f.weight,
                    returnWeight: f.returnWeight,
                    stopoverTime: parseFloat(f.stopoverTime) || 0,
                    returnStopoverTime: parseFloat(f.returnStopoverTime) || 0,
                    ticketCount: parseInt(f.ticketCount) || 1,
                    supplier: f.supplier,
                    costPrice: parseFloat(f.costPrice) || 0,
                    segmentTotal: parseFloat(f.costPrice) || 0,
                    notes: f.notes
                }))
            },
            hotelStays: {
                create: validHotels.map((h: any) => ({
                    city: h.city,
                    hotelName: h.hotelName,
                    hotelStars: parseInt(h.stars) || 3,
                    checkInDate: h.checkIn ? new Date(h.checkIn) : null,
                    checkOutDate: h.checkOut ? new Date(h.checkOut) : null,
                    roomType: h.roomType,
                    mealPlan: h.mealPlan,
                    roomCount: parseInt(h.roomCount) || 1,
                    supplier: h.supplier,
                    costPrice: parseFloat(h.costPrice) || 0,
                    stayTotal: parseFloat(h.costPrice) || 0,
                    notes: h.notes
                }))
            }
        }
    })

    // Auto-save hotels to library (even if no dates provided)
    for (const h of (hotels || [])) {
        if (h.hotelName && h.city) {
            await ensureHotelInLibrary({ name: h.hotelName, city: h.city, stars: parseInt(h.stars) || 3 })
        }
    }

    // Update customer's last quote date
    if (customerId) {
        const { updateCustomerLastQuote } = require('@/app/customers/actions')
        await updateCustomerLastQuote(customerId)
    }

    revalidatePath('/quotes')

    await createAuditLog({
        action: 'CREATE_QUOTE',
        userId: session.id,
        quoteId: quote.id,
        metadata: { quoteNumber: quote.quoteNumber }
    })

    return { success: true, id: quote.id }
}

export async function recordSendAttempt(id: number, attempt: {
    sentTo: string,
    success: boolean,
    error?: string
}) {
    await prisma.quote.update({
        where: { id },
        data: {
            sentAt: new Date(),
            sentTo: attempt.sentTo,
            lastSendStatus: attempt.success ? 'success' : 'fail',
            lastSendError: attempt.error,
            status: attempt.success ? 'Sent' : undefined
        }
    })
    revalidatePath(`/quotes/${id}`)
}

export async function updateQuote(id: number, data: any) {
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')

    const quote = await prisma.quote.findUnique({ where: { id } })
    if (!quote) throw new Error('Quote not found')

    // Only allow editing Draft quotes
    if (quote.status !== 'Draft') {
        throw new Error('لا يمكن تعديل عرض تم إرساله أو اعتماده')
    }

    // Sales can only edit their own quotes
    if (session.role !== 'Admin' && quote.createdByUserId !== session.id) {
        throw new Error('غير مصرح لك بتعديل هذا العرض')
    }

    const {
        customerName,
        customerPhone,
        destination,
        travelersCountAdults,
        travelersCountChildren,
        travelersCountInfants,
        notesInternal,
        selectedServices,
        flights,
        hotels,
        markup,
        status // Extract status
    } = data

    if (!customerName?.trim() || !customerPhone?.trim()) {
        throw new Error('الاسم ورقم الجوال حقول إلزامية')
    }
    if (!destination || (Array.isArray(destination) && destination.length === 0)) {
        throw new Error('الوجهة حقل إلزامي')
    }

    // Filter valid items
    const validFlights = (flights || []).filter((f: any) => f.from || f.to)
    const validHotels = (hotels || []).filter((h: any) => h.hotelName || h.city)

    // Calculate totals
    const totalServices = (selectedServices || []).reduce((acc: number, curr: any) => acc + (parseFloat(curr.costPrice) || 0), 0)
    const totalFlights = validFlights.reduce((acc: number, curr: any) => acc + (parseFloat(curr.costPrice) || 0), 0)
    const totalHotels = validHotels.reduce((acc: number, curr: any) => acc + (parseFloat(curr.costPrice) || 0), 0)

    // Find or create customer if phone provided
    const { findOrCreateCustomer } = require('@/app/customers/actions')
    let customerId = quote.customerId

    if (customerPhone && customerPhone !== quote.customerPhone) {
        try {
            const customer = await findOrCreateCustomer({
                name: customerName,
                phone: customerPhone
            })
            customerId = customer.id
        } catch (error) {
            console.error('Error updating customer:', error)
        }
    }

    const quoteMarkup = parseFloat(markup) || 0
    const grandTotal = totalServices + totalFlights + totalHotels + quoteMarkup

    // Delete existing items and create new ones
    await prisma.quote.update({
        where: { id },
        data: {
            customerName,
            customerPhone,
            customerId,
            destination,
            travelersCountAdults: parseInt(travelersCountAdults) || 1,
            travelersCountChildren: parseInt(travelersCountChildren) || 0,
            travelersCountInfants: parseInt(travelersCountInfants) || 0,
            notesInternal,
            totalServices,
            totalFlights,
            totalHotels,
            markup: quoteMarkup,
            grandTotal,
            status: status || quote.status, // Update status if provided
            sentAt: status === 'Sent' ? new Date() : quote.sentAt,
            // Delete all existing items
            quoteServices: {
                deleteMany: {},
                create: (selectedServices || []).map((s: any) => ({
                    serviceName: s.name,
                    unitPrice: parseFloat(s.costPrice),
                    quantity: parseInt(s.quantity),
                    supplier: s.supplier,
                    costPrice: parseFloat(s.costPrice),
                    serviceTotal: parseFloat(s.costPrice)
                }))
            },
            flightSegments: {
                deleteMany: {},
                create: validFlights.map((f: any) => ({
                    fromAirport: f.from,
                    toAirport: f.to,
                    stopoverAirport: f.stopover,
                    departureDateTime: f.departure ? new Date(f.departure) : null,
                    arrivalDateTime: f.arrival ? new Date(f.arrival) : null,
                    // Return fields
                    returnFromAirport: f.returnFrom,
                    returnToAirport: f.returnTo,
                    returnStopoverAirport: f.returnStopover,
                    returnDepartureDateTime: f.returnDeparture ? new Date(f.returnDeparture) : null,
                    returnArrivalDateTime: f.returnArrival ? new Date(f.returnArrival) : null,
                    returnAirline: f.returnAirline,
                    returnCabinClass: f.returnCabinClass,
                    airline: f.airline,
                    flightType: f.flightType,
                    cabinClass: f.cabinClass,
                    weight: f.weight,
                    returnWeight: f.returnWeight,
                    stopoverTime: parseFloat(f.stopoverTime) || 0,
                    returnStopoverTime: parseFloat(f.returnStopoverTime) || 0,
                    ticketCount: parseInt(f.ticketCount) || 1,
                    supplier: f.supplier,
                    costPrice: parseFloat(f.costPrice) || 0,
                    segmentTotal: parseFloat(f.costPrice) || 0,
                    notes: f.notes
                }))
            },
            hotelStays: {
                deleteMany: {},
                create: validHotels.map((h: any) => ({
                    city: h.city,
                    hotelName: h.hotelName,
                    hotelStars: parseInt(h.stars) || 3,
                    checkInDate: h.checkIn ? new Date(h.checkIn) : null,
                    checkOutDate: h.checkOut ? new Date(h.checkOut) : null,
                    roomType: h.roomType,
                    mealPlan: h.mealPlan,
                    roomCount: parseInt(h.roomCount) || 1,
                    supplier: h.supplier,
                    costPrice: parseFloat(h.costPrice) || 0,
                    stayTotal: parseFloat(h.costPrice) || 0,
                    notes: h.notes
                }))
            }
        }
    })

    // Auto-save hotels to library (even if no dates provided)
    for (const h of (hotels || [])) {
        if (h.hotelName && h.city) {
            await ensureHotelInLibrary({ name: h.hotelName, city: h.city, stars: parseInt(h.stars) || 3 })
        }
    }

    revalidatePath(`/quotes/${id}`)
    revalidatePath('/quotes')

    await createAuditLog({
        action: 'UPDATE_QUOTE',
        userId: session.id,
        quoteId: id,
        metadata: { quoteNumber: quote.quoteNumber }
    })

    return { success: true, id }
}

// -----------------------------------------------------------------------------
// PDF.co Integration
// -----------------------------------------------------------------------------
export async function generatePdfWithPdfCo(htmlContent: string, filename: string = 'quote.pdf') {
    const apiKey = process.env.PDF_CO_API_KEY
    if (!apiKey) {
        return { success: false, error: 'API Key Missing: Please add PDF_CO_API_KEY to your .env file.' }
    }

    try {
        const response = await fetch('https://api.pdf.co/v1/pdf/convert/from/html', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                html: htmlContent,
                name: filename,
                margins: "5px 5px 5px 5px",
                paperSize: "A4",
                orientation: "Portrait",
                printBackground: true,
                header: "",
                footer: ""
            })
        })

        const data = await response.json()

        if (data.error) {
            console.error('PDF.co Error:', data.message)
            return { success: false, error: data.message }
        }

        return { success: true, url: data.url }
    } catch (error) {
        console.error('PDF.co Request Failed:', error)
        return { success: false, error: 'Failed to connect to PDF service.' }
    }
}
