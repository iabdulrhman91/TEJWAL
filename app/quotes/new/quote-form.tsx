'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, Plane, Building2, Calendar, MapPin, HelpCircle, ChevronDown, ChevronLeft, ChevronRight, Edit3, CheckCircle2, PlaneTakeoff, PlaneLanding, Send } from 'lucide-react'
import { differenceInCalendarDays } from 'date-fns'
import { createQuote, updateQuote } from '../actions'
import AirportAutocomplete from '@/app/components/AirportAutocomplete'
import AirlineAutocomplete from '@/app/components/AirlineAutocomplete'
import HotelAutocomplete from '@/app/components/HotelAutocomplete'
import CountryMultiSelect from '@/app/components/CountryMultiSelect'
import CustomerPhoneInput from '@/app/components/CustomerPhoneInput'
import CurrencySymbol from '@/app/components/CurrencySymbol'
import NumberInput from '@/app/components/NumberInput'
import CustomDatePicker from '@/app/components/CustomDatePicker'

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
    isCollapsed?: boolean
}

const ROOM_CATEGORIES: Record<string, string[]> = {
    'شقق فندقية': ['استوديو', 'شقة غرفة وصالة', 'شقة غرفتين وصالة', 'شقة ثلاث غرف وصالة'],
    'غرف فندقية': ['غرفة قياسية', 'غرفة ديلوكس', 'غرفة بريميوم', 'غرفة مطلة على البحر', 'غرفة مطلة على النهر', 'غرفة مطلة على الجبل', 'غرفتين متصلتين'],
    'أجنحة': ['جناح جونيور', 'جناح تنفيذي', 'جناح عائلي'],
    'فلل وأكواخ': ['فيلا غرفة وصالة', 'فيلا غرفتين وصالة', 'فيلا ثلاث غرف وصالة', 'فيلا أربع غرف وصالة', 'كوخ', 'كوخ مطل على النهر', 'كوخ مطل على الجبل']
}

function SmartSelect({ value, onChange, options, placeholder = "اختر..." }: { value: string, onChange: (v: string) => void, options: { id?: string | number, name: string }[], placeholder?: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isCustom, setIsCustom] = useState(false)
    const [customVal, setCustomVal] = useState("")
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: any) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false)
                setIsCustom(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (val: string) => {
        onChange(val)
        setIsOpen(false)
    }

    const handleCustomSubmit = () => {
        if (customVal.trim()) {
            onChange(customVal)
            setIsOpen(false)
            setIsCustom(false)
            setCustomVal("")
        }
    }

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => { setIsOpen(!isOpen); setIsCustom(false); }}
                className="w-full p-2 border rounded-lg bg-white text-sm text-right flex justify-between items-center hover:border-blue-400 transition-colors h-[42px]"
            >
                <span className={value ? 'font-bold text-gray-700' : 'text-gray-400'}>{value || placeholder}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-blue-100 rounded-xl shadow-xl z-[50] p-2 animate-in fade-in zoom-in-95 duration-200 min-w-[200px] max-h-60 overflow-y-auto overflow-x-hidden">
                    {!isCustom ? (
                        <div className="space-y-1">
                            {options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelect(opt.name)}
                                    className="w-full text-right p-2 hover:bg-blue-50 rounded-lg text-sm text-gray-600 hover:text-blue-700 transition"
                                >
                                    {opt.name}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => { setIsCustom(true); setCustomVal(value || ""); }}
                                className="w-full text-right p-2 hover:bg-orange-50 rounded-lg flex justify-between items-center group text-orange-600 border-t mt-1 pt-2 font-bold text-sm"
                            >
                                <span>إدخال يدوي...</span>
                                <Plus size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="p-1">
                            <div className="flex items-center gap-2 mb-2 border-b pb-2">
                                <button type="button" onClick={() => setIsCustom(false)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ChevronRight size={16} /></button>
                                <span className="font-bold text-xs text-orange-600">كتابة يدوية</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="اكتب هنا..."
                                    value={customVal}
                                    onChange={e => setCustomVal(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCustomSubmit() } }}
                                    className="flex-1 min-w-0 p-2 border rounded-lg text-sm outline-none focus:border-orange-300"
                                />
                                <button type="button" onClick={handleCustomSubmit} className="bg-orange-500 text-white px-3 rounded-lg hover:bg-orange-600"><Plus size={16} /></button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
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
    returnWeight?: string

    showTransit?: boolean
    stopoverTime?: number // hours
    showReturnTransit?: boolean
    returnStopoverTime?: number // hours
    returnCabinClass?: 'Economy' | 'Business' | 'First'

    airline: string
    cabinClass?: 'Economy' | 'Business' | 'First'
    weight?: string
    flightType: 'OneWay' | 'RoundTrip'
    ticketCount: number
    supplier?: string
    costPrice: number
    price: number
    notes?: string
    isCollapsed?: boolean
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
    isCollapsed?: boolean
}

