'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export default function DashboardFilter() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const current = searchParams.get('range') || 'Today'

    const setRange = (range: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('range', range)
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
            {['Today', 'Week', 'Month'].map((range) => (
                <button
                    key={range}
                    onClick={() => setRange(range)}
                    className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition
                        ${current === range
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'}
                    `}
                >
                    {range === 'Today' ? 'اليوم' : range === 'Week' ? 'الأسبوع' : 'الشهر'}
                </button>
            ))}
        </div>
    )
}
