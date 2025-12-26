'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

export default function SearchBar() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [query, setQuery] = useState(searchParams.get('query') || '')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        startTransition(() => {
            if (query) {
                router.push(`/quotes?query=${encodeURIComponent(query)}`)
            } else {
                router.push('/quotes')
            }
        })
    }

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="بحث باسم العميل، رقم الجوال، أو الوجهة..."
                    className="w-full pr-10 pl-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition"
                    disabled={isPending}
                >
                    <Search size={20} />
                </button>
            </div>
        </form>
    )
}
