'use client'

import { useState, useEffect, useRef } from 'react'
import { getHotels } from '../admin/hotels/actions'

interface Hotel {
    id: number
    name: string
    city: string
    stars: number
}

export default function HotelAutocomplete({
    value,
    onChange,
    placeholder,
    className
}: {
    value: string,
    onChange: (name: string, city?: string, stars?: number) => void,
    placeholder?: string,
    className?: string
}) {
    const [query, setQuery] = useState(value)
    const [results, setResults] = useState<Hotel[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setQuery(value)
    }, [value])

    useEffect(() => {
        const fetchResults = async () => {
            if (query.length < 1) {
                setResults([])
                return
            }
            try {
                const data = await getHotels(query)
                setResults(data)
            } catch (error) {
                console.error('Hotel search error:', error)
            }
        }

        const timer = setTimeout(fetchResults, 300)
        return () => clearTimeout(timer)
    }, [query])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (hotel: Hotel) => {
        setQuery(hotel.name)
        onChange(hotel.name, hotel.city, hotel.stars)
        setIsOpen(false)
    }

    return (
        <div className="relative w-full" ref={containerRef}>
            <input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => {
                    const newValue = e.target.value
                    setQuery(newValue)
                    setIsOpen(true)
                    onChange(newValue)
                }}
                onFocus={() => setIsOpen(true)}
                className={`w-full p-2 border rounded ${className}`}
            />

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {results.map((hotel) => (
                        <button
                            key={hotel.id}
                            type="button"
                            onClick={() => handleSelect(hotel)}
                            className="w-full text-right px-4 py-2 hover:bg-gray-50 flex justify-between items-center group transition"
                        >
                            <div className="flex flex-col">
                                <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors uppercase">{hotel.name}</span>
                                <span className="text-xs text-gray-400">{hotel.city}</span>
                            </div>
                            <div className="flex text-yellow-500">
                                {Array.from({ length: hotel.stars }).map((_, i) => (
                                    <span key={i}>★</span>
                                ))}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
