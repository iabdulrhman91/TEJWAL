'use server'

import { login } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function loginAction(formData: any) {
    const { email, password } = formData

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user || !user.isActive) {
            return { error: 'البريد الإلكتروني غير موجود أو الحساب معطل' }
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash)

        if (!validPassword) {
            return { error: 'كلمة المرور غير صحيحة' }
        }

        await login({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        })

        return { success: true }
    } catch (error) {
        console.error('Login error:', error)
        return { error: 'حدث خطأ ما، يرجى المحاولة لاحقاً' }
    }
}
