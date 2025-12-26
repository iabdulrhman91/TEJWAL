'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getHotels(query: string = '') {
    return await prisma.hotel.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { city: { contains: query } }
            ],
            isActive: true
        },
        take: 10
    })
}

export async function toggleHotelStatus(id: number, status: boolean) {
    const session = await getSession()
    if (!session || session.role !== 'Admin') throw new Error('Unauthorized')

    await prisma.hotel.update({
        where: { id },
        data: { isActive: status }
    })
    revalidatePath('/admin/hotels')
}

export async function deleteHotel(id: number) {
    const session = await getSession()
    if (!session || session.role !== 'Admin') throw new Error('Unauthorized')

    await prisma.hotel.delete({ where: { id } })
    revalidatePath('/admin/hotels')
}

/**
 * Internal function to update/create hotel in library when a quote is created
 */
export async function ensureHotelInLibrary(data: { name: string, city: string, stars: number }) {
    if (!data.name || !data.city) return

    await prisma.hotel.upsert({
        where: {
            name_city: {
                name: data.name,
                city: data.city
            }
        },
        update: {
            stars: data.stars
        },
        create: {
            name: data.name,
            city: data.city,
            stars: data.stars
        }
    })
}
export async function addHotel(data: { name: string, city: string, stars: number, description?: string }) {
    const session = await getSession()
    if (!session || session.role !== 'Admin') throw new Error('Unauthorized')

    const hotel = await prisma.hotel.create({
        data: {
            name: data.name,
            city: data.city,
            stars: data.stars,
            description: data.description,
            isActive: true
        }
    })
    revalidatePath('/admin/hotels')
    return hotel
}
