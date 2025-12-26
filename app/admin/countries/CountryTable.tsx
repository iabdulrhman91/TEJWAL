import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Trash2, CheckCircle, XCircle, Plus, Loader2 } from 'lucide-react'
import AddCountryModal from './AddCountryModal'
import { deleteCountry, toggleCountryStatus } from './actions'

// Using the same server actions for manageability, assuming we add delete/toggle actions there later
// For now, mostly display and visual management

interface Country {
    id: number
    code: string
    nameAr: string
    nameEn: string
    isActive: boolean
}

interface CountryTableProps {
    countries: Country[]
}

export default function CountryTable({ countries }: CountryTableProps) {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [loadingId, setLoadingId] = useState<number | null>(null)

    const filtered = countries.filter(c =>
        c.nameAr.includes(searchTerm) ||
        c.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذه الوجهة؟')) return
        setLoadingId(id)
        try {
            await deleteCountry(id)
            router.refresh()
        } catch (e) {
            alert('فشل الحذف')
        } finally {
            setLoadingId(null)
        }
    }

    const handleToggle = async (id: number) => {
        setLoadingId(id)
        try {
            await toggleCountryStatus(id)
            router.refresh()
        } catch (e) {
            alert('فشل تغيير الحالة')
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b flex gap-4 justify-between items-center">
                <input
                    type="text"
                    placeholder="بحث في الوجهات..."
                    className="flex-1 max-w-sm p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition shadow-sm"
                >
                    <Plus size={18} />
                    <span>إضافة وجهة جديدة</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-gray-50 text-gray-600 font-medium">
                        <tr>
                            <th className="p-4">الاسم (عربي)</th>
                            <th className="p-4">الاسم (انجليزي)</th>
                            <th className="p-4">Code</th>
                            <th className="p-4">الحالة</th>
                            <th className="p-4">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filtered.map(country => (
                            <tr key={country.id} className="hover:bg-blue-50/50 transition">
                                <td className="p-4 font-bold text-gray-800">{country.nameAr}</td>
                                <td className="p-4 text-gray-500">{country.nameEn}</td>
                                <td className="p-4 font-mono text-xs bg-gray-100 rounded px-2 w-fit">{country.code}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleToggle(country.id)}
                                        disabled={loadingId === country.id}
                                        className="transition hover:opacity-80 disabled:opacity-50"
                                    >
                                        {country.isActive ?
                                            <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold"><CheckCircle size={12} /> نشط</span> :
                                            <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold"><XCircle size={12} /> غير نشط</span>
                                        }
                                    </button>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button
                                        onClick={() => handleDelete(country.id)}
                                        disabled={loadingId === country.id}
                                        title="حذف"
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                                    >
                                        {loadingId === country.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <div className="p-8 text-center text-gray-400">لا توجد نتائج</div>}
            </div>

            <AddCountryModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => router.refresh()}
            />
        </div>
    )
}
