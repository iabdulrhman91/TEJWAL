import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const email = 'admin21@tejwal.com'
        const password = 'admin123'

        // Check if exists
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return NextResponse.json({ success: true, message: 'User already exists' })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                email,
                name: 'مدير النظام',
                passwordHash,
                role: 'Admin',
                isActive: true
            }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
