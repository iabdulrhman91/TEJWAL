'use client'

import { useState } from 'react'
import { updateCustomer, deleteCustomer } from '@/app/customers/actions'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function EditCustomerForm({ customer }: { customer: any }) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        company: customer.company || '',
        notes: customer.notes || ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await updateCustomer(customer.id, formData)
            setIsEditing(false)
            router.refresh()
        } catch (error: any) {
            alert(error.message || 'حدث خطأ أثناء التحديث')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.')) {
            return
        }

        setLoading(true)
        try {
            await deleteCustomer(customer.id)
            router.push('/admin/customers')
        } catch (error: any) {
            alert(error.message || 'حدث خطأ أثناء الحذف')
            setLoading(false)
        }
    }

    if (!isEditing) {
        return (
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">إدارة</h2>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        تعديل البيانات
                    </button>
                </div>
                {customer.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">ملاحظات</div>
                        <div className="text-sm text-gray-700">{customer.notes}</div>
                    </div>
                )}
                <button
                    onClick={handleDelete}
                    disabled={customer.quotes.length > 0}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title={customer.quotes.length > 0 ? 'لا يمكن حذف عميل لديه عروض' : ''}
                >
                    <Trash2 size={16} />
                    <span>حذف العميل</span>
                </button>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-bold mb-4">تعديل البيانات</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">الاسم</label>
                    <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">الجوال</label>
                    <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                        dir="ltr"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                        dir="ltr"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">الشركة</label>
                    <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">ملاحظات</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full p-2 border rounded-lg h-24"
                        placeholder="ملاحظات داخلية عن العميل..."
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? 'جاري الحفظ...' : 'حفظ'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setIsEditing(false)
                            setFormData({
                                name: customer.name,
                                phone: customer.phone,
                                email: customer.email || '',
                                company: customer.company || '',
                                notes: customer.notes || ''
                            })
                        }}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
                    >
                        إلغاء
                    </button>
                </div>
            </form>
        </div>
    )
}
