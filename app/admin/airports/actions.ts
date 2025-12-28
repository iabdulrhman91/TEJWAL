'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
    const session = await getSession()
    if (!session || session.role !== 'Admin') {
        throw new Error('Unauthorized')
    }
}

export async function getAirports() {
    await checkAdmin()
    return prisma.airport.findMany({
        orderBy: { code: 'asc' }
    })
}

export async function toggleAirportStatus(id: number, isActive: boolean) {
    await checkAdmin()
    await prisma.airport.update({
        where: { id },
        data: { isActive }
    })
    revalidatePath('/admin/airports')
}

export async function addAirport(data: { code: string, cityAr: string, cityEn: string, countryAr?: string }) {
    await checkAdmin()

    // Check if code already exists
    const existing = await prisma.airport.findUnique({
        where: { code: data.code.toUpperCase() }
    })

    if (existing) {
        throw new Error('رمز المطار (IATA) موجود بالفعل')
    }

    await prisma.airport.create({
        data: {
            code: data.code.toUpperCase(),
            cityAr: data.cityAr,
            cityEn: data.cityEn,
            countryAr: data.countryAr,
            isActive: true
        }
    })
    revalidatePath('/admin/airports')
}

export async function updateAirport(id: number, data: { code: string, cityAr: string, cityEn: string, countryAr?: string }) {
    await checkAdmin()

    // Check if code exists for OTHER airports
    const existing = await prisma.airport.findFirst({
        where: {
            code: data.code.toUpperCase(),
            NOT: { id }
        }
    })

    if (existing) {
        throw new Error('رمز المطار (IATA) مستخدم بالفعل لمطار آخر')
    }

    await prisma.airport.update({
        where: { id },
        data: {
            code: data.code.toUpperCase(),
            cityAr: data.cityAr,
            cityEn: data.cityEn,
            countryAr: data.countryAr
        }
    })
    revalidatePath('/admin/airports')
}

export async function deleteAirport(id: number) {
    await checkAdmin()
    await prisma.airport.delete({
        where: { id }
    })
    revalidatePath('/admin/airports')
}

export async function searchAirports(query: string) {
    // This one doesn't strictly need admin check if used in autocomplete, 
    // but the management page uses it too.
    if (!query) return []

    return prisma.airport.findMany({
        where: {
            OR: [
                { code: { contains: query } },
                { cityAr: { contains: query } },
                { cityEn: { contains: query } }
            ],
            isActive: true
        },
        take: 10,
        orderBy: { code: 'asc' }
    })
}
