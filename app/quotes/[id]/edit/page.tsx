import { getQuote, getActiveSuppliers } from '../../actions'
import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import QuoteForm from '../../new/quote-form'
import { prisma } from '@/lib/prisma'

export default async function EditQuotePage({ params }: { params: { id: string } }) {
    const session = await getSession()
    if (!session) {
        redirect('/login')
    }

    const quote = await getQuote(parseInt(params.id))
    if (!quote) {
        notFound()
    }

    const catalogServices = await prisma.serviceCatalog.findMany({
        where: { isActive: true },
        select: { id: true, name: true, defaultUnitPrice: true }
    })

    const flightSuppliers = await getActiveSuppliers('flight')
    const hotelSuppliers = await getActiveSuppliers('hotel')
    const serviceSuppliers = await getActiveSuppliers('service')

    // Only allow editing Draft quotes
    if (quote.status !== 'Draft') {
        redirect(`/quotes/${params.id}`)
    }

    // Sales can only edit their own quotes, Admin can edit any
    if (session.role !== 'Admin' && quote.createdByUserId !== session.id) {
        redirect(`/quotes/${params.id}`)
    }

    return (
        <div className="max-w-7xl mx-auto p-8">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">تعديل عرض السعر</h1>
                    <p className="text-gray-500 mt-1">رقم العرض: {quote.quoteNumber}</p>
                </div>
            </div>

            <QuoteForm
                catalogServices={catalogServices}
                initialData={quote}
                initialQuoteId={quote.id}
                flightSuppliers={flightSuppliers}
                hotelSuppliers={hotelSuppliers}
                serviceSuppliers={serviceSuppliers}
            />
        </div>
    )
}
