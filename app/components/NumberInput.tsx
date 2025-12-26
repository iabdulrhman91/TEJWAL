'use client'

import { Plus, Minus } from 'lucide-react'

interface NumberInputProps {
    value: number | string
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    placeholder?: string
    className?: string
    disabled?: boolean
}

export default function NumberInput({
    value,
    onChange,
    min = 0,
    max,
    step = 1,
    placeholder,
    className = "",
    disabled = false
}: NumberInputProps) {
    const numValue = typeof value === 'string' ? (parseFloat(value) || 0) : value

    const handleIncrement = () => {
        if (disabled) return
        if (max !== undefined && numValue >= max) return
        onChange(Number((numValue + step).toFixed(2)))
    }

    const handleDecrement = () => {
        if (disabled) return
        if (numValue <= min) return
        onChange(Number((numValue - step).toFixed(2)))
    }

    return (
        <div className={`flex items-center border rounded-lg overflow-hidden bg-white hover:border-blue-400 transition-colors ${className} ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}>
            <button
                type="button"
                onClick={handleDecrement}
                disabled={disabled}
                className="p-2 hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors border-l disabled:pointer-events-none"
            >
                <Minus size={16} />
            </button>
            <input
                type="text"
                inputMode="decimal"
                value={numValue || ''}
                placeholder={placeholder}
                disabled={disabled}
                onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) onChange(val);
                    else if (e.target.value === '') onChange(0);
                }}
                className={`flex-1 min-w-0 py-2 focus:outline-none font-bold num-en text-center-force ${disabled ? 'bg-gray-50' : ''}`}
                dir="ltr"
                style={{ direction: 'ltr', fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"locl" 0' }}
            />
            <button
                type="button"
                onClick={handleIncrement}
                disabled={disabled}
                className="p-2 hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors border-r disabled:pointer-events-none"
            >
                <Plus size={16} />
            </button>
        </div>
    )
}
