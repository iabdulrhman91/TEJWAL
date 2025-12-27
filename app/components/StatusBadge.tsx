'use client'

import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface StatusBadgeProps {
    isActive: boolean
    isLoading: boolean
    onToggle: () => void
    activeText?: string
    inactiveText?: string
}

export default function StatusBadge({
    isActive,
    isLoading,
    onToggle,
    activeText = 'نشط',
    inactiveText = 'معطل'
}: StatusBadgeProps) {
    return (
        <button
            onClick={onToggle}
            disabled={isLoading}
            className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all
                ${isLoading ? 'opacity-70 cursor-wait' : 'hover:scale-105 active:scale-95 cursor-pointer'}
                ${isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                    : 'bg-red-50 text-red-700 border border-red-100 hover:bg-red-100'
                }
            `}
            title={isActive ? 'انقر للتعطيل' : 'انقر للتفعيل'}
        >
            {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
            ) : (
                isActive ? <CheckCircle size={14} /> : <XCircle size={14} />
            )}
            <span>{isActive ? activeText : inactiveText}</span>
        </button>
    )
}
