'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: { name: string }) {
    const session = await getSession()
    if (!session) return { error: 'غير مصرح لك' }

    try {
        await prisma.user.update({
            where: { id: session.id },
            data: { name: formData.name }
        })
        revalidatePath('/settings')
        return { success: true }
    } catch (error) {
        return { error: 'فشل تحديث البيانات' }
    }
}

export async function changePassword(formData: any) {
    const session = await getSession()
    if (!session) return { error: 'غير مصرح لك' }

    const { currentPassword, newPassword } = formData

    try {
        const user = await prisma.user.findUnique({ where: { id: session.id } })
        if (!user) return { error: 'المستخدم غير موجود' }

        const validPassword = await bcrypt.compare(currentPassword, user.passwordHash)
        if (!validPassword) return { error: 'كلمة المرور الحالية غير صحيحة' }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: { id: session.id },
            data: { passwordHash: hashedPassword }
        })

        return { success: true }
    } catch (error) {
        return { error: 'فشل تغيير كلمة المرور' }
    }
}

export async function updateIntegrationSettings(data: any) {
    const session = await getSession()
    if (!session || session.role !== 'Admin') return { error: 'صلاحيات غير كافية' }

    // Placeholder for actual integration logic (storing in a config table or env var simulated via DB)
    return { success: true, message: 'تم حفظ إعدادات الربط بنجاح' }
}
