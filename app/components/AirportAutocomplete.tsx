'use client'

import { useState, useEffect, useRef } from 'react'
import { searchAirports } from '../admin/airports/actions'

interface Airport {
    code: string
    cityAr: string
    cityEn: string
}

export default function AirportAutocomplete({
    value,
    onChange,
    placeholder,
    className
}: {
    value: string,
    onChange: (value: string, cityAr: string, code: string) => void,
    placeholder?: string,
    className?: string
}) {
    const [query, setQuery] = useState(value)
    const [results, setResults] = useState<Airport[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setQuery(value)
    }, [value])

    useEffect(() => {
        const fetchResults = async () => {
            if (query.length < 2) {
                setResults([])
                return
            }
            try {
                const data = await searchAirports(query)
                setResults(data)
            } catch (error) {
                console.error('Search error:', error)
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

    const handleSelect = (airport: Airport) => {
        const displayValue = `${airport.code} - ${airport.cityAr}`
        setQuery(displayValue)
        onChange(displayValue, airport.cityAr, airport.code)
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
                    onChange(newValue, '', '')
                }}
                onFocus={() => setIsOpen(true)}
                className={`w-full p-2 border rounded ${className}`}
            />

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {results.map((airport) => (
                        <button
                            key={airport.code}
                            type="button"
                            onClick={() => handleSelect(airport)}
                            className="w-full text-right px-4 py-2 hover:bg-gray-50 flex justify-between items-center group transition"
                        >
                            <span className="text-gray-900 font-medium">{airport.cityAr}</span>
                            <span className="text-blue-600 font-mono text-sm bg-blue-50 px-2 py-0.5 rounded group-hover:bg-blue-100 uppercase">{airport.code}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
