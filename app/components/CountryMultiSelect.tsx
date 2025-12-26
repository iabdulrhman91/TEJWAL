'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { X, Search, Check, Plus } from 'lucide-react'
import { COUNTRIES_LIST } from '@/lib/countries-data'
import { getAllCountries } from '../admin/countries/actions'

interface CountryItem {
    nameAr: string
    code: string
}

export default function CountryMultiSelect({
    value,
    onChange
}: {
    value: string,
    onChange: (value: string) => void
}) {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [dbCountries, setDbCountries] = useState<CountryItem[]>([])

    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Initial fetch of DB countries
    useEffect(() => {
        getAllCountries().then(data => {
            const mapped = data.map(c => ({ nameAr: c.nameAr, code: c.code }))
            setDbCountries(mapped)
        })
    }, [])

    // Combined list: Static + DB (Unique by nameAr)
    const allCountries = useMemo(() => {
        const unique = new Map<string, CountryItem>()

        // Add static first
        COUNTRIES_LIST.forEach(c => unique.set(c.nameAr, c))

        // Add/Overwrite with DB (assuming DB is source of truth if needed, simply adding missing ones)
        dbCountries.forEach(c => {
            if (!unique.has(c.nameAr)) unique.set(c.nameAr, c)
        })

        return Array.from(unique.values())
    }, [dbCountries])

    // Current selected items
    const selectedItems = useMemo(() => {
        if (!value) return []
        return value.split(/[,،]\s*/).filter(item => item && item.trim().length > 0)
    }, [value])

    // Filter suggestions
    const suggestions = useMemo(() => {
        if (!query) return allCountries.slice(0, 50)

        const lowerQuery = query.toLowerCase().trim()

        return allCountries.filter(c =>
            c.nameAr.includes(query) ||
            c.code.toLowerCase().includes(lowerQuery)
        ).sort((a, b) => {
            const aStarts = a.nameAr.startsWith(query)
            const bStarts = b.nameAr.startsWith(query)
            if (aStarts && !bStarts) return -1
            if (!aStarts && bStarts) return 1
            return 0
        }).slice(0, 10)
    }, [query, allCountries])

    const handleSelect = async (name: string) => {
        // Strict Mode: Only allow selecting existing items from the list
        if (!selectedItems.includes(name)) {
            const newItems = [...selectedItems, name]
            onChange(newItems.join('، '))
        }
        setQuery('')
        setIsOpen(false)
        inputRef.current?.focus()
    }

    const handleRemove = (name: string) => {
        const newItems = selectedItems.filter(item => item !== name)
        onChange(newItems.join('، '))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && query.trim()) {
            e.preventDefault()
            // Only select if exact match exists in suggestions
            const exactMatch = suggestions.find(s => s.nameAr === query.trim())
            if (exactMatch) {
                handleSelect(exactMatch.nameAr)
            }
        }
        if (e.key === 'Backspace' && !query && selectedItems.length > 0) {
            handleRemove(selectedItems[selectedItems.length - 1])
        }
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative w-full" ref={containerRef}>
            <div
                className="min-h-[42px] px-2 py-1.5 border rounded-lg bg-white flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                {selectedItems.map((item, index) => (
                    <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm font-bold flex items-center gap-1 group animate-in zoom-in duration-200 border border-blue-100">
                        {item}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemove(item) }}
                            className="hover:bg-blue-200 p-0.5 rounded-full text-blue-400 hover:text-blue-600 transition"
                        >
                            <X size={14} />
                        </button>
                    </span>
                ))}

                <div className="flex-1 flex items-center min-w-[120px] relative">
                    {selectedItems.length === 0 && !query && (
                        <Search size={16} className="absolute right-2 text-gray-400 pointer-events-none" />
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={selectedItems.length === 0 ? "       اختر الدولة..." : "إضافة دولة..."}
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setIsOpen(true)
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsOpen(true)}
                        className="w-full outline-none bg-transparent placeholder:text-gray-400 text-sm h-8 px-2 pr-8"
                    />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200 custom-scrollbar">
                    {/* Strict Mode: No 'Add New' button allowed */}

                    {suggestions.map((country, idx) => {
                        const isSelected = selectedItems.includes(country.nameAr)
                        // Safety check for unique key
                        const key = country.code && country.code !== 'NEW' ? country.code : `${country.nameAr}-${idx}`
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => !isSelected && handleSelect(country.nameAr)}
                                disabled={isSelected}
                                className={`w-full text-right px-4 py-2.5 flex justify-between items-center group transition border-b border-gray-50 last:border-0 ${isSelected ? 'bg-gray-50 opacity-50 cursor-default' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`font-medium ${isSelected ? 'text-gray-400' : 'text-gray-700'}`}>{country.nameAr}</span>
                                </div>
                                {isSelected ? (
                                    <Check size={16} className="text-green-500" />
                                ) : (
                                    <span className="text-[10px] text-gray-300 group-hover:text-blue-400 font-mono transition">{country.code}</span>
                                )}
                            </button>
                        )
                    })}

                    {suggestions.length === 0 && !query && (
                        <div className="p-4 text-center text-gray-400 text-sm">ابدأ الكتابة للبحث...</div>
                    )}
                </div>
            )}
        </div>
    )
}
