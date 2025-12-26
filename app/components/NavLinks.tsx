'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, FileText, Users, BarChart3, Settings, Plane, MapPin, Hotel, Briefcase, LayoutGrid } from 'lucide-react'

export default function NavLinks({ isAdmin }: { isAdmin: boolean }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <div className="hidden md:flex items-center gap-1 text-gray-600 font-medium">
            <Link
                href="/quotes"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition"
            >
                <FileText size={18} />
                <span>العروض</span>
            </Link>

            <Link
                href="/admin/customers"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition"
            >
                <Users size={18} />
                <span>العملاء</span>
            </Link>

            {isAdmin && (
                <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition"
                >
                    <BarChart3 size={18} />
                    <span>التقارير</span>
                </Link>
            )}

            {/* Trip Components Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-gray-50 transition border border-transparent ${isMenuOpen ? 'text-blue-600 bg-blue-50/50' : 'hover:text-blue-600'}`}
                >
                    <LayoutGrid size={18} />
                    <span>مكونات الرحلة</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMenuOpen && (
                    <div className="absolute top-full right-0 mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <Link
                            href="/admin/airports"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 hover:text-blue-600 transition"
                        >
                            <MapPin size={16} className="text-gray-400 group-hover:text-blue-500" />
                            <span>المطارات</span>
                        </Link>
                        <Link
                            href="/admin/airlines"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 hover:text-blue-600 transition"
                        >
                            <Plane size={16} className="text-gray-400 group-hover:text-blue-500" />
                            <span>الطيران</span>
                        </Link>
                        <Link
                            href="/admin/hotels"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 hover:text-blue-600 transition"
                        >
                            <Hotel size={16} className="text-gray-400 group-hover:text-blue-500" />
                            <span>الفنادق</span>
                        </Link>
                        <Link
                            href="/services"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 hover:text-blue-600 transition"
                        >
                            <Briefcase size={16} className="text-gray-400 group-hover:text-blue-500" />
                            <span>الخدمات</span>
                        </Link>
                    </div>
                )}
            </div>

            <Link
                href="/settings"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition"
            >
                <Settings size={18} />
                <span>الإعدادات</span>
            </Link>
        </div>
    )
}
