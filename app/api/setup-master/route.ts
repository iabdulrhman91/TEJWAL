import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const email = 'admin@tejwal.com'
        const password = 'admin123'

        // Check if exists
        const existing = await prisma.user.findUnique({ where: { email } })

        const passwordHash = await bcrypt.hash(password, 10)

        if (existing) {
            // Update password for existing admin
            await prisma.user.update({
                where: { email },
                data: { passwordHash, isActive: true }
            })
            return NextResponse.json({ success: true, message: 'Admin user updated with password: admin123' })
        }

        await prisma.user.create({
            data: {
                email,
                name: 'مدير النظام',
                passwordHash,
                role: 'Admin',
                isActive: true
            }
        })

        return NextResponse.json({ success: true, message: 'Admin user created: admin@tejwal.com / admin123' })
    } catch (error: any) {
        console.error('Setup error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