export default function QuoteForm({
    catalogServices,
    initialData,
    initialQuoteId,
    flightSuppliers = [],
    hotelSuppliers = [],
    serviceSuppliers = []
}: {
    catalogServices: Service[],
    initialData?: any,
    initialQuoteId?: number,
    flightSuppliers?: any[],
    hotelSuppliers?: any[],
    serviceSuppliers?: any[]
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Helpers for date conversion
    const toDate = (str: string | undefined | null) => str ? new Date(str) : null
    const fromDateTime = (date: Date | null) => date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''
    const fromDate = (date: Date | null) => date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : ''

    const formatArabicUnit = (count: number, unitSingular: string, unitDual: string, unitPlural: string) => {
        if (!count || count === 0) return `0 ${unitPlural}`;
        if (count === 1) return unitSingular;
        if (count === 2) return unitDual;
        if (count >= 3 && count <= 10) return `${count} ${unitPlural}`;
        return `${count} ${unitSingular}`;
    };

    const [customer, setCustomer] = useState({
        name: initialData?.customerName || '',
        phone: initialData?.customerPhone || '',
        email: initialData?.customerEmail || '',
        company: initialData?.customerCompany || '',
        destination: initialData?.destination || '',
        adults: initialData?.travelersCountAdults || 2, // Default to 2
        children: initialData?.travelersCountChildren || 0,
        infants: initialData?.travelersCountInfants || 0
    })

    // State to toggle extra travelers visibility even if counts are 0
    const [showExtraTravelers, setShowExtraTravelers] = useState(
        (initialData?.travelersCountChildren > 0 || initialData?.travelersCountInfants > 0) ? true : false
    )

    // Customer Info from phone lookup
    const [customerInfo, setCustomerInfo] = useState<any>(null)

    // Services State
    const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
        initialData?.quoteServices?.map((s: any) => ({
            localId: Math.random().toString(36).substr(2, 9),
            name: s.serviceName,
            unitPrice: s.unitPrice,
            quantity: s.quantity,
            total: s.serviceTotal,
            supplier: s.supplier,
            costPrice: s.costPrice || s.unitPrice,
            isCollapsed: true
        })) || []
    )
    const [flights, setFlights] = useState<Flight[]>(
        initialData?.flightSegments?.map((f: any) => ({
            localId: Math.random().toString(36).substr(2, 9),
            from: f.fromAirport,
            to: f.toAirport,
            stopover: f.stopoverAirport,
            departure: f.departureDateTime ? new Date(f.departureDateTime).toISOString().slice(0, 16) : '',
            arrival: f.arrivalDateTime ? new Date(f.arrivalDateTime).toISOString().slice(0, 16) : '',
            airline: f.airline,
            cabinClass: f.cabinClass || 'Economy',
            weight: f.weight,
            flightType: f.flightType,
            ticketCount: f.ticketCount,
            supplier: f.supplier,
            costPrice: f.costPrice || f.segmentTotal,
            price: f.segmentTotal,
            notes: f.notes,
            returnFrom: f.returnFromAirport,
            returnTo: f.returnToAirport,
            returnStopover: f.returnStopoverAirport,
            returnDeparture: f.returnDepartureDateTime ? new Date(f.returnDepartureDateTime).toISOString().slice(0, 16) : '',
            returnArrival: f.returnArrivalDateTime ? new Date(f.returnArrivalDateTime).toISOString().slice(0, 16) : '',
            returnAirline: f.returnAirline,
            returnCabinClass: f.returnCabinClass || f.cabinClass || 'Economy',
            returnWeight: f.returnWeight,
            stopoverTime: f.stopoverTime,
            returnStopoverTime: f.returnStopoverTime,
            showTransit: !!f.stopoverAirport,
            showReturnTransit: !!f.returnStopoverAirport,
            isCollapsed: true
        })) || []
    )
    const [hotels, setHotels] = useState<Hotel[]>(
        initialData?.hotelStays?.map((h: any) => ({
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
            notes: h.notes,
            isCollapsed: true
        })) || []
    )
    const [markup, setMarkup] = useState<number>(initialData?.markup || 0)

    // Room Type Picker State
    const [openRoomPicker, setOpenRoomPicker] = useState<string | null>(null) // hotel localId
    const [activeRoomCategory, setActiveRoomCategory] = useState<string | null>(null)
    const [customRoomInputs, setCustomRoomInputs] = useState<Record<string, string>>({})

    const [isCustomerCollapsed, setIsCustomerCollapsed] = useState(!!initialData)

    // Handlers
    const addService = () => {
        setIsCustomerCollapsed(true)
        setFlights(prev => prev.map(f => ({ ...f, isCollapsed: true })))
        setHotels(prev => prev.map(h => ({ ...h, isCollapsed: true })))
        setSelectedServices(prev => [...prev.map(s => ({ ...s, isCollapsed: true })), {
            localId: Math.random().toString(36).substr(2, 9),
            name: '',
            unitPrice: 0,
            quantity: 1,
            total: 0,
            costPrice: 0,
            supplier: '',
            isCollapsed: false
        }])
    }

    const addFlight = () => {
        setIsCustomerCollapsed(true)
        setSelectedServices(prev => prev.map(s => ({ ...s, isCollapsed: true })))
        setHotels(prev => prev.map(h => ({ ...h, isCollapsed: true })))
        setFlights(prev => [...prev.map(f => ({ ...f, isCollapsed: true })), {
            localId: Math.random().toString(36).substr(2, 9),
            from: '',
            to: '',
            departure: '',
            arrival: '',
            airline: '',
            cabinClass: 'Economy',
            flightType: 'OneWay',
            ticketCount: customer.adults + customer.children + customer.infants,
            weight: '',
            returnWeight: '',
            price: 0,
            costPrice: 0,
            isCollapsed: false
        }])
    }

    const addHotel = () => {
        setIsCustomerCollapsed(true)
        setFlights(prev => prev.map(f => ({ ...f, isCollapsed: true })))
        setSelectedServices(prev => prev.map(s => ({ ...s, isCollapsed: true })))
        setHotels(prev => [...prev.map(h => ({ ...h, isCollapsed: true })), {
            localId: Math.random().toString(36).substr(2, 9),
            city: '',
            hotelName: '',
            stars: 0,
            checkIn: '',
            checkOut: '',
            roomType: '',
            mealPlan: '',
            roomCount: 1, // Default to 1
            costPrice: 0,
            price: 0,
            supplier: '',
            isCollapsed: false
        }])
    }

    // Removers
    const removeService = (id: string) => setSelectedServices(selectedServices.filter(s => s.localId !== id))
    const removeFlight = (id: string) => setFlights(flights.filter(f => f.localId !== id))
    const removeHotel = (id: string) => setHotels(hotels.filter(h => h.localId !== id))

    // Updaters
    const updateService = (id: string, field: keyof SelectedService, value: any) => {
        if (field === 'isCollapsed' && value === false) {
            setIsCustomerCollapsed(true)
            setFlights(prev => prev.map(f => ({ ...f, isCollapsed: true })))
            setHotels(prev => prev.map(h => ({ ...h, isCollapsed: true })))
        }

        setSelectedServices(prev => prev.map(s => {
            if (s.localId === id) {
                const updated = { ...s, [field]: value }
                if (field === 'catalogId') {
                    const item = catalogServices.find(c => c.id === parseInt(value))
                    if (item) { updated.name = item.name; updated.unitPrice = item.defaultUnitPrice || 0; updated.costPrice = item.defaultUnitPrice || 0 }
                }
                if (field === 'costPrice') {
                    updated.unitPrice = value // Link unitPrice to costPrice by default
                }
                updated.total = updated.costPrice || 0
                return updated
            }
            if (field === 'isCollapsed' && value === false) {
                return { ...s, isCollapsed: true }
            }
            return s
        }))
    }

    const updateFlight = (id: string, data: Partial<Flight> | keyof Flight, value?: any) => {
        const isExpanding = (typeof data === 'string' && data === 'isCollapsed' && value === false) || (typeof data === 'object' && data.isCollapsed === false);

        if (isExpanding) {
            setIsCustomerCollapsed(true)
            setSelectedServices(prev => prev.map(s => ({ ...s, isCollapsed: true })))
            setHotels(prev => prev.map(h => ({ ...h, isCollapsed: true })))
        }

        setFlights(prev => prev.map(f => {
            if (f.localId === id) {
                let updated: Flight;
                if (typeof data === 'string') {
                    updated = { ...f, [data]: value }
                    if (data === 'showTransit' && value === false) {
                        updated.stopover = ''
                        updated.stopoverTime = 0
                    }
                    if (data === 'showReturnTransit' && value === false) {
                        updated.returnStopover = ''
                        updated.returnStopoverTime = 0
                    }

                    // Auto-calculate Arrival Time (Departure + 3 hours)
                    if (data === 'departure' && value) {
                        const d = new Date(value)
                        if (!isNaN(d.getTime())) {
                            d.setTime(d.getTime() + (3 * 60 * 60 * 1000))
                            updated.arrival = d.toISOString()
                        }
                    }
                    if (data === 'returnDeparture' && value) {
                        const d = new Date(value)
                        if (!isNaN(d.getTime())) {
                            d.setTime(d.getTime() + (3 * 60 * 60 * 1000))
                            updated.returnArrival = d.toISOString()
                        }
                    }

                    if (data === 'flightType' && value === 'RoundTrip') {
                        updated.returnFrom = f.to
                        updated.returnTo = f.from
                        updated.returnAirline = f.airline
                        updated.returnStopover = f.stopover
                        updated.returnStopoverTime = f.stopoverTime
                        updated.returnWeight = f.weight
                        updated.showReturnTransit = f.showTransit
                        updated.returnCabinClass = f.cabinClass || 'Economy'
                    }

                } else {
                    updated = { ...f, ...data }
                }
                return updated
            }
            if (isExpanding) return { ...f, isCollapsed: true };
            return f
        }))
    }

    const updateHotel = (id: string, data: Partial<Hotel> | keyof Hotel, value?: any) => {
        const isExpanding = (typeof data === 'string' && data === 'isCollapsed' && value === false) || (typeof data === 'object' && data.isCollapsed === false);

        if (isExpanding) {
            setIsCustomerCollapsed(true)
            setFlights(prev => prev.map(f => ({ ...f, isCollapsed: true })))
            setSelectedServices(prev => prev.map(s => ({ ...s, isCollapsed: true })))
        }

        setHotels(prev => prev.map(h => {
            if (h.localId === id) {
                if (typeof data === 'string') {
                    return { ...h, [data]: value }
                }
                return { ...h, ...data }
            }
            if (isExpanding) return { ...h, isCollapsed: true };
            return h
        }))
    }

    // Totals
    const totalServices = selectedServices.reduce((acc, curr) => acc + (curr.costPrice || 0), 0)
    const totalFlights = flights.reduce((acc, curr) => acc + (curr.costPrice || 0), 0)
    const totalHotels = hotels.reduce((acc, curr) => acc + (curr.costPrice || 0), 0)
    const grandTotal = totalServices + totalFlights + totalHotels + markup

    const handleSubmit = async (e: React.FormEvent, type: 'Draft' | 'Send' = 'Draft') => {
        e.preventDefault()
        // Validation Logic
        if (!customer.name.trim()) { alert('يرجى إدخال اسم العميل (حقل إلزامي)'); return }
        if (!customer.phone.trim()) { alert('يرجى إدخال رقم الجوال (حقل إلزامي لربط العميل)'); return }
        if (!customer.destination || (Array.isArray(customer.destination) && customer.destination.length === 0)) { alert('يرجى تحديد الوجهة (حقل إلزامي)'); return }

        // Validate Items Completeness
        const hasItems = flights.length > 0 || hotels.length > 0 || selectedServices.length > 0
        if (!hasItems) { alert('يجب إضافة خدمة واحدة على الأقل'); return }

        for (let i = 0; i < flights.length; i++) {
            const f = flights[i]
            // Basic One Way Checks
            if (!f.from || !f.to || !f.departure || !f.arrival || !f.airline || !f.costPrice || !f.weight || !f.supplier) {
                alert(`بيانات الرحلة رقم ${i + 1} (الذهاب) غير مكتملة. يرجى إكمال كافة الحقول (المغادرة والوصول والمورد والوزن).`)
                return
            }
            if (new Date(f.arrival) < new Date(f.departure)) {
                alert(`خطأ في تواريخ الرحلة رقم ${i + 1} (الذهاب): وقت الوصول لا يمكن أن يكون قبل وقت المغادرة.`)
                return
            }

            // Round Trip Checks
            if (f.flightType === 'RoundTrip') {
                if (!f.returnDeparture || !f.returnArrival || !f.returnFrom || !f.returnTo || !f.returnWeight || !f.returnAirline) {
                    alert(`بيانات الرحلة رقم ${i + 1} (العودة) غير مكتملة. يرجى إكمال كافة حقول العودة (التواريخ، الخطوط، الوزن).`)
                    return
                }
                // Logical Date Check: Return cannot be before Departure
                if (new Date(f.returnDeparture) < new Date(f.departure)) {
                    alert(`خطأ في تواريخ الرحلة رقم ${i + 1}: تاريخ العودة لا يمكن أن يكون قبل تاريخ الذهاب.`)
                    return
                }
                // Logical Date Check: Return Arrival cannot be before Return Departure
                if (new Date(f.returnArrival) < new Date(f.returnDeparture)) {
                    alert(`خطأ في تواريخ الرحلة رقم ${i + 1} (العودة): وقت وصول العودة لا يمكن أن يكون قبل وقت مغادرة العودة.`)
                    return
                }
            }
            // Transit Checks
            if (f.showTransit && (!f.stopover || !f.stopoverTime)) {
                alert(`بيانات الرحلة رقم ${i + 1} (ترانزيت الذهاب) غير مكتملة. يرجى تحديد مطار الترانزيت ومدة التوقف.`)
                return
            }
            if (f.flightType === 'RoundTrip' && f.showReturnTransit && (!f.returnStopover || !f.returnStopoverTime)) {
                alert(`بيانات الرحلة رقم ${i + 1} (ترانزيت العودة) غير مكتملة. يرجى تحديد مطار الترانزيت ومدة التوقف.`)
                return
            }
        }
        for (let i = 0; i < hotels.length; i++) {
            const h = hotels[i]
            if (!h.hotelName || !h.city || !h.stars || !h.checkIn || !h.checkOut || !h.costPrice || !h.roomCount || h.roomCount < 1 || !h.supplier || !h.roomType || !h.mealPlan) {
                alert(`بيانات الفندق رقم ${i + 1} غير مكتملة. يرجى التأكد من التقييم (النجوم) وكافة البيانات الأخرى.`)
                return
            }
            // Logical Date Check: CheckOut must be after CheckIn
            if (new Date(h.checkOut) <= new Date(h.checkIn)) {
                alert(`خطأ في تواريخ الفندق رقم ${i + 1}: تاريخ المغادرة يجب أن يكون بعد تاريخ الدخول.`)
                return
            }
        }
        for (let i = 0; i < selectedServices.length; i++) {
            const s = selectedServices[i]
            if (!s.name || !s.costPrice || !s.quantity || s.quantity < 1) {
                alert(`بيانات الخدمة رقم ${i + 1} غير مكتملة. يرجى التأكد من الكمية والسعر.`)
                return
            }
        }

        startTransition(async () => {
            const formData = {
                customerName: customer.name,
                customerPhone: customer.phone,
                destination: customer.destination,
                travelersCountAdults: customer.adults,
                travelersCountChildren: customer.children,
                travelersCountInfants: customer.infants,
                selectedServices: selectedServices.filter(s => s.name),
                flights,
                hotels,
                markup
            }

            try {
                const result = initialQuoteId
                    ? await updateQuote(initialQuoteId, formData)
                    : await createQuote(formData)

                if (result.success) {
                    const id = initialQuoteId || result.id
                    router.push(`/quotes/${id}${type === 'Send' ? '?action=send' : ''}`)
                } else {
                    alert('حدث خطأ أثناء حفظ العرض')
                }
            } catch (error: any) {
                alert(error?.message || 'فشل الاتصال بالخادم')
            }
        })
    }

    console.log("Render QuoteForm");

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                        بيانات العميل
                    </h2>
                    {customerInfo && (
                        <button type="button" onClick={() => setCustomer({ ...customer, name: customerInfo.name })} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition shadow-lg">استخدام البيانات المحفوظة</button>
                    )}
                </div>
                {/* Collapsible Customer Section Logic */}
                {/* Collapsible Customer Section Logic */}
                {isCustomerCollapsed ? (
                    // Summary View (Card)
                    <div
                        onClick={() => setIsCustomerCollapsed(false)}
                        className="bg-gray-50 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-white hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                                    {customer.name.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">{customer.name || 'بيانات العميل'}</h3>
                                    <div className="text-xs text-gray-500 flex items-center gap-3 mt-1 font-medium">
                                        <span className="flex items-center gap-1"><MapPin size={12} /> {customer.destination && customer.destination.length > 0 ? (Array.isArray(customer.destination) ? customer.destination.join(', ') : customer.destination) : 'الوجهة غير محددة'}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span>{customer.adults + customer.children + customer.infants} مسافرين</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-blue-50 rounded-full">
                                <Edit3 size={16} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div>
                            <label className="block text-sm font-medium mb-1">اسم العميل <span className="text-red-500">*</span></label>
                            <input required type="text" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} className="w-full p-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">الجوال <span className="text-red-500">*</span></label>
                            <CustomerPhoneInput value={customer.phone} onChange={(value) => setCustomer({ ...customer, phone: value })} onCustomerFound={(info) => setCustomerInfo(info)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">الوجهة <span className="text-red-500">*</span></label>
                            <CountryMultiSelect
                                value={customer.destination}
                                onChange={val => setCustomer({ ...customer, destination: val })}
                            />
                        </div>
                        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Adults - Always Visible */}
                            <div>
                                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                                    بالغين
                                    <div className="relative group flex items-center">
                                        <HelpCircle size={14} className="text-gray-400 cursor-help" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                                            12+ سنة
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                        </div>
                                    </div>
                                </label>
                                <NumberInput
                                    value={customer.adults}
                                    onChange={val => {
                                        const newAdults = val < 1 ? 1 : val;
                                        setCustomer(prev => ({
                                            ...prev,
                                            adults: newAdults
                                        }))
                                    }}
                                    min={1}
                                    max={9}
                                />
                            </div>

                            {/* Children or Add Button */}
                            {!showExtraTravelers && customer.children === 0 && customer.infants === 0 ? (
                                <div>
                                    <label className="block text-sm font-medium mb-1 opacity-0 pointer-events-none select-none">
                                        مسافة تعويضية
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowExtraTravelers(true)}
                                        className="text-blue-600 text-sm font-bold flex items-center justify-center gap-1 hover:bg-blue-50 w-full h-[42px] rounded-lg transition border border-dashed border-blue-200"
                                    >
                                        <Plus size={16} /> إضافة أطفال/رضع
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                                            أطفال
                                            <div className="relative group flex items-center">
                                                <HelpCircle size={14} className="text-gray-400 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                                                    2-11 سنة
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                </div>
                                            </div>
                                        </label>
                                        <NumberInput
                                            value={customer.children}
                                            onChange={val => setCustomer(prev => ({ ...prev, children: val }))}
                                            min={0}
                                            max={9}
                                            disabled={customer.adults < 1}
                                        />
                                    </div>

                                    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                                        <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                                            رضع
                                            <div className="relative group flex items-center">
                                                <HelpCircle size={14} className="text-gray-400 cursor-help" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                                                    أقل من سنتين
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                                </div>
                                            </div>
                                        </label>
                                        <NumberInput
                                            value={customer.infants}
                                            onChange={val => setCustomer(prev => ({ ...prev, infants: val }))}
                                            min={0}
                                            max={customer.adults}
                                            disabled={customer.adults < 1}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                )}
            </div>

            {/* Flights Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Plane className="text-blue-500" />الطيران</h2>
                    <button type="button" onClick={addFlight} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium font-bold transition"><Plus size={18} /> إضافة رحلة</button>
                </div>
                <div className="space-y-4">
                    {flights.map((flight, index) => (
                        <div key={flight.localId} className={`rounded - xl border transition - all duration - 300 ${flight.isCollapsed ? 'bg-white border-blue-100 hover:border-blue-300 shadow-sm' : 'bg-gray-50 border-gray-200 relative p-4'} `}>

                            {flight.isCollapsed ? (
                                // Summary View (Collapsed) - Premium Boarding Pass Design
                                <div className="p-4 cursor-pointer group bg-white hover:bg-gray-50/50 transition-all duration-300 border-r-4 border-r-blue-600 rounded-xl" onClick={() => updateFlight(flight.localId, 'isCollapsed', false)}>
                                    <div className="flex flex-col md:flex-row items-center gap-6">

                                        {/* 1. Right Section: Airline Details (Ticket Info Block) */}
                                        <div className="md:w-1/4 flex flex-col items-start justify-center text-right gap-1 border-l border-gray-100 pl-4 py-1">
                                            <div className="text-[15px] font-black text-blue-900 leading-tight mb-0.5">{flight.airline || 'طيران غير محدد'}</div>
                                            <div className="flex items-center gap-2 text-[12px] text-gray-500 font-medium">
                                                <span>الوزن:</span>
                                                <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                                                    {flight.weight || '0'}
                                                    {flight.flightType === 'RoundTrip' && (
                                                        <span className="opacity-50"> / {flight.returnWeight || flight.weight || '0'}</span>
                                                    )}
                                                    {' '}كجم
                                                </span>
                                            </div>
                                            <div className="mt-1.5 flex items-center">
                                                <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-3 py-1 rounded-full border border-blue-100">
                                                    {formatArabicUnit(flight.ticketCount, 'تذكرة', 'تذكرتين', 'تذاكر')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 2. Middle Section: Route (Premium Boarding Pass Style) */}
                                        <div className="flex-1 flex flex-col gap-6">
                                            {[
                                                {
                                                    from: flight.from, to: flight.to, dep: flight.departure, arr: flight.arrival,
                                                    transit: flight.showTransit && flight.stopoverTime ? { time: flight.stopoverTime, city: flight.stopover || '' } : null,
                                                    icon: <PlaneTakeoff size={18} className="text-blue-400" style={{ transform: 'scaleX(-1) translateY(-5px)' }} />
                                                },
                                                ...(flight.flightType === 'RoundTrip' ? [{
                                                    from: flight.returnFrom || flight.to, to: flight.returnTo || flight.from, dep: flight.returnDeparture, arr: flight.returnArrival,
                                                    transit: flight.showReturnTransit && flight.returnStopoverTime ? { time: flight.returnStopoverTime, city: flight.returnStopover || '' } : null,
                                                    icon: <PlaneLanding size={18} className="text-blue-400" style={{ transform: 'scaleX(-1) translateY(-5px)' }} />
                                                }] : [])
                                            ].map((route, rIdx) => (
                                                <div key={rIdx} className={`flex items-center justify-between gap-4 ${rIdx > 0 ? 'pt-4 border-t border-gray-50' : ''}`}>
                                                    {/* Origin */}
                                                    <div className="text-right min-w-[100px]">
                                                        <div className="text-[18px] font-black text-gray-900 font-sans tracking-tight">
                                                            {route.dep ? new Date(route.dep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                        </div>
                                                        <div className="text-[13px] font-bold text-gray-500 mt-0.5">{(route.from.split(' - ')[1] || route.from).trim()}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold mt-1">{route.dep ? new Date(route.dep).toLocaleDateString('en-GB') : ''}</div>
                                                    </div>

                                                    {/* Path Area */}
                                                    <div className="flex-1 flex flex-col items-center justify-center px-2 relative h-10">
                                                        <div className="w-full flex items-center justify-center relative">
                                                            <div className="w-full border-b-2 border-dotted border-gray-200 absolute top-1/2"></div>
                                                            <div className="bg-white z-10 px-2 group-hover:bg-gray-50/10 transition-colors">
                                                                {route.icon}
                                                            </div>
                                                        </div>
                                                        {route.transit && (
                                                            <div className="absolute top-7 bg-orange-50/80 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-100/50 flex items-center gap-1 shadow-sm whitespace-nowrap">
                                                                <span>{(() => {
                                                                    const h = route.transit.time;
                                                                    if (h === 0.25) return '15 دقيقة';
                                                                    if (h === 0.5) return 'نصف ساعة';
                                                                    if (h === 0.75) return '45 دقيقة';
                                                                    if (h === 1) return 'ساعة واحدة';
                                                                    if (h === 1.5) return 'ساعة ونصف';
                                                                    if (h === 2) return 'ساعتين';
                                                                    if (h === 2.5) return 'ساعتين ونصف';
                                                                    return `${h} ساعة`;
                                                                })()}</span>
                                                                <span className="opacity-70">ترانزيت في {(route.transit.city.split(' - ')[1] || route.transit.city).split(' ')[0]}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Destination */}
                                                    <div className="text-left min-w-[100px]">
                                                        <div className="text-[18px] font-black text-gray-900 font-sans tracking-tight">
                                                            {route.arr ? new Date(route.arr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                        </div>
                                                        <div className="text-[13px] font-bold text-gray-500 mt-0.5">{(route.to.split(' - ')[1] || route.to).trim()}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold mt-1">{route.arr ? new Date(route.arr).toLocaleDateString('en-GB') : ''}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* 3. Left Section: Price & Actions */}
                                        <div className="md:w-1/6 flex flex-col items-center justify-center border-r border-gray-100 pr-6 gap-3">
                                            {flight.costPrice > 0 && (
                                                <div className="text-center group-hover:scale-105 transition-transform">
                                                    <div className="flex items-baseline gap-1 justify-center">
                                                        <span className="text-[22px] font-black text-gray-900 font-sans">{flight.costPrice.toLocaleString('en-US')}</span>
                                                        <span className="text-[12px] text-gray-400 font-bold underline decoration-blue-200 decoration-2 underline-offset-4"><CurrencySymbol /></span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                <button type="button" onClick={(e) => { e.stopPropagation(); updateFlight(flight.localId, 'isCollapsed', false) }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-all"><Edit3 size={15} /></button>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); removeFlight(flight.localId) }} className="p-1.5 text-red-400 hover:bg-red-50 rounded-md transition-all"><Trash2 size={15} /></button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            ) : (



                                // Detailed View (Expanded)
                                <>
                                    <button type="button" onClick={() => removeFlight(flight.localId)} className="absolute top-4 left-4 text-gray-400 hover:text-red-500 z-10"><Trash2 size={18} /></button>

                                    <div className="mb-6 pb-4 border-b border-gray-200 border-dashed flex justify-between items-center">
                                        <div className="text-sm font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg">التذكرة {index + 1}</div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                        <div><label className="text-xs text-gray-500">من</label><AirportAutocomplete value={flight.from} onChange={val => updateFlight(flight.localId, 'from', val)} placeholder="المغادرة من..." /></div>
                                        <div>
                                            <label className="text-xs text-gray-500">إلى</label>
                                            <AirportAutocomplete value={flight.to} onChange={val => updateFlight(flight.localId, 'to', val)} placeholder="الوصول إلى..." />

                                            {flight.showTransit ? (
                                                <div className="mt-2 pt-2 border-t border-gray-100">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="text-[10px] text-blue-600 font-bold">ترانزيت</label>
                                                        <button type="button" onClick={() => updateFlight(flight.localId, 'showTransit', false)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                                                    </div>
                                                    <AirportAutocomplete value={flight.stopover || ''} onChange={val => updateFlight(flight.localId, 'stopover', val)} placeholder="ترانزيت..." />
                                                </div>
                                            ) : (
                                                <button type="button" onClick={() => updateFlight(flight.localId, 'showTransit', true)} className="text-[10px] text-blue-600 font-bold mt-1 flex items-center gap-0.5 hover:underline">
                                                    <Plus size={12} /> إضافة ترانزيت
                                                </button>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">المغادرة</label>
                                            <CustomDatePicker
                                                selected={toDate(flight.departure)}
                                                onChange={date => updateFlight(flight.localId, 'departure', fromDateTime(date))}
                                                showTimeSelect
                                            />
                                            {flight.showTransit && (
                                                <div className="mt-2 pt-2 border-t border-gray-100">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="text-[10px] text-blue-600 font-bold">مدة التوقف (ساعة)</label>
                                                    </div>
                                                    <NumberInput
                                                        value={flight.stopoverTime || 0}
                                                        onChange={val => updateFlight(flight.localId, 'stopoverTime', val)}
                                                        min={0}
                                                        max={48}
                                                        step={0.5}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">الوصول</label>
                                            <CustomDatePicker
                                                selected={toDate(flight.arrival)}
                                                onChange={date => updateFlight(flight.localId, 'arrival', fromDateTime(date))}
                                                showTimeSelect
                                                minDate={toDate(flight.departure)}
                                            />
                                        </div>
                                    </div>

                                    {/* Airline & Ticket Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 bg-white p-4 rounded-xl border border-gray-100">
                                        <div className="md:col-span-4"><label className="text-xs text-gray-500">الخطوط</label><AirlineAutocomplete value={flight.airline} onChange={val => updateFlight(flight.localId, 'airline', val)} placeholder="اختر شركة الطيران..." /></div>

                                        {/* Weight - Outbound */}
                                        <div className="md:col-span-2">
                                            <label className="text-xs text-gray-500">الوزن (ذهاب) - كجم</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={flight.weight || ''}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    updateFlight(flight.localId, 'weight', val);
                                                }}
                                                placeholder="مثلاً: 23"
                                                className="w-full p-2 border rounded-lg text-center font-bold num-en"
                                                style={{ fontFamily: 'sans-serif' }}
                                            />
                                        </div>

                                        {/* Cabin Class Selection */}
                                        <div className="md:col-span-3">
                                            <label className="text-xs text-gray-500">الدرجة</label>
                                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                                <button
                                                    type="button"
                                                    onClick={() => updateFlight(flight.localId, 'cabinClass', 'Economy')}
                                                    className={`flex-1 py-1.5 text-sm rounded-lg font-bold transition-all ${!flight.cabinClass || flight.cabinClass === 'Economy' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    سياحية
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateFlight(flight.localId, 'cabinClass', 'Business')}
                                                    className={`flex-1 py-1.5 text-sm rounded-lg font-bold transition-all ${flight.cabinClass === 'Business' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    رجال أعمال
                                                </button>
                                            </div>
                                        </div>

                                        {/* Flight Type Selection - Restored Design */}
                                        <div className="md:col-span-3">
                                            <label className="text-xs text-gray-500">نوع الرحلة</label>
                                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                                <button
                                                    type="button"
                                                    onClick={() => updateFlight(flight.localId, 'flightType', 'OneWay')}
                                                    className={`flex-1 py-1.5 text-sm rounded-lg font-bold transition-all ${flight.flightType === 'OneWay' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    ذهاب فقط
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        updateFlight(flight.localId, 'flightType', 'RoundTrip');
                                                        if (flight.weight && !flight.returnWeight) updateFlight(flight.localId, 'returnWeight', flight.weight);
                                                    }}
                                                    className={`flex-1 py-1.5 text-sm rounded-lg font-bold transition-all ${flight.flightType === 'RoundTrip' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    ذهاب وعودة
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Return Flight Fields */}
                                    {
                                        flight.flightType === 'RoundTrip' && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top-4 fade-in duration-300">
                                                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                                    <Plane className="rotate-180 text-blue-400" size={16} />
                                                    رحلة العودة
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                                    <div><label className="text-xs text-gray-500">من (العودة)</label><AirportAutocomplete value={flight.returnFrom || flight.to} onChange={val => updateFlight(flight.localId, 'returnFrom', val)} placeholder="المغادرة..." /></div>
                                                    <div>
                                                        <label className="text-xs text-gray-500">إلى (العودة)</label>
                                                        <AirportAutocomplete value={flight.returnTo || flight.from} onChange={val => updateFlight(flight.localId, 'returnTo', val)} placeholder="الوصول..." />

                                                        {flight.showReturnTransit ? (
                                                            <div className="mt-2 pt-2 border-t border-gray-100">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <label className="text-[10px] text-blue-600 font-bold">ترانزيت العودة</label>
                                                                    <button type="button" onClick={() => updateFlight(flight.localId, 'showReturnTransit', false)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                                                                </div>
                                                                <AirportAutocomplete value={flight.returnStopover || ''} onChange={val => updateFlight(flight.localId, 'returnStopover', val)} placeholder="ترانزيت..." />
                                                            </div>
                                                        ) : (
                                                            <button type="button" onClick={() => updateFlight(flight.localId, 'showReturnTransit', true)} className="text-[10px] text-blue-600 font-bold mt-1 flex items-center gap-0.5 hover:underline">
                                                                <Plus size={12} /> إضافة ترانزيت للعودة
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500">الإقلاع (العودة)</label>
                                                        <CustomDatePicker
                                                            selected={toDate(flight.returnDeparture)}
                                                            onChange={date => updateFlight(flight.localId, 'returnDeparture', fromDateTime(date))}
                                                            showTimeSelect
                                                            minDate={toDate(flight.arrival) || toDate(flight.departure)}
                                                        />
                                                        {flight.showReturnTransit && (
                                                            <div className="mt-2 pt-2 border-t border-gray-100">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <label className="text-[10px] text-blue-600 font-bold">مدة التوقف (ساعة)</label>
                                                                </div>
                                                                <NumberInput
                                                                    value={flight.returnStopoverTime || 0}
                                                                    onChange={val => updateFlight(flight.localId, 'returnStopoverTime', val)}
                                                                    min={0}
                                                                    max={48}
                                                                    step={0.5}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500">الوصول (العودة)</label>
                                                        <CustomDatePicker
                                                            selected={toDate(flight.returnArrival)}
                                                            onChange={date => updateFlight(flight.localId, 'returnArrival', fromDateTime(date))}
                                                            showTimeSelect
                                                            minDate={toDate(flight.returnDeparture)}
                                                        />
                                                    </div>

                                                </div>

                                                {/* Return Details Row - Matches Top Layout */}
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 bg-white p-4 rounded-xl border border-gray-100">
                                                    {/* Return Airline */}
                                                    <div className="md:col-span-4">
                                                        <label className="text-xs text-gray-500">خطوط العودة</label>
                                                        <AirlineAutocomplete value={flight.returnAirline || flight.airline} onChange={val => updateFlight(flight.localId, 'returnAirline', val)} placeholder="اختر شركة الطيران..." />
                                                    </div>

                                                    {/* Return Weight */}
                                                    <div className="md:col-span-2">
                                                        <label className="text-xs text-gray-500">الوزن (عودة) - كجم</label>
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={flight.returnWeight || ''}
                                                            onChange={e => {
                                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                                updateFlight(flight.localId, 'returnWeight', val);
                                                            }}
                                                            placeholder="مثلاً: 23"
                                                            className="w-full p-2 border rounded-lg text-center font-bold num-en"
                                                            style={{ fontFamily: 'sans-serif' }}
                                                        />
                                                    </div>

                                                    {/* Return Class */}
                                                    <div className="md:col-span-3">
                                                        <label className="text-xs text-gray-500">الدرجة (عودة)</label>
                                                        <div className="flex bg-gray-100 p-1 rounded-xl">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateFlight(flight.localId, 'returnCabinClass', 'Economy')}
                                                                className={`flex-1 py-1.5 text-sm rounded-lg font-bold transition-all ${!flight.returnCabinClass || flight.returnCabinClass === 'Economy' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                            >
                                                                سياحية
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateFlight(flight.localId, 'returnCabinClass', 'Business')}
                                                                className={`flex-1 py-1.5 text-sm rounded-lg font-bold transition-all ${flight.returnCabinClass === 'Business' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                                            >
                                                                رجال أعمال
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }

                                    {/* Financials Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100 bg-gray-50/50 p-4 rounded-xl">
                                        {/* Ticket Count */}
                                        <div className="md:col-span-1">
                                            <label className="text-xs text-gray-500 mb-1 block">عدد التذاكر</label>
                                            <NumberInput value={flight.ticketCount} onChange={val => updateFlight(flight.localId, 'ticketCount', val)} min={1} />
                                        </div>

                                        {/* Supplier */}
                                        <div className="md:col-span-1">
                                            <label className="text-xs text-gray-500 mb-1 block">المورد</label>
                                            <SmartSelect
                                                value={flight.supplier || ''}
                                                onChange={val => updateFlight(flight.localId, 'supplier', val)}
                                                options={flightSuppliers}
                                                placeholder="المورد..."
                                            />
                                        </div>

                                        {/* Cost Price */}
                                        <div className="md:col-span-1">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">سعر التكلفة <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    lang="en"
                                                    dir="ltr"
                                                    value={flight.costPrice || ''}
                                                    onChange={e => {
                                                        const val = e.target.value.replace(/[^0-9.]/g, '');
                                                        updateFlight(flight.localId, 'costPrice', val ? parseFloat(val) : 0);
                                                    }}
                                                    className="w-full p-2 pl-12 border rounded-lg text-base font-bold text-gray-700 focus:ring-2 focus:ring-blue-100 outline-none num-en h-[42px]"
                                                    style={{ fontFamily: 'sans-serif' }}
                                                    placeholder="0"
                                                />
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                                                    <CurrencySymbol />
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                </>
                            )
                            }
                        </div>
                    ))}
                    {flights.length === 0 && <div className="text-center py-4 text-gray-400 text-sm">لا توجد رحلات مضافة</div>}
                    <div className="text-left font-bold text-gray-600 mt-2 flex items-center justify-end gap-1">إجمالي الطيران: {totalFlights.toLocaleString('en-US')}<CurrencySymbol className="w-4 h-4 text-gray-400" /></div>
                </div>
            </div>

            {/* Hotels Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Building2 className="text-purple-500" />الفنادق</h2>
                    <button type="button" onClick={addHotel} className="text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition"><Plus size={18} /> إضافة فندق</button>
                </div>
                <div className="space-y-4">
                    {hotels.map((hotel, index) => (
                        <div key={hotel.localId} className={`rounded-xl border transition-all duration-300 ${hotel.isCollapsed ? 'bg-white border-purple-100 hover:border-purple-300 shadow-sm' : 'bg-gray-50 border-gray-200 relative p-4'}`}>

                            {hotel.isCollapsed ? (
                                // Hotel Summary View (Purple Card)
                                <div className="p-4 cursor-pointer group bg-white hover:bg-purple-50/20 transition-all duration-300 border-r-4 border-r-purple-500 rounded-xl" onClick={() => updateHotel(hotel.localId, 'isCollapsed', false)}>
                                    <div className="flex flex-col md:flex-row items-center gap-6">

                                        {/* 1. Right: Hotel Info */}
                                        <div className="md:w-1/4 flex flex-col items-start justify-center gap-1 border-l border-gray-100 pl-4 py-1">
                                            <div className="text-[16px] font-black text-gray-900 leading-tight">{hotel.hotelName || 'اسم الفندق'}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-2 font-bold">
                                                <MapPin size={12} className="text-purple-400" />
                                                <span>{hotel.city || 'المدينة'}</span>
                                            </div>
                                            <div className="flex text-yellow-500 text-[10px] mt-0.5">
                                                {[...Array(hotel.stars || 0)].map((_, i) => <span key={i}>★</span>)}
                                            </div>
                                        </div>

                                        {/* 2. Middle: Dates & Duration */}
                                        <div className="flex-1 w-full flex items-center justify-between gap-4 px-4">
                                            <div className="text-center min-w-[90px]">
                                                <div className="text-[18px] font-black text-gray-900 font-sans tracking-tight">
                                                    {hotel.checkIn ? new Date(hotel.checkIn).toLocaleDateString('en-GB') : '--/--'}
                                                </div>
                                                <div className="text-[11px] text-gray-400 font-bold mt-0.5">دخول</div>
                                            </div>

                                            <div className="flex-1 flex flex-col items-center justify-center relative px-2">
                                                <div className="w-full border-b-2 border-dotted border-gray-200 absolute top-1/2"></div>
                                                <div className="z-10 bg-white px-2">
                                                    <div className="bg-purple-50 text-purple-700 font-bold px-3 py-0.5 rounded-full text-[11px] border border-purple-100 shadow-sm whitespace-nowrap">
                                                        {(() => {
                                                            const s = hotel.checkIn ? new Date(hotel.checkIn) : null
                                                            const e = hotel.checkOut ? new Date(hotel.checkOut) : null
                                                            if (s && e) return Math.ceil((e.getTime() - s.getTime()) / (86400000)) + ' ليالي'
                                                            return '---'
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-center min-w-[90px]">
                                                <div className="text-[18px] font-black text-gray-900 font-sans tracking-tight">
                                                    {hotel.checkOut ? new Date(hotel.checkOut).toLocaleDateString('en-GB') : '--/--'}
                                                </div>
                                                <div className="text-[11px] text-gray-400 font-bold mt-0.5">خروج</div>
                                            </div>
                                        </div>

                                        {/* 3. Left: Room & Price */}
                                        <div className="md:w-1/4 flex flex-col items-end gap-2 border-r border-gray-100 pr-6">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="bg-purple-50 text-purple-700 text-[11px] font-bold px-2 py-0.5 rounded border border-purple-100">
                                                    {formatArabicUnit(hotel.roomCount || 1, 'وحدة', 'وحدتين', 'وحدات')}
                                                </span>
                                                <span className="text-[12px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">{hotel.roomType || 'نوع الغرفة'}</span>
                                            </div>

                                            {hotel.costPrice > 0 && (
                                                <div className="flex items-center gap-1 mt-1 group-hover:scale-105 transition-transform">
                                                    <span className="text-[22px] font-black text-purple-600 font-sans">{Math.ceil(hotel.costPrice).toLocaleString('en-US')}</span>
                                                    <span className="text-[12px] font-bold text-gray-400 underline decoration-purple-200 decoration-2 underline-offset-4"><CurrencySymbol /></span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); updateHotel(hotel.localId, 'isCollapsed', false) }} className="p-2 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition"><Edit3 size={16} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); removeHotel(hotel.localId) }} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <button type="button" onClick={() => removeHotel(hotel.localId)} className="absolute top-4 left-4 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>

                                    <div className="mb-6 pb-4 border-b border-gray-200 border-dashed flex justify-between items-center">
                                        <div className="text-sm font-bold text-purple-900 bg-purple-50 px-3 py-1 rounded-lg">الفندق {index + 1}</div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                        <div className="md:col-span-2"><label className="text-xs text-gray-500">اسم الفندق</label><HotelAutocomplete value={hotel.hotelName} onChange={(name, city, stars) => { if (city !== undefined && stars !== undefined) { updateHotel(hotel.localId, { hotelName: name, city, stars }) } else { updateHotel(hotel.localId, 'hotelName', name) } }} /></div>
                                        <div><label className="text-xs text-gray-500">المدينة</label><input value={hotel.city} onChange={e => updateHotel(hotel.localId, 'city', e.target.value)} className="w-full p-2 border rounded" /></div>
                                        <div><label className="text-xs text-gray-500">النجوم</label><NumberInput value={hotel.stars} onChange={val => updateHotel(hotel.localId, 'stars', val)} max={7} /></div>
                                        <div>
                                            <label className="text-xs text-gray-500">دخول</label>
                                            <CustomDatePicker
                                                selected={toDate(hotel.checkIn)}
                                                onChange={date => {
                                                    updateHotel(hotel.localId, 'checkIn', fromDate(date))
                                                    // Auto-adjust Check-Out if Check-In is after current Check-Out
                                                    const currentOut = toDate(hotel.checkOut)
                                                    if (date && currentOut && date >= currentOut) {
                                                        const nextDay = new Date(date)
                                                        nextDay.setDate(nextDay.getDate() + 1)
                                                        updateHotel(hotel.localId, 'checkOut', fromDate(nextDay))
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">خروج</label>
                                            <div className="relative">
                                                <CustomDatePicker
                                                    selected={toDate(hotel.checkOut)}
                                                    onChange={date => updateHotel(hotel.localId, 'checkOut', fromDate(date))}
                                                    minDate={toDate(hotel.checkIn) ? new Date(toDate(hotel.checkIn)!.getTime() + 86400000) : undefined}
                                                    placeholderText="اختر التاريخ"
                                                    inputClassName={hotel.checkOut ? "pr-20" : ""}
                                                />
                                                {(() => {
                                                    const start = toDate(hotel.checkIn)
                                                    const end = toDate(hotel.checkOut)
                                                    if (start && end) {
                                                        const diff = differenceInCalendarDays(end, start)
                                                        if (diff > 0) return (
                                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-[10px] bg-blue-50 px-2 py-0.5 rounded-full z-20 pointer-events-none border border-blue-100 shadow-sm">
                                                                {diff} ليالي
                                                            </span>
                                                        )
                                                    }
                                                    return null
                                                })()}
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 p-0.5">
                                            <label className="text-xs text-gray-500">نوع الغرفة</label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (openRoomPicker === hotel.localId) {
                                                            setOpenRoomPicker(null)
                                                            setActiveRoomCategory(null)
                                                        } else {
                                                            setOpenRoomPicker(hotel.localId)
                                                            setActiveRoomCategory(null)
                                                        }
                                                    }}
                                                    className="w-full p-2 border rounded bg-white text-sm text-right flex justify-between items-center hover:border-blue-400 transition-colors h-[42px]"
                                                >
                                                    <span className={hotel.roomType ? 'font-bold' : 'text-gray-400'}>{hotel.roomType || '-- اختر النوع --'}</span>
                                                    <ChevronDown size={14} className={`text - gray - 400 transition - transform ${openRoomPicker === hotel.localId ? 'rotate-180' : ''} `} />
                                                </button>

                                                {openRoomPicker === hotel.localId && (
                                                    <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-blue-100 rounded-xl shadow-xl z-[100] p-2 animate-in fade-in zoom-in-95 duration-200 min-w-[240px]">
                                                        {!activeRoomCategory ? (
                                                            <div className="space-y-1">
                                                                {Object.keys(ROOM_CATEGORIES).map(cat => (
                                                                    <button
                                                                        key={cat}
                                                                        type="button"
                                                                        onClick={() => setActiveRoomCategory(cat)}
                                                                        className="w-full text-right p-2.5 hover:bg-blue-50 rounded-lg flex justify-between items-center group transition"
                                                                    >
                                                                        <span className="font-bold text-gray-700">{cat}</span>
                                                                        <ChevronLeft size={16} className="text-gray-300 group-hover:text-blue-500" />
                                                                    </button>
                                                                ))}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setActiveRoomCategory('custom')}
                                                                    className="w-full text-right p-2.5 hover:bg-orange-50 rounded-lg flex justify-between items-center group text-orange-600 border-t mt-1 pt-3"
                                                                >
                                                                    <span className="font-bold">إدخال يدوي...</span>
                                                                    <Plus size={16} />
                                                                </button>
                                                            </div>
                                                        ) : activeRoomCategory === 'custom' ? (
                                                            <div className="p-1">
                                                                <div className="flex items-center gap-2 mb-2 border-b pb-2">
                                                                    <button type="button" onClick={() => setActiveRoomCategory(null)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ChevronRight size={18} /></button>
                                                                    <span className="font-bold text-sm">إدخال يدوي</span>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        autoFocus
                                                                        type="text"
                                                                        placeholder="اكتب نوع الغرفة..."
                                                                        value={customRoomInputs[hotel.localId] || ''}
                                                                        onChange={e => setCustomRoomInputs(prev => ({ ...prev, [hotel.localId]: e.target.value }))}
                                                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); updateHotel(hotel.localId, 'roomType', customRoomInputs[hotel.localId]); setOpenRoomPicker(null) } }}
                                                                        className="flex-1 p-2 border rounded-lg text-sm"
                                                                    />
                                                                    <button type="button" onClick={() => { updateHotel(hotel.localId, 'roomType', customRoomInputs[hotel.localId]); setOpenRoomPicker(null) }} className="bg-blue-600 text-white px-3 rounded-lg"><Plus size={16} /></button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2 border-b pb-2">
                                                                    <button type="button" onClick={() => setActiveRoomCategory(null)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ChevronRight size={18} /></button>
                                                                    <span className="font-bold text-sm text-blue-600">{activeRoomCategory}</span>
                                                                </div>
                                                                <div className="max-h-48 overflow-y-auto scrollbar-thin">
                                                                    {ROOM_CATEGORIES[activeRoomCategory].map(item => (
                                                                        <button
                                                                            key={item}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                updateHotel(hotel.localId, 'roomType', item)
                                                                                setOpenRoomPicker(null)
                                                                                setActiveRoomCategory(null)
                                                                            }}
                                                                            className="w-full text-right p-2.5 hover:bg-blue-50 rounded-lg text-sm text-gray-600 hover:text-blue-700 transition"
                                                                        >
                                                                            {item}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">الوجبات</label>
                                            <select
                                                value={hotel.mealPlan}
                                                onChange={e => updateHotel(hotel.localId, 'mealPlan', e.target.value)}
                                                className="w-full p-2 border rounded bg-white"
                                            >
                                                <option value="">-- اختر --</option>
                                                <option value="بدون وجبات">بدون وجبات</option>
                                                <option value="إفطار فقط">إفطار فقط</option>
                                                <option value="إفطار + غداء">إفطار + غداء</option>
                                                <option value="إفطار + عشاء">إفطار + عشاء</option>
                                                <option value="جميع الوجبات">جميع الوجبات</option>
                                                <option value="شامل كلياً">شامل كلياً</option>
                                            </select>
                                        </div>
                                        <div><label className="text-xs text-gray-500">عدد الوحدات</label><NumberInput value={hotel.roomCount} onChange={val => updateHotel(hotel.localId, 'roomCount', val)} /></div>
                                        <div>
                                            <label className="text-xs text-gray-500">المورد</label>
                                            <SmartSelect
                                                value={hotel.supplier || ''}
                                                onChange={val => updateHotel(hotel.localId, 'supplier', val)}
                                                options={hotelSuppliers}
                                                placeholder="المورد..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-purple-600 font-bold mb-1 block">سعر التكلفة</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    lang="en"
                                                    dir="ltr"
                                                    value={hotel.costPrice || ''}
                                                    onChange={e => {
                                                        const val = e.target.value.replace(/[^0-9.]/g, '');
                                                        updateHotel(hotel.localId, 'costPrice', val ? parseFloat(val) : 0);
                                                    }}
                                                    className="w-full p-2 pl-8 border-purple-200 border rounded-lg font-bold text-purple-700 num-en h-[42px]"
                                                    style={{ fontFamily: 'sans-serif' }}
                                                    placeholder="0"
                                                />
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-[10px] font-bold">
                                                    <CurrencySymbol />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </>
                            )}
                        </div>
                    ))}
                    {hotels.length === 0 && <div className="text-center py-4 text-gray-400 text-sm">لا توجد فنادق مضافة</div>}
                    <div className="text-left font-bold text-gray-600 mt-2 flex items-center justify-end gap-1">إجمالي الفنادق: {totalHotels.toLocaleString('en-US')}<CurrencySymbol className="w-4 h-4 text-gray-400" /></div>
                </div>
            </div>

            {/* Services Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2"><span className="w-1 h-6 bg-green-600 rounded-full"></span>الخدمات الإضافية</h2>
                    <button type="button" onClick={addService} className="text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium font-bold transition"><Plus size={18} /> إضافة خدمة</button>
                </div>
                <div className="space-y-4">
                    {selectedServices.map(service => (
                        <div key={service.localId} className={`rounded-xl transition-all duration-300 ${service.isCollapsed ? 'bg-white border hover:border-green-300 shadow-sm' : 'bg-gray-50 border border-gray-100 p-4 relative group'}`}>
                            {service.isCollapsed ? (
                                // Service Summary View (Green Card)
                                <div className="p-4 cursor-pointer group bg-white hover:bg-green-50/20 transition-all duration-300 border-r-4 border-r-green-500 rounded-xl" onClick={() => updateService(service.localId, 'isCollapsed', false)}>
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <div className="md:w-1/3 flex flex-col items-start gap-1">
                                            <div className="text-[16px] font-black text-gray-900 leading-tight">{service.name || 'اسم الخدمة'}</div>
                                            <div className="text-xs text-green-600 font-bold">{service.supplier || 'بدون مورد'}</div>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center justify-center">
                                            <span className="bg-green-50 text-green-700 font-bold px-4 py-1 rounded-full text-[12px] border border-green-100 flex items-center gap-1">
                                                {formatArabicUnit(service.quantity, 'كمية', 'كميتين', 'كميات')}
                                            </span>
                                        </div>
                                        <div className="md:w-1/4 flex flex-col items-end gap-1 border-r border-gray-100 pr-4">
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-[20px] font-black text-green-600 font-sans">{Math.ceil(service.costPrice || 0).toLocaleString('en-US')}</span>
                                                <span className="text-[10px] font-bold text-gray-400 underline decoration-green-200"><CurrencySymbol /></span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); updateService(service.localId, 'isCollapsed', false) }} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition"><Edit3 size={16} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); removeService(service.localId) }} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row gap-4 items-end relative">
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">نوع الخدمة</label>
                                        <SmartSelect
                                            value={service.name || ''}
                                            onChange={val => updateService(service.localId, 'name', val)}
                                            options={catalogServices}
                                            placeholder="اختر الخدمة..."
                                        />
                                    </div>
                                    {/* Cost Price */}
                                    <div className="w-32">
                                        <label className="block text-xs font-medium text-gray-600 mb-1 font-bold">سعر التكلفة</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                lang="en"
                                                dir="ltr"
                                                value={service.costPrice || ''}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/[^0-9.]/g, '');
                                                    updateService(service.localId, 'costPrice', val ? parseFloat(val) : 0);
                                                }}
                                                className="w-full p-2 pl-8 border-green-200 border rounded-lg font-bold text-green-700 num-en h-[42px]"
                                                style={{ fontFamily: 'sans-serif' }}
                                                placeholder="0"
                                            />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 text-[10px] font-bold">
                                                <CurrencySymbol />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Quantity */}
                                    <div className="w-24">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">الكمية</label>
                                        <NumberInput value={service.quantity} onChange={val => updateService(service.localId, 'quantity', val)} />
                                    </div>

                                    {/* Done Button */}
                                    <div className="flex items-center gap-2 pb-0.5">

                                        <button type="button" onClick={() => removeService(service.localId)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="text-left font-bold text-gray-600 mt-2 flex items-center justify-end gap-1">إجمالي الخدمات: {totalServices.toLocaleString('en-US')}<CurrencySymbol className="w-4 h-4 text-gray-400" /></div>
                </div>
            </div >

            {/* Totals Section */}
            <div className="bg-blue-50/50 p-8 rounded-2xl border-2 border-blue-100 mt-12 flex flex-col md:flex-row justify-between items-end gap-8 shadow-inner">
                <div className="flex-1 w-full md:w-auto">
                    <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-blue-600 rounded-lg text-white"><Plus size={20} /></div><h3 className="text-xl font-bold text-blue-900">حساب الأرباح النهائي</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                            <label className="block text-sm font-bold text-gray-600 mb-2">إجمالي التكلفة</label>
                            <div className="text-2xl font-bold text-gray-400 flex items-center gap-1">{(totalFlights + totalHotels + totalServices).toLocaleString('en-US')}<CurrencySymbol className="w-5 h-5 text-gray-300" /></div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-blue-400 ring-4 ring-blue-50">
                            <label className="block text-sm font-bold text-blue-600 mb-2">هامش الربح</label>
                            <div className="flex items-center gap-2 mb-2"><input type="text" inputMode="numeric" lang="en" dir="ltr" value={markup || ''} onChange={e => { const val = e.target.value.replace(/[^0-9.]/g, ''); setMarkup(val ? parseFloat(val) : 0) }} className="text-3xl font-bold text-blue-700 w-full outline-none num-en" style={{ fontFamily: 'sans-serif' }} /><CurrencySymbol className="w-8 h-8 text-blue-400" /></div>
                            <div className="flex gap-2 justify-end">
                                {[5, 10, 15, 20].map(pct => (
                                    <button
                                        key={pct}
                                        type="button"
                                        onClick={() => {
                                            const totalCost = totalFlights + totalHotels + totalServices
                                            setMarkup(Math.ceil(totalCost * (pct / 100)))
                                        }}
                                        className="px-2 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                                    >
                                        {pct}%
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-600 p-8 rounded-2xl text-white shadow-xl min-w-[300px]">
                    <span className="text-blue-100 text-lg block mb-1">الإجمالي النهائي للعميل</span>
                    <div className="text-5xl font-black flex items-center gap-2">{grandTotal.toLocaleString('en-US')}<CurrencySymbol className="w-10 h-10 text-blue-100" /></div>
                </div>
            </div >

            <div className="flex gap-4 justify-end mt-8">
                <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl border hover:bg-gray-50 text-gray-600 transition">إلغاء</button>
                <button type="button" disabled={isPending} onClick={e => handleSubmit(e, 'Draft')} className="px-8 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center gap-2 font-bold disabled:opacity-50">{isPending ? 'جاري الحفظ...' : <><Save size={20} /><span>حفظ كمسودة</span></>}</button>
            </div>
        </form >
    )
}
