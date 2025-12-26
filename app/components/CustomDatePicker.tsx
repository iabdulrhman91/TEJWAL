'use client'

import React from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { arSA, enUS } from 'date-fns/locale'

interface CustomDatePickerProps {
    selected: Date | null
    onChange: (date: Date | null) => void
    showTimeSelect?: boolean
    placeholderText?: string
    className?: string
    minDate?: Date | null
}

export default function CustomDatePicker({
    selected,
    onChange,
    showTimeSelect = false,
    placeholderText,
    className = "",
    minDate,
    inputClassName = ""
}: CustomDatePickerProps & { inputClassName?: string }) {
    const defaultPlaceholder = showTimeSelect ? "اختر التاريخ والوقت" : "اختر التاريخ"
    const finalPlaceholder = placeholderText || defaultPlaceholder

    return (
        <div className={`relative ${className}`}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-gray-400 pointer-events-none">
                {showTimeSelect ? <Clock size={16} /> : <CalendarIcon size={16} />}
            </div>
            <DatePicker
                selected={selected}
                onChange={onChange}
                showTimeSelect={showTimeSelect}
                dateFormat={showTimeSelect ? "yyyy/MM/dd HH:mm" : "yyyy/MM/dd"}
                placeholderText={finalPlaceholder}
                locale={enUS}
                className={`w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none num-en font-bold bg-white cursor-pointer ${inputClassName}`}
                calendarClassName="custom-calendar-popup"
                timeCaption="الوقت"
                minDate={minDate || undefined}
            />
        </div>
    )
}
