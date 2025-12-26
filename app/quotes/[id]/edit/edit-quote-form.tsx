'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, Plane, Building2, Calendar, MapPin, HelpCircle } from 'lucide-react'
import { updateQuote } from '../../actions'
import AirportAutocomplete from '@/app/components/AirportAutocomplete'
import AirlineAutocomplete from '@/app/components/AirlineAutocomplete'
import HotelAutocomplete from '@/app/components/HotelAutocomplete'
import CurrencySymbol from '@/app/components/CurrencySymbol'
import NumberInput from '@/app/components/NumberInput'
import CustomDatePicker from '@/app/components/CustomDatePicker'
import CountryMultiSelect from '@/app/components/CountryMultiSelect'

interface Service {
    id: number
    name: string
    defaultUnitPrice: number | null
}

interface SelectedService {
    localId: string
    catalogId?: number
    name: string
    unitPrice: number
    quantity: number
    total: number
    supplier?: string
    costPrice: number
}

interface Flight {
    localId: string
    from: string
    to: string
    stopover?: string
    departure: string
    arrival: string

    // Return leg
    returnFrom?: string
    returnTo?: string
    returnStopover?: string
    returnDeparture?: string
    returnArrival?: string
    returnAirline?: string

    showTransit?: boolean
    showReturnTransit?: boolean

    airline: string
    flightType: 'OneWay' | 'RoundTrip'
    ticketCount: number
    supplier?: string
    costPrice: number
    price: number
    notes?: string
}

interface Hotel {
    localId: string
    city: string
    hotelName: string
    stars: number
    checkIn: string
    checkOut: string
    roomType: string
    mealPlan: string
    roomCount: number
    supplier?: string
    costPrice: number
    price: number
    notes?: string
}

