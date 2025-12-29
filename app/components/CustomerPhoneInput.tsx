'use client'

import { useState, useEffect } from 'react'
import { checkCustomerByPhone } from '@/app/customers/actions'
import { normalizePhone, formatPhoneDisplay } from '@/lib/phone'

export default function CustomerPhoneInput({
    value,
    onChange,
    onCustomerFound
}: {
    value: string
    onChange: (value: string) => void
    onCustomerFound?: (customer: any) => void
}) {
    const [showDetails, setShowDetails] = useState(false)
    const [customerInfo, setCustomerInfo] = useState<any>(null)
    const [isChecking, setIsChecking] = useState(false)

    useEffect(() => {
        const checkCustomer = async () => {
            if (!value || value.length < 9) {
                setCustomerInfo(null)
                return
            }

            setIsChecking(true)
            try {
                const info = await checkCustomerByPhone(value)
                setCustomerInfo(info)
                if (info && onCustomerFound) {
                    onCustomerFound(info)
                }
            } catch (error) {
                console.error('Error checking customer:', error)
            } finally {
                setIsChecking(false)
            }
        }

        const timer = setTimeout(checkCustomer, 500)
        return () => clearTimeout(timer)
    }, [value, onCustomerFound])

    return (
        <div className="space-y-1 relative">
            <div className="relative">
                <input
                    type="tel"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full p-2 pl-10 border rounded-lg transition-colors ${customerInfo ? 'border-green-500 bg-green-50/10' : ''}`}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                />

                {/* Status Indicator / Loading */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isChecking ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    ) : customerInfo ? (
                        <button
                            type="button"
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-green-600 hover:text-green-700 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Compact Status Line */}
            {customerInfo && (
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-green-700">{customerInfo.name}</span>
                        {customerInfo.hasActiveQuote && (
                            <span className="flex items-center gap-1 text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200">
                                ⚠️ مسودة نشطة
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Floating Details Card (Popover) - Does not push layout */}
            {showDetails && customerInfo && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-gray-900 border-b pb-2 w-full">سجل العميل</h4>
                            <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600 absolute left-4 top-4">✕</button>
                        </div>

                        {/* Active Quote Warning */}
                        {customerInfo.hasActiveQuote && (
                            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-xs">
                                <p className="font-bold text-yellow-800 flex items-center gap-1">
                                    ⚠️ تنبيه هام
                                </p>
                                <p className="text-yellow-700 mt-1">
                                    يوجد عرض مسودة لهذا العميل تم إنشاؤه خلال 24 ساعة الماضية.
                                </p>
                            </div>
                        )}

                        {/* Customer Stats */}
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between items-center text-gray-600">
                                <span>إجمالي العروض:</span>
                                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{customerInfo.totalQuotes}</span>
                            </div>

                            {Object.keys(customerInfo.quotesByEmployee || {}).length > 0 && (
                                <div className="space-y-1 pt-2">
                                    <p className="text-xs text-gray-400">توزيع العروض:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {Object.entries(customerInfo.quotesByEmployee).map(([employee, count]: [string, any]) => (
                                            <span key={employee} className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 border">
                                                {employee}: {count}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {customerInfo.lastQuoteDate && (
                                <p className="text-[10px] text-gray-400 pt-2 border-t mt-2 text-left">
                                    آخر عرض: {new Date(customerInfo.lastQuoteDate).toLocaleDateString('en-GB')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
