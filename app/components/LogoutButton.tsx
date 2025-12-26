'use client'

import { logoutAction } from '@/app/login/logout-action'
import { LogOut } from 'lucide-react'

export default function LogoutButton({ className }: { className?: string }) {
    return (
        <button
            onClick={() => logoutAction()}
            className={`p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition ${className}`}
            title="تسجيل الخروج"
        >
            <LogOut size={20} />
        </button>
    )
}
