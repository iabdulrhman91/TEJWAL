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

    if (session.role !== 'Admin' && quote.createdByUserId !== parseInt(session.id)) {
        return (
            <div className="max-w-2xl mx-auto p-8 mt-20 text-center">
                <div className="bg-red-50 text-red-800 p-6 rounded-xl border border-red-200 shadow-sm">
                    <h2 className="text-xl font-bold mb-2">عفواً، لا تملك صلاحية التعديل</h2>
                    <p className="mb-6">هذا العرض تم إنشاؤه بواسطة موظف آخر، ولا يمكن تعديله إلا من قبله أو من قبل المدير.</p>
                    <a href={`/quotes/${params.id}`} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition">
                        عودة لتفاصيل العرض
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto p-8">
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