export default function EditQuoteForm({ quote }: { quote: any }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Helpers for date conversion
    const toDate = (str: string) => str ? new Date(str) : null
    const fromDateTime = (date: Date | null) => date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''
    const fromDate = (date: Date | null) => date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : ''

    // Customer State - Initialize with existing data
    const [customer, setCustomer] = useState({
        name: quote.customerName || '',
        phone: quote.customerPhone || '',
        destination: quote.destination || '',
        adults: quote.travelersCountAdults || 1,
        children: quote.travelersCountChildren || 0,
        infants: quote.travelersCountInfants || 0,
        notes: quote.notesInternal || ''
    })

    // Services State - Initialize with existing data
    const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
        quote.quoteServices.map((s: any) => ({
            localId: Math.random().toString(36).substr(2, 9),
            name: s.serviceName,
            unitPrice: s.unitPrice,
            quantity: s.quantity,
            total: s.serviceTotal,
            supplier: s.supplier,
            costPrice: s.costPrice || s.unitPrice
        }))
    )

    // Flights State - Initialize with existing data
    const [flights, setFlights] = useState<Flight[]>(
        quote.flightSegments.map((f: any) => ({
            localId: Math.random().toString(36).substr(2, 9),
            from: f.fromAirport,
            to: f.toAirport,
            stopover: f.stopoverAirport,
            departure: f.departureDateTime ? new Date(f.departureDateTime).toISOString().slice(0, 16) : '',
            arrival: f.arrivalDateTime ? new Date(f.arrivalDateTime).toISOString().slice(0, 16) : '',
            airline: f.airline,
            flightType: f.flightType,
            ticketCount: f.ticketCount,
            supplier: f.supplier,
            costPrice: f.costPrice || f.segmentTotal,
            price: f.segmentTotal,
            notes: f.notes,
            // Return leg
            returnFrom: f.returnFromAirport,
            returnTo: f.returnToAirport,
            returnStopover: f.returnStopoverAirport,
            returnDeparture: f.returnDepartureDateTime ? new Date(f.returnDepartureDateTime).toISOString().slice(0, 16) : '',
            returnArrival: f.returnArrivalDateTime ? new Date(f.returnArrivalDateTime).toISOString().slice(0, 16) : '',
            returnAirline: f.returnAirline,
            showTransit: !!f.stopoverAirport,
            showReturnTransit: !!f.returnStopoverAirport
        })) || []
    )

    // Hotels State - Initialize with existing data
    const [hotels, setHotels] = useState<Hotel[]>(
        quote.hotelStays.map((h: any) => ({
            localId: Math.random().toString(36).substr(2, 9),
            city: h.city,
            hotelName: h.hotelName,
            stars: h.hotelStars,
            checkIn: h.checkInDate ? new Date(h.checkInDate).toISOString().slice(0, 10) : '',
            checkOut: h.checkOutDate ? new Date(h.checkOutDate).toISOString().slice(0, 10) : '',
            roomType: h.roomType,
            mealPlan: h.mealPlan,
            roomCount: h.roomCount,
            supplier: h.supplier,
            costPrice: h.costPrice || h.stayTotal,
            price: h.stayTotal,
            notes: h.notes
        }))
    )

    const [markup, setMarkup] = useState<number>(quote.markup || 0)

    // Handlers
    const addService = () => {
        setSelectedServices(prev => [...prev, {
            localId: Math.random().toString(36).substr(2, 9),
            name: '',
            unitPrice: 0,
            quantity: 0,
            total: 0,
            costPrice: 0,
            supplier: 'Other'
        }])
    }

    const addFlight = () => {
        setFlights(prev => [...prev, {
            localId: Math.random().toString(36).substr(2, 9),
            from: '',
            to: '',
            departure: '',
            arrival: '',
            airline: '',
            flightType: 'RoundTrip',
            ticketCount: 0,
            costPrice: 0,
            price: 0,
            supplier: 'TBO'
        }])
    }

    const addHotel = () => {
        setHotels(prev => [...prev, {
            localId: Math.random().toString(36).substr(2, 9),
            city: '',
            hotelName: '',
            stars: 0,
            checkIn: '',
            checkOut: '',
            roomType: '',
            mealPlan: '',
            roomCount: 0,
            costPrice: 0,
            price: 0,
            supplier: 'TBO'
        }])
    }

    const removeService = (id: string) => setSelectedServices(prev => prev.filter(s => s.localId !== id))
    const removeFlight = (id: string) => setFlights(prev => prev.filter(f => f.localId !== id))
    const removeHotel = (id: string) => setHotels(prev => prev.filter(h => h.localId !== id))

    const updateService = (id: string, fieldOrData: Partial<SelectedService> | keyof SelectedService, value?: any) => {
        setSelectedServices(prev => prev.map(s => {
            if (s.localId === id) {
                let updated = { ...s }
                if (typeof fieldOrData === 'string') {
                    updated = { ...updated, [fieldOrData]: value }
                } else {
                    updated = { ...updated, ...fieldOrData }
                }

                if (updated.costPrice !== undefined) {
                    updated.unitPrice = updated.costPrice
                    updated.total = updated.unitPrice * updated.quantity
                }
                return updated
            }
            return s
        }))
    }

    const updateFlight = (id: string, data: Partial<Flight> | keyof Flight, value?: any) => {
        setFlights(prev => prev.map(f => {
            if (f.localId === id) {
                let updated: Flight;
                if (typeof data === 'string') {
                    updated = { ...f, [data]: value }
                    if (data === 'flightType' && value === 'RoundTrip') {
                        updated.returnFrom = f.to
                        updated.returnTo = f.from
                        updated.returnAirline = f.airline
                        updated.returnStopover = f.stopover
                        updated.showReturnTransit = f.showTransit
                    }
                } else {
                    updated = { ...f, ...data }
                }
                return updated
            }
            return f
        }))
    }

    const updateHotel = (id: string, fieldOrData: Partial<Hotel> | keyof Hotel, value?: any) => {
        setHotels(prev => prev.map(h => {
            if (h.localId === id) {
                if (typeof fieldOrData === 'string') {
                    return { ...h, [fieldOrData]: value }
                }
                return { ...h, ...fieldOrData }
            }
            return h
        }))
    }

    // Totals
    const totalServices = selectedServices.reduce((acc, curr) => acc + (curr.costPrice * curr.quantity), 0)
    const totalFlights = flights.reduce((acc, curr) => acc + (curr.costPrice || 0), 0)
    const totalHotels = hotels.reduce((acc, curr) => acc + (curr.costPrice || 0), 0)
    const grandTotal = totalServices + totalFlights + totalHotels + markup

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!customer.name.trim()) {
            alert('يرجى إدخال اسم العميل')
            return
        }

        const hasItems = flights.length > 0 || hotels.length > 0 || selectedServices.length > 0
        if (!hasItems) {
            alert('يجب إضافة خدمة واحدة على الأقل')
            return
        }

        // Final validation is relaxed for edits since they are drafts
        // The server action handles optional dates correctly

        startTransition(async () => {
            const formData = {
                customerName: customer.name,
                customerPhone: customer.phone,
                destination: customer.destination,
                travelersCountAdults: customer.adults,
                travelersCountChildren: customer.children,
                travelersCountInfants: customer.infants,
                notesInternal: customer.notes,
                selectedServices: selectedServices.filter(s => s.name),
                flights,
                hotels,
                markup
            }

            try {
                const result = await updateQuote(quote.id, formData)
                if (result.success) {
                    router.push(`/quotes/${quote.id}`)
                } else {
                    alert('حدث خطأ أثناء حفظ التعديلات')
                }
            } catch (error: any) {
                console.error('Quote update error:', error)
                alert(error?.message || 'فشل الاتصال بالخادم')
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                    بيانات العميل
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">اسم العميل</label>
                        <input required type="text" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} className="w-full p-2 border rounded-lg num-en" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">الجوال</label>
                        <input type="tel" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} className="w-full p-2 border rounded-lg num-en" dir="ltr" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">الوجهة</label>
                        <CountryMultiSelect
                            value={customer.destination}
                            onChange={val => setCustomer({ ...customer, destination: val })}
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">بالغين</label>
                            <NumberInput
                                value={customer.adults}
                                onChange={val => setCustomer({ ...customer, adults: val })}
                                min={1}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">أطفال</label>
                            <NumberInput
                                value={customer.children}
                                onChange={val => setCustomer({ ...customer, children: val })}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">رضع</label>
                            <NumberInput
                                value={customer.infants}
                                onChange={val => setCustomer({ ...customer, infants: val })}
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">ملاحظات</label>
                        <textarea value={customer.notes} onChange={e => setCustomer({ ...customer, notes: e.target.value })} className="w-full p-2 border rounded-lg h-[42px]" />
                    </div>
                </div>
            </div>

            {/* Flights Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Plane className="text-blue-500" />
                        جدول الطيران
                    </h2>
                    <button type="button" onClick={addFlight} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition">
                        <Plus size={18} /> إضافة رحلة
                    </button>
                </div>
                <div className="space-y-6">
                    {flights.map(flight => (
                        <div key={flight.localId} className="bg-gray-50/50 p-6 rounded-2xl relative border border-gray-100 group transition-all hover:border-blue-200 hover:shadow-md">
                            <button type="button" onClick={() => removeFlight(flight.localId)} className="absolute top-4 left-4 text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">من</label>
                                    <AirportAutocomplete
                                        value={flight.from}
                                        onChange={(display, cityAr, code) => updateFlight(flight.localId, { from: display })}
                                        placeholder="المغادرة من..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">إلى</label>
                                    <AirportAutocomplete
                                        value={flight.to}
                                        onChange={(display, cityAr, code) => updateFlight(flight.localId, { to: display })}
                                        placeholder="الوصول إلى..."
                                    />

                                    {flight.showTransit ? (
                                        <div className="mt-2 pt-2 border-t border-blue-50 flex flex-col gap-1 animate-in slide-in-from-top-1 duration-200">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">الترانزيت</label>
                                                <button type="button" onClick={() => updateFlight(flight.localId, { stopover: '', showTransit: false })} className="text-red-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                                            </div>
                                            <AirportAutocomplete
                                                value={flight.stopover || ''}
                                                onChange={(display) => updateFlight(flight.localId, { stopover: display })}
                                                placeholder="الترانزيت..."
                                            />
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => updateFlight(flight.localId, { showTransit: true })} className="text-[10px] text-blue-600 font-bold mt-1 flex items-center gap-0.5 hover:underline transition-all">
                                            <Plus size={10} /> إضافة ترانزيت
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">المغادرة</label>
                                    <CustomDatePicker
                                        selected={toDate(flight.departure)}
                                        onChange={date => updateFlight(flight.localId, 'departure', fromDateTime(date))}
                                        showTimeSelect
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">الوصول</label>
                                    <CustomDatePicker
                                        selected={toDate(flight.arrival)}
                                        onChange={date => updateFlight(flight.localId, 'arrival', fromDateTime(date))}
                                        showTimeSelect
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">الخطوط</label>
                                    <AirlineAutocomplete
                                        value={flight.airline}
                                        onChange={(name) => updateFlight(flight.localId, 'airline', name)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">المزود (Supplier)</label>
                                    <select value={flight.supplier} onChange={e => updateFlight(flight.localId, 'supplier', e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                        <option value="Amadeus">Amadeus</option>
                                        <option value="TBO">TBO</option>
                                        <option value="Expedia">Expedia</option>
                                        <option value="Flyin">Flyin</option>
                                        <option value="Direct">Direct</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div><label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">سعر التكلفة</label><input type="number" lang="en" dir="ltr" style={{ fontVariantNumeric: 'lining-nums' }} value={flight.costPrice} onChange={e => updateFlight(flight.localId, 'costPrice', parseFloat(e.target.value) || 0)} className="w-full p-2 border border-blue-200 rounded-lg font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none no-spin" /></div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">عدد التذاكر</label>
                                    <NumberInput
                                        value={flight.ticketCount}
                                        onChange={val => updateFlight(flight.localId, 'ticketCount', val)}
                                    />
                                </div>
                                <div className="md:col-span-4 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer bg-white p-3 border rounded-xl hover:bg-gray-50 transition border-dashed">
                                        <input
                                            type="checkbox"
                                            checked={flight.flightType === 'RoundTrip'}
                                            onChange={e => updateFlight(flight.localId, 'flightType', e.target.checked ? 'RoundTrip' : 'OneWay')}
                                            className="w-5 h-5 text-blue-600 rounded-md"
                                        />
                                        <span className="text-sm font-bold text-gray-700">تفعيل رحلة العودة (ذهاب وعودة)</span>
                                    </label>
                                </div>

                                {flight.flightType === 'RoundTrip' && (
                                    <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6 bg-blue-50/30 p-6 rounded-2xl border border-blue-100 mt-2">
                                        <div className="md:col-span-4 text-blue-600 font-bold text-sm border-b border-blue-100 pb-3 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                            تفاصيل رحلة العودة
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">من (العودة)</label>
                                            <AirportAutocomplete value={flight.returnFrom || ''} onChange={val => updateFlight(flight.localId, 'returnFrom', val)} placeholder="مطار العودة..." />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">إلى (العودة)</label>
                                            <AirportAutocomplete value={flight.returnTo || ''} onChange={val => updateFlight(flight.localId, 'returnTo', val)} placeholder="مطار الوصول..." />

                                            {flight.showReturnTransit ? (
                                                <div className="mt-2 pt-2 border-t border-blue-50 flex flex-col gap-1 animate-in slide-in-from-top-1 duration-200">
                                                    <div className="flex justify-between items-center">
                                                        <label className="text-[9px] text-blue-600 font-bold uppercase">الترانزيت</label>
                                                        <button type="button" onClick={() => updateFlight(flight.localId, { returnStopover: '', showReturnTransit: false })} className="text-red-400 hover:text-red-500"><Trash2 size={10} /></button>
                                                    </div>
                                                    <AirportAutocomplete value={flight.returnStopover || ''} onChange={val => updateFlight(flight.localId, 'returnStopover', val)} placeholder="ترانزيت..." />
                                                </div>
                                            ) : (
                                                <button type="button" onClick={() => updateFlight(flight.localId, { showReturnTransit: true })} className="text-[9px] text-blue-600 font-bold mt-1 flex items-center gap-0.5 hover:underline transitions-all">
                                                    <Plus size={10} /> إضافة ترانزيت
                                                </button>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">الخطوط</label>
                                            <AirlineAutocomplete value={flight.returnAirline || ''} onChange={val => updateFlight(flight.localId, 'returnAirline', val)} placeholder="شركة الطيران..." />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">مغادرة العودة</label>
                                            <CustomDatePicker
                                                selected={toDate(flight.returnDeparture || '')}
                                                onChange={date => updateFlight(flight.localId, 'returnDeparture', fromDateTime(date))}
                                                showTimeSelect
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">وصول العودة</label>
                                            <CustomDatePicker
                                                selected={toDate(flight.returnArrival || '')}
                                                onChange={date => updateFlight(flight.localId, 'returnArrival', fromDateTime(date))}
                                                showTimeSelect
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-sm text-gray-500 flex items-center gap-1">الإجمالي لهذه الرحلة: <span className="font-bold text-gray-900">{(flight.costPrice || 0).toLocaleString('en-US')}</span> <CurrencySymbol className="w-3 h-3 text-gray-400" /></span>
                            </div>
                        </div>
                    ))}
                    {flights.length === 0 && <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">لا توجد رحلات مضافة بعد</div>}
                </div>
            </div>

            {/* Hotels Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Building2 className="text-purple-500" />
                        الإقامة الفندقية
                    </h2>
                    <button type="button" onClick={addHotel} className="text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition">
                        <Plus size={18} /> إضافة فندق
                    </button>
                </div>
                <div className="space-y-6">
                    {hotels.map(hotel => (
                        <div key={hotel.localId} className="bg-gray-50/50 p-6 rounded-2xl relative border border-gray-100 group transition-all hover:border-purple-200 hover:shadow-md">
                            <button type="button" onClick={() => removeHotel(hotel.localId)} className="absolute top-4 left-4 text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">اسم الفندق</label>
                                    <HotelAutocomplete
                                        value={hotel.hotelName}
                                        onChange={(name, city, stars) => {
                                            if (city !== undefined && stars !== undefined) {
                                                updateHotel(hotel.localId, { hotelName: name, city, stars })
                                            } else {
                                                updateHotel(hotel.localId, 'hotelName', name)
                                            }
                                        }}
                                        placeholder="بحث في مكتبة الفنادق..."
                                    />
                                </div>
                                <div><label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">المدينة</label><input placeholder="City" value={hotel.city} onChange={e => updateHotel(hotel.localId, 'city', e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" /></div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">النجوم</label>
                                    <NumberInput
                                        value={hotel.stars}
                                        onChange={val => updateHotel(hotel.localId, 'stars', val)}
                                        max={7}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">دخول</label>
                                    <CustomDatePicker
                                        selected={toDate(hotel.checkIn)}
                                        onChange={date => updateHotel(hotel.localId, 'checkIn', fromDate(date))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">خروج</label>
                                    <CustomDatePicker
                                        selected={toDate(hotel.checkOut)}
                                        onChange={date => updateHotel(hotel.localId, 'checkOut', fromDate(date))}
                                    />
                                </div>
                                <div><label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">الغرفة</label><input placeholder="جناح، غرفتين، إلخ..." value={hotel.roomType} onChange={e => updateHotel(hotel.localId, 'roomType', e.target.value)} className="w-full p-2 border rounded-lg num-en" /></div>
                                <div><label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">الوجبات</label><input placeholder="فطور، شامل، إلخ..." value={hotel.mealPlan} onChange={e => updateHotel(hotel.localId, 'mealPlan', e.target.value)} className="w-full p-2 border rounded-lg num-en" /></div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">عدد الغرف</label>
                                    <NumberInput
                                        value={hotel.roomCount}
                                        onChange={val => updateHotel(hotel.localId, 'roomCount', val)}
                                        className="font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">المزود (Supplier)</label>
                                    <select value={hotel.supplier} onChange={e => updateHotel(hotel.localId, 'supplier', e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                                        <option value="TBO">TBO</option>
                                        <option value="Expedia">Expedia</option>
                                        <option value="Flyin">Flyin</option>
                                        <option value="Direct">Direct</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2"><label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">سعر التكلفة</label><input type="number" lang="en" dir="ltr" style={{ fontVariantNumeric: 'lining-nums' }} value={hotel.costPrice} onChange={e => updateHotel(hotel.localId, 'costPrice', parseFloat(e.target.value) || 0)} className="w-full p-2 border border-purple-200 rounded-lg font-bold text-purple-600 focus:ring-2 focus:ring-purple-500 outline-none no-spin" /></div>
                            </div>
                        </div>
                    ))}
                    {hotels.length === 0 && <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">لا توجد فنادق مضافة بعد</div>}
                </div>
            </div>

            {/* Services Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                        الخدمات الإضافية
                    </h2>
                    <button type="button" onClick={addService} className="text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition">
                        <Plus size={18} /> إضافة خدمة
                    </button>
                </div>

                <div className="space-y-4">
                    {selectedServices.map((service) => (
                        <div key={service.localId} className="flex flex-col md:flex-row gap-6 items-end bg-gray-50/50 p-6 rounded-2xl relative group border border-gray-100 transition-all hover:border-green-200 hover:shadow-md">
                            <div className="flex-[2] min-w-[200px]">
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">وصف الخدمة</label>
                                <input type="text" value={service.name} onChange={(e) => updateService(service.localId, 'name', e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="مثلاً: تأشيرة، استقبال مطار، إلخ..." />
                            </div>
                            <div className="w-48">
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">المزود (Supplier)</label>
                                <input type="text" value={service.supplier} onChange={(e) => updateService(service.localId, 'supplier', e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="اسم المورد" />
                            </div>
                            <div className="w-32">
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider text-green-700">سعر التكلفة</label>
                                <input type="number" lang="en" dir="ltr" style={{ fontVariantNumeric: 'lining-nums' }} value={service.costPrice} onChange={(e) => updateService(service.localId, 'costPrice', parseFloat(e.target.value) || 0)} className="w-full p-2 border border-green-200 bg-green-50 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-bold text-green-600 no-spin" />
                            </div>
                            <div className="w-32">
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">الكمية</label>
                                <NumberInput
                                    value={service.quantity}
                                    onChange={val => updateService(service.localId, 'quantity', val)}
                                />
                            </div>
                            <div className="flex flex-col items-end min-w-[100px] pb-2">
                                <span className="text-[10px] text-gray-400 uppercase font-bold mb-1">الإجمالي</span>
                                <span className="font-bold text-gray-900 text-lg flex items-center gap-1">{(service.costPrice * service.quantity).toLocaleString('en-US')} <CurrencySymbol className="w-3 h-3 text-gray-400" /></span>
                            </div>
                            <button type="button" onClick={() => removeService(service.localId)} className="p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg mb-1"><Trash2 size={18} /></button>
                        </div>
                    ))}
                    {selectedServices.length === 0 && <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">لا توجد خدمات مضافة بعد</div>}
                </div>
            </div>

            {/* Total Section */}
            <div className="bg-blue-900 text-white p-8 rounded-2xl shadow-xl space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-blue-800/50 pb-6">
                    <div className="space-y-1">
                        <span className="text-blue-300 text-xs uppercase font-bold">مجموع الطيران</span>
                        <div className="text-xl font-bold flex items-center gap-1">
                            {totalFlights.toLocaleString('en-US')}
                            <CurrencySymbol className="w-4 h-4 text-blue-300" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-blue-300 text-xs uppercase font-bold">مجموع الفنادق</span>
                        <div className="text-xl font-bold flex items-center gap-1">
                            {totalHotels.toLocaleString('en-US')}
                            <CurrencySymbol className="w-4 h-4 text-blue-300" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-blue-300 text-xs uppercase font-bold">مجموع الخدمات</span>
                        <div className="text-xl font-bold flex items-center gap-1">
                            {totalServices.toLocaleString('en-US')}
                            <CurrencySymbol className="w-4 h-4 text-blue-300" />
                        </div>
                    </div>
                    <div className="bg-blue-800/50 p-4 rounded-xl space-y-1 border border-blue-700">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-blue-200 text-xs uppercase font-bold">ربح الشركة</span>
                            <HelpCircle size={14} className="text-blue-400" />
                        </div>
                        <input
                            type="number" lang="en" dir="ltr"
                            value={markup}
                            onChange={(e) => setMarkup(parseFloat(e.target.value) || 0)}
                            className="bg-transparent border-none p-0 text-xl font-bold text-blue-100 focus:ring-0 w-full outline-none no-spin"
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-2">
                    <div className="text-center md:text-right">
                        <div className="text-blue-300 text-sm mb-1 font-medium">الإجمالي النهائي للعميل</div>
                        <div className="text-5xl font-black text-white flex items-center gap-2">
                            {grandTotal.toLocaleString('en-US')}
                            <CurrencySymbol className="w-8 h-8 text-blue-300" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-8 py-3 rounded-xl border border-blue-700 text-blue-100 hover:bg-blue-800 transition font-medium"
                        >
                            إلغاء التعديل
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-10 py-3 rounded-xl bg-white text-blue-900 hover:bg-blue-50 transition shadow-lg font-black flex items-center gap-2 disabled:opacity-50"
                        >
                            {isPending ? 'جاري الحفظ...' : <><Save size={20} /> <span>حفظ وإغلاق</span></>}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}
