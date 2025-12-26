'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function toggleUserStatus(userId: number, isActive: boolean) {
    const session = await getSession()
    if (!session || session.role !== 'Admin') {
        throw new Error('Unauthorized')
    }

    await prisma.user.update({
        where: { id: userId },
        data: { isActive },
    })

    revalidatePath('/users')
    return { success: true }
}

export async function createUser(data: {
    name: string
    email: string
    password: string
    role: 'Admin' | 'Sales'
    isActive?: boolean
}) {
    const session = await getSession()
    if (!session || session.role !== 'Admin') {
        throw new Error('Unauthorized')
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
        where: { email: data.email }
    })

    if (existing) {
        throw new Error('البريد الإلكتروني مستخدم بالفعل')
    }

    // Hash password
    const bcrypt = require('bcryptjs')
    const passwordHash = await bcrypt.hash(data.password, 10)

    // Create user
    const newUser = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            passwordHash,
            role: data.role,
            isActive: data.isActive ?? true
        }
    })

    // Audit log
    const { createAuditLog } = require('@/lib/audit')
    await createAuditLog({
        action: 'CREATE_USER',
        userId: session.userId,
        metadata: { newUserId: newUser.id, newUserEmail: newUser.email, role: newUser.role }
    })

    revalidatePath('/users')
    return { success: true, userId: newUser.id }
}
