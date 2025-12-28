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

export async function getAirlines() {
    await checkAdmin()
    return prisma.airline.findMany({
        orderBy: { code: 'asc' }
    })
}

export async function toggleAirlineStatus(id: number, isActive: boolean) {
    await checkAdmin()
    await prisma.airline.update({
        where: { id },
        data: { isActive }
    })
    revalidatePath('/admin/airlines')
}

export async function addAirline(data: { code: string, nameAr: string, nameEn: string }) {
    await checkAdmin()

    const existing = await prisma.airline.findUnique({
        where: { code: data.code.toUpperCase() }
    })

    if (existing) {
        throw new Error('رمز الخطوط (IATA) موجود بالفعل')
    }

    await prisma.airline.create({
        data: {
            code: data.code.toUpperCase(),
            nameAr: data.nameAr,
            nameEn: data.nameEn,
            isActive: true
        }
    })
    revalidatePath('/admin/airlines')
}

export async function updateAirline(id: number, data: { code: string, nameAr: string, nameEn: string }) {
    await checkAdmin()

    // Check if code exists for OTHER airlines
    const existing = await prisma.airline.findFirst({
        where: {
            code: data.code.toUpperCase(),
            NOT: { id }
        }
    })

    if (existing) {
        throw new Error('رمز الخطوط (IATA) مستخدم بالفعل لشركة أخرى')
    }

    await prisma.airline.update({
        where: { id },
        data: {
            code: data.code.toUpperCase(),
            nameAr: data.nameAr,
            nameEn: data.nameEn
        }
    })
    revalidatePath('/admin/airlines')
}

export async function deleteAirline(id: number) {
    await checkAdmin()
    await prisma.airline.delete({
        where: { id }
    })
    revalidatePath('/admin/airlines')
}

export async function searchAirlines(query: string) {
    if (!query) return []

    return prisma.airline.findMany({
        where: {
            OR: [
                { code: { contains: query } },
                { nameAr: { contains: query } },
                { nameEn: { contains: query } }
            ],
            isActive: true
        },
        take: 10,
        orderBy: { code: 'asc' }
    })
}
