import { getServices } from '@/app/services/actions'
import { getActiveSuppliers } from '../actions'
import QuoteForm from './quote-form'

export default async function NewQuotePage() {
    const services = await getServices()
    const flightSuppliers = await getActiveSuppliers('flight')
    const hotelSuppliers = await getActiveSuppliers('hotel')
    const serviceSuppliers = await getActiveSuppliers('service')

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">إنشاء عرض سعر جديد</h1>
            <QuoteForm
                catalogServices={services}
                flightSuppliers={flightSuppliers}
                hotelSuppliers={hotelSuppliers}
                serviceSuppliers={serviceSuppliers}
            />
        </div>
    )
}
