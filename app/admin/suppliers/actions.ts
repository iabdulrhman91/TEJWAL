'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSuppliers() {
    try {
        const suppliers = await prisma.supplier.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: suppliers }
    } catch (error) {
        console.error('Error fetching suppliers:', error)
        return { success: false, error: 'Failed to fetch suppliers' }
    }
}

export async function createSupplier(data: {
    name: string,
    supportsFlights: boolean,
    supportsHotels: boolean,
    supportsServices: boolean
}) {
    try {
        await prisma.supplier.create({
            data: {
                name: data.name,
                supportsFlights: data.supportsFlights,
                supportsHotels: data.supportsHotels,
                supportsServices: data.supportsServices,
                isActive: true
            }
        })
        revalidatePath('/admin/suppliers')
        return { success: true }
    } catch (error) {
        console.error('Error creating supplier:', error)
        return { success: false, error: 'Failed to create supplier' }
    }
}

export async function toggleSupplierStatus(id: number, isActive: boolean) {
    try {
        await prisma.supplier.update({
            where: { id },
            data: { isActive }
        })
        revalidatePath('/admin/suppliers')
        return { success: true }
    } catch (error) {
        console.error('Error updating supplier status:', error)
        return { success: false, error: 'Failed to update status' }
    }
}

export async function deleteSupplier(id: number) {
    try {
        await prisma.supplier.delete({
            where: { id }
        })
        revalidatePath('/admin/suppliers')
        return { success: true }
    } catch (error) {
        console.error('Error deleting supplier:', error)
        return { success: false, error: 'Failed to delete supplier' }
    }
}
