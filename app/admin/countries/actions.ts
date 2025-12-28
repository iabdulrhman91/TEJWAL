'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// Search countries (existing)
export async function searchCountries(query: string) {
    if (!query) return []
    return prisma.country.findMany({
        where: {
            OR: [
                { nameAr: { contains: query } },
                { nameEn: { contains: query } }, // removed lte: 'insensitive' as sqlite default is mixed, usually safe to keep simple
                { code: { contains: query } }
            ],
            isActive: true
        },
        take: 10,
        orderBy: { nameAr: 'asc' }
    })
}

// Fetch all active countries (for client-side caching/filtering)
export async function getAllCountries() {
    return await prisma.country.findMany({
        where: { isActive: true },
        orderBy: { nameAr: 'asc' }
    })
}

// Create or update a country (for "add new" feature)
export async function createCountry(nameAr: string, code?: string, nameEn?: string) {
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')

    // Check if exists by name
    const existingByName = await prisma.country.findFirst({
        where: {
            OR: [
                { nameAr: nameAr },
                { nameEn: nameAr } // Simple check
            ]
        }
    })

    if (existingByName) return existingByName

    // Use provided code or generate random
    let finalCode = code?.toUpperCase()
    if (!finalCode) {
        finalCode = 'CUST-' + Math.floor(Math.random() * 10000)
    } else {
        // Check if code exists
        const existingByCode = await prisma.country.findFirst({
            where: { code: finalCode }
        })
        if (existingByCode) throw new Error('الكود مستخدم بالفعل')
    }

    return await prisma.country.create({
        data: {
            nameAr,
            nameEn: nameEn || nameAr, // Use provided nameEn or fallback
            code: finalCode,
            isActive: true
        }
    })
}

export async function updateCountry(id: number, data: { nameAr: string, nameEn: string, code: string }) {
    const session = await getSession()
    if (!session || session.role !== 'Admin') throw new Error('Unauthorized')

    // Check if code exists for other countries
    const existingByCode = await prisma.country.findFirst({
        where: {
            code: data.code.toUpperCase(),
            id: { not: id }
        }
    })
    if (existingByCode) throw new Error('الكود مستخدم بالفعل')

    return await prisma.country.update({
        where: { id },
        data: {
            nameAr: data.nameAr,
            nameEn: data.nameEn,
            code: data.code.toUpperCase()
        }
    })
}

// Toggle country status
export async function toggleCountryStatus(id: number) {
    const session = await getSession()
    if (!session || session.role !== 'Admin') throw new Error('Unauthorized')

    const country = await prisma.country.findUnique({ where: { id } })
    if (!country) throw new Error('Country not found')

    return await prisma.country.update({
        where: { id },
        data: { isActive: !country.isActive }
    })
}

// Delete country
export async function deleteCountry(id: number) {
    const session = await getSession()
    if (!session || session.role !== 'Admin') throw new Error('Unauthorized')

    return await prisma.country.delete({
        where: { id }
    })
}
