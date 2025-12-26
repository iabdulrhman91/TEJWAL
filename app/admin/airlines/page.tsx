import { getAirlines } from './actions'
import AirlineTable from './AirlineTable'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AirlinesPage() {
    const session = await getSession()
    if (!session || session.role !== 'Admin') {
        redirect('/login')
    }

    const airlines = await getAirlines()

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إدارة شركات الطيران</h1>
                    <p className="text-gray-500">إدارة قائمة شركات الطيران والرموز الخاصة بها</p>
                </div>
            </div>

            <AirlineTable initialAirlines={airlines} />
        </div>
    )
}
