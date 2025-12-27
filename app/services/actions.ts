'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getServices(onlyActive = false) {
    return await prisma.serviceCatalog.findMany({
        where: onlyActive ? { isActive: true } : undefined,
        orderBy: { id: 'desc' }
    })
}

export async function getService(id: number) {
    return await prisma.serviceCatalog.findUnique({
        where: { id }
    })
}

export async function createService(formData: FormData) {
    const name = formData.get('name') as string
    const price = formData.get('defaultUnitPrice') as string
    const isActive = formData.get('isActive') === 'on'

    await prisma.serviceCatalog.create({
        data: {
            name,
            defaultUnitPrice: parseFloat(price) || 0,
            isActive,
        }
    })

    revalidatePath('/services')
    redirect('/services')
}

export async function updateService(id: number, formData: FormData) {
    const name = formData.get('name') as string
    const price = formData.get('defaultUnitPrice') as string
    const isActive = formData.get('isActive') === 'on'

    await prisma.serviceCatalog.update({
        where: { id },
        data: {
            name,
            defaultUnitPrice: parseFloat(price) || 0,
            isActive,
        }
    })

    revalidatePath('/services')
    redirect('/services')
}

export async function deleteService(id: number) {
    await prisma.serviceCatalog.delete({
        where: { id }
    })
    revalidatePath('/services')
}

export async function toggleServiceStatus(id: number, currentStatus: boolean) {
    await prisma.serviceCatalog.update({
        where: { id },
        data: { isActive: !currentStatus }
    })
    revalidatePath('/services')
}
