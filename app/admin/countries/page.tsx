import { prisma } from '@/lib/prisma'
import CountryTable from './CountryTable'
import { Globe } from 'lucide-react'

export default async function CountriesPage() {
    // Fetch all countries
    const countries = await prisma.country.findMany({
        orderBy: { createdAt: 'desc' } // Newest first to see what employees added
    })

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                        <Globe className="text-blue-600" size={28} />
                        إدارة الوجهات
                    </h1>
                    <p className="text-gray-500 mt-1">التحكم في قائمة الوجهات المسموح بها في النظام.</p>
                </div>
            </div>

            <CountryTable countries={countries} />
        </div>
    )
}
