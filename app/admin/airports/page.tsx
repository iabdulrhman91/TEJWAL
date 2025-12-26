import { getAirports } from './actions'
import AirportTable from './AirportTable'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AirportsPage() {
    const session = await getSession()
    if (!session || session.role !== 'Admin') {
        redirect('/login')
    }

    const airports = await getAirports()

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إدارة المطارات</h1>
                    <p className="text-gray-500">إدارة قائمة المطارات المحلية والدولية</p>
                </div>
            </div>

            <AirportTable initialAirports={airports} />
        </div>
    )
}
