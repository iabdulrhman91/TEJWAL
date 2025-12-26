'use client'

import React, { useState } from 'react'
import { User, Lock, Share2, Users, Save, ShieldCheck, Key, Globe, Layout, Building2, Plus } from 'lucide-react'
import { updateProfile, changePassword, updateIntegrationSettings } from './actions'
import UserList from '../users/user-list'
import AddSupplierModal from '../admin/suppliers/AddSupplierModal'
import SupplierTable from '../admin/suppliers/SupplierTable'
import CountryTable from '../admin/countries/CountryTable'

export default function SettingsContainer({
    session,
    initialUsers,
    initialSuppliers,
    initialCountries
}: {
    session: any,
    initialUsers?: any[],
    initialSuppliers?: any[],
    initialCountries?: any[]
}) {
    const [activeTab, setActiveTab] = useState('profile')
    const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    // Profile State
    const [name, setName] = useState(session.name)

    // Password State
    const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })

    const isAdmin = session.role === 'Admin'

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const res = await updateProfile({ name })
        if (res.success) {
            setMessage({ type: 'success', text: 'تم تحديث البيانات بنجاح' })
        } else {
            setMessage({ type: 'error', text: res.error || 'حدث خطأ' })
        }
        setLoading(false)
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwords.next !== passwords.confirm) {
            setMessage({ type: 'error', text: 'كلمات المرور الجديدة غير متطابقة' })
            return
        }
        setLoading(true)
        const res = await changePassword({
            currentPassword: passwords.current,
            newPassword: passwords.next
        })
        if (res.success) {
            setMessage({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح' })
            setPasswords({ current: '', next: '', confirm: '' })
        } else {
            setMessage({ type: 'error', text: res.error || 'حدث خطأ' })
        }
        setLoading(false)
    }

    const tabs = [
        { id: 'profile', label: 'الملف الشخصي', icon: User },
        { id: 'security', label: 'الأمان وكلمة المرور', icon: Lock },
        ...(isAdmin ? [
            { id: 'users', label: 'إدارة المستخدمين', icon: Users },
            { id: 'suppliers', label: 'إدارة الموردين', icon: Building2 },
            { id: 'countries', label: 'إدارة الوجهات', icon: Globe },
            { id: 'integrations', label: 'الربط التقني', icon: Share2 }
        ] : [])
    ]

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 flex flex-col gap-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id)
                            setMessage({ type: '', text: '' })
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                            : 'text-gray-500 hover:bg-white hover:text-blue-600 border border-transparent hover:border-gray-100'
                            }`}
                    >
                        <tab.icon size={20} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm min-h-[500px]">
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-bold border ${message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        : 'bg-red-50 border-red-100 text-red-600'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                <User size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">بيانات الحساب</h2>
                                <p className="text-sm text-gray-500">إدارة معلوماتك الشخصية في النظام</p>
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="max-w-md space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">الاسم بالكامل</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني (لا يمكن تغييره)</label>
                                <input
                                    type="email"
                                    value={session.email}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-100 border border-gray-100 rounded-xl text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <button
                                disabled={loading}
                                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save size={18} />
                                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                                <Lock size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">تغيير كلمة المرور</h2>
                                <p className="text-sm text-gray-500">تأكد من استخدام كلمة مرور قوية لحماية حسابك</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور الحالية</label>
                                <input
                                    type="password"
                                    required
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition"
                                />
                            </div>
                            <hr className="my-4 border-gray-100" />
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور الجديدة</label>
                                <input
                                    type="password"
                                    required
                                    value={passwords.next}
                                    onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">تأكيد كلمة المرور الجديدة</label>
                                <input
                                    type="password"
                                    required
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition"
                                />
                            </div>
                            <button
                                disabled={loading}
                                className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                            >
                                <ShieldCheck size={18} />
                                {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                            </button>
                        </form>
                    </div>
                )}

                {/* User Management Tab */}
                {activeTab === 'users' && isAdmin && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">إدارة الموظفين</h2>
                                <p className="text-sm text-gray-500">التحكم في صلاحيات الوصول للموظفين</p>
                            </div>
                            <a
                                href="/users/new"
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition"
                            >
                                <User size={16} />
                                إضافة موظف
                            </a>
                        </div>
                        <UserList initialUsers={initialUsers || []} />
                    </div>
                )}

                {/* Countries Tab */}
                {activeTab === 'countries' && isAdmin && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">إدارة الوجهات</h2>
                                <p className="text-sm text-gray-500">التحكم في قائمة الدول والوجهات المتاحة للموظفين</p>
                            </div>
                        </div>
                        <CountryTable countries={initialCountries || []} />
                    </div>
                )}

                {/* Integrations Tab */}
                {activeTab === 'integrations' && isAdmin && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                                <Share2 size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">الربط التقني (API)</h2>
                                <p className="text-sm text-gray-500">إعداد روابط الواتساب والخدمات الخارجية</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50 group hover:border-emerald-200 transition">
                                <div className="flex items-center gap-3 mb-4">
                                    <Globe className="text-emerald-500" />
                                    <h3 className="font-bold">واتساب (WhatsApp Business)</h3>
                                </div>
                                <p className="text-xs text-gray-500 mb-4 leading-relaxed">تحديد الـ Token ومسار الربط لإرسال العروض تلقائياً للعملاء.</p>
                                <input type="password" placeholder="API Key / Token" className="w-full px-3 py-2 text-sm border rounded-lg mb-3" />
                                <button className="text-xs font-bold text-emerald-600 hover:underline">حفظ الإعدادات</button>
                            </div>

                            <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50 group hover:border-blue-200 transition">
                                <div className="flex items-center gap-3 mb-4">
                                    <Key className="text-blue-500" />
                                    <h3 className="font-bold">نظام البريد (SMTP)</h3>
                                </div>
                                <p className="text-xs text-gray-500 mb-4 leading-relaxed">ربط البريد الرسمي للشركة لإرسال عروض الأسعار بصيغة PDF.</p>
                                <button className="text-xs font-bold text-blue-600 hover:underline">إعداد خادم البريد</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Suppliers Tab */}
                {activeTab === 'suppliers' && isAdmin && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">إدارة الموردين</h2>
                                <p className="text-sm text-gray-500">التحكم في قائمة مزودي الخدمات (طيران، فنادق، إلخ)</p>
                            </div>
                            <button
                                onClick={() => setIsAddSupplierOpen(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition"
                            >
                                <Plus size={16} />
                                إضافة مورد
                            </button>
                        </div>
                        <SupplierTable initialSuppliers={initialSuppliers || []} />
                        <AddSupplierModal isOpen={isAddSupplierOpen} onClose={() => setIsAddSupplierOpen(false)} />
                    </div>
                )}
            </div>
        </div >
    )
}
