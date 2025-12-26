'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUser } from '../actions'

export default function CreateUserForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Sales' as 'Admin' | 'Sales',
        isActive: true
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await createUser(formData)
            router.push('/users')
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء إنشاء المستخدم')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل *
                </label>
                <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="مثال: محمد أحمد"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني *
                </label>
                <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="example@tejwal.com"
                    dir="ltr"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور *
                </label>
                <input
                    required
                    type="password"
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="6 أحرف على الأقل"
                    dir="ltr"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    الصلاحية *
                </label>
                <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'Admin' | 'Sales' })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="Sales">موظف مبيعات</option>
                    <option value="Admin">مدير</option>
                </select>
            </div>

            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    تفعيل الحساب فوراً
                </label>
            </div>

            <div className="flex gap-4 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-200"
                >
                    {loading ? 'جاري الإنشاء...' : 'إنشاء المستخدم'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
                >
                    إلغاء
                </button>
            </div>
        </form>
    )
}
