import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CreateUserForm from './create-user-form'

export default async function NewUserPage() {
    const session = await getSession()

    if (!session || session.role !== 'Admin') {
        redirect('/')
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">إضافة مستخدم جديد</h1>
                <p className="text-gray-500 mt-1">إنشاء حساب موظف جديد في النظام</p>
            </div>

            <CreateUserForm />
        </div>
    )
}
