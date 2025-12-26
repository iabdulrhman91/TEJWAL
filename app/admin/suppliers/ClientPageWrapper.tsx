'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import AddSupplierModal from './AddSupplierModal'

export default function ClientPageWrapper({ suppliers }: { suppliers: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group"
            >
                <Plus className="group-hover:rotate-90 transition-transform" />
                إضافة مورد
            </button>

            <AddSupplierModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}
