'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export default function QuotesFilter() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // Get current values
    const currentQuery = searchParams.get('query') || ''
    const currentStatus = searchParams.get('status') || 'All'
    const currentDate = searchParams.get('date') || 'All'

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (term) {
            params.set('query', term)
        } else {
            params.delete('query')
        }
        params.set('page', '1') // Reset page on filter
        router.replace(`/quotes?${params.toString()}`)
    }, 500)

    const handleFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== 'All') {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        params.set('page', '1')
        router.replace(`/quotes?${params.toString()}`)
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="بحث برقم العرض، اسم العميل، الجوال..."
                    defaultValue={currentQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
                <select
                    value={currentStatus}
                    onChange={(e) => handleFilter('status', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                    <option value="All">كل الحالات</option>
                    <option value="Draft">مسودة</option>
                    <option value="Sent">تم الإرسال</option>
                    <option value="Approved">معتمد</option>
                    <option value="Cancelled">ملغي</option>
                </select>
            </div>

            {/* Date Filter */}
            <div className="w-full md:w-48">
                <select
                    value={currentDate}
                    onChange={(e) => handleFilter('date', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                    <option value="All">كل التواريخ</option>
                    <option value="Today">اليوم</option>
                    <option value="Week">آخر 7 أيام</option>
                    <option value="Month">هذا الشهر</option>
                </select>
            </div>

            {/* Helper: My Quotes Toggle */}
            <div className="flex-none">
                <button
                    onClick={() => handleFilter('creator', searchParams.get('creator') === 'me' ? 'All' : 'me')}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition border ${searchParams.get('creator') === 'me'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                >
                    عروضي الخاصة
                </button>
            </div>
        </div>
    )
}
