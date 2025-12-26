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
        <div className="space-y-2">
            <div className="relative">
                <input
                    type="tel"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                />
                {isChecking && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    </div>
                )}
            </div>

            {customerInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    {/* Active Quote Warning */}
                    {customerInfo.hasActiveQuote && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex items-start gap-2">
                            <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="flex-1">
                                <p className="font-bold text-yellow-900">⚠️ تنبيه: عرض نشط حالياً</p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    يوجد عرض مسودة لهذا العميل تم إنشاؤه خلال آخر 24 ساعة
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Customer Info */}
                    <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                            <p className="font-bold text-blue-900">عميل موجود: {customerInfo.name}</p>
                            <p className="text-sm text-blue-700 mt-1">
                                إجمالي العروض: <span className="font-bold">{customerInfo.totalQuotes}</span>
                            </p>

                            {Object.keys(customerInfo.quotesByEmployee).length > 0 && (
                                <div className="mt-2 text-sm text-blue-700">
                                    <p className="font-medium">توزيع العروض:</p>
                                    <ul className="mt-1 space-y-1">
                                        {Object.entries(customerInfo.quotesByEmployee).map(([employee, count]: [string, any]) => (
                                            <li key={employee} className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                                <span>{count} عند {employee}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {customerInfo.lastQuoteDate && (
                                <p className="text-xs text-blue-600 mt-2">
                                    آخر عرض: {new Date(customerInfo.lastQuoteDate).toLocaleDateString('en-US')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
