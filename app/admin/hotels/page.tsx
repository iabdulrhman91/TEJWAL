import { getHotels } from './actions'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import HotelTable from './HotelTable'
import { Building2 } from 'lucide-react'

export default async function HotelsAdminPage() {
    const session = await getSession()
    if (!session || session.role !== 'Admin') {
        redirect('/')
    }

    const hotels = await getHotels()

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Building2 className="text-purple-600" size={32} />
                    مكتبة الفنادق
                </h1>
            </div>

            <HotelTable initialHotels={hotels} />
        </div>
    )
}
