'use server'

import { prisma } from '@/lib/prisma'
import { normalizePhone } from '@/lib/phone'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

/**
 * Find or create customer by phone number
 * Returns customer with quote statistics
 */
export async function findOrCreateCustomer(data: {
    name: string
    phone: string
    email?: string
    company?: string
}) {
    const normalizedPhone = normalizePhone(data.phone)

    if (!normalizedPhone) {
        throw new Error('رقم الجوال غير صحيح')
    }

    // Try to find existing customer
    let customer = await prisma.customer.findUnique({
        where: { phone: normalizedPhone },
        include: {
            quotes: {
                select: {
                    id: true,
                    status: true,
                    createdBy: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        }
    })

    if (customer) {
        // Update customer info if changed
        if (customer.name !== data.name || customer.email !== data.email || customer.company !== data.company) {
            customer = await prisma.customer.update({
                where: { id: customer.id },
                data: {
                    name: data.name,
                    email: data.email,
                    company: data.company
                },
                include: {
                    quotes: {
                        select: {
                            id: true,
                            status: true,
                            createdBy: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            })
        }
    } else {
        // Create new customer
        customer = await prisma.customer.create({
            data: {
                name: data.name,
                phone: normalizedPhone,
                email: data.email,
                company: data.company
            },
            include: {
                quotes: {
                    select: {
                        id: true,
                        status: true,
                        createdBy: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        })
    }

    return customer
}

/**
 * Check if customer exists by phone
 * Returns customer stats without sensitive details
 */
export async function checkCustomerByPhone(phone: string) {
    const normalizedPhone = normalizePhone(phone)

    if (!normalizedPhone) {
        return null
    }

    const customer = await prisma.customer.findUnique({
        where: { phone: normalizedPhone },
        include: {
            quotes: {
                select: {
                    id: true,
                    status: true,
                    createdAt: true,
                    createdByUserId: true,
                    createdBy: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    })

    if (!customer) {
        return null
    }

    // Group quotes by employee
    const quotesByEmployee = customer.quotes.reduce((acc: any, quote) => {
        const employeeName = quote.createdBy.name
        if (!acc[employeeName]) {
            acc[employeeName] = 0
        }
        acc[employeeName]++
        return acc
    }, {})

    // Check for active quote (Draft created in last 24 hours)
    const oneDayAgo = new Date()
    oneDayAgo.setHours(oneDayAgo.getHours() - 24)

    const hasActiveQuote = customer.quotes.some(
        quote => quote.status === 'Draft' && new Date(quote.createdAt) > oneDayAgo
    )

    return {
        exists: true,
        name: customer.name,
        email: customer.email,
        company: customer.company,
        totalQuotes: customer.quotes.length,
        quotesByEmployee,
        lastQuoteDate: customer.lastQuoteDate,
        hasActiveQuote
    }
}

/**
 * Get customer details (Admin only)
 */
export async function getCustomer(id: number) {
    return prisma.customer.findUnique({
        where: { id },
        include: {
            quotes: {
                include: {
                    createdBy: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    })
}

/**
 * Update customer last quote date
 */
export async function updateCustomerLastQuote(customerId: number) {
    await prisma.customer.update({
        where: { id: customerId },
        data: {
            lastQuoteDate: new Date()
        }
    })
}

/**
 * Get all customers (Admin only)
 */
export async function getCustomers(searchQuery?: string) {
    const session = await getSession()
    if (!session || session.role !== 'Admin') {
        throw new Error('Unauthorized')
    }

    const where: any = {}

    if (searchQuery) {
        where.OR = [
            { name: { contains: searchQuery } },
            { phone: { contains: searchQuery } },
            { email: { contains: searchQuery } },
            { company: { contains: searchQuery } }
        ]
    }

    return prisma.customer.findMany({
        where,
        include: {
            quotes: {
                select: {
                    id: true,
                    status: true,
                    grandTotal: true,
                    createdAt: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

/**
 * Update customer (Admin only)
 */
export async function updateCustomer(id: number, data: {
    name: string
    phone: string
    email?: string
    company?: string
    notes?: string
}) {
    const session = await getSession()
    if (!session || session.role !== 'Admin') {
        throw new Error('Unauthorized')
    }

    const normalizedPhone = normalizePhone(data.phone)
    if (!normalizedPhone) {
        throw new Error('رقم الجوال غير صحيح')
    }

    // Check if phone is already used by another customer
    const existing = await prisma.customer.findFirst({
        where: {
            phone: normalizedPhone,
            NOT: { id }
        }
    })

    if (existing) {
        throw new Error('رقم الجوال مستخدم من قبل عميل آخر')
    }

    await prisma.customer.update({
        where: { id },
        data: {
            name: data.name,
            phone: normalizedPhone,
            email: data.email,
            company: data.company,
            notes: data.notes
        }
    })

    revalidatePath('/admin/customers')
    revalidatePath(`/admin/customers/${id}`)
}

/**
 * Delete customer (Admin only)
 * Only if they have no quotes
 */
export async function deleteCustomer(id: number) {
    const session = await getSession()
    if (!session || session.role !== 'Admin') {
        throw new Error('Unauthorized')
    }

    const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
            quotes: true
        }
    })

    if (!customer) {
        throw new Error('العميل غير موجود')
    }

    if (customer.quotes.length > 0) {
        throw new Error('لا يمكن حذف عميل لديه عروض. قم بحذف العروض أولاً.')
    }

    await prisma.customer.delete({
        where: { id }
    })

    revalidatePath('/admin/customers')
}
