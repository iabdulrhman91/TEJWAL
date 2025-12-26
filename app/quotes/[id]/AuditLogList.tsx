import { prisma } from '@/lib/prisma'
import { Activity, User as UserIcon, Calendar } from 'lucide-react'

export default async function AuditLogList({ quoteId }: { quoteId: number }) {
    const logs = await prisma.auditLog.findMany({
        where: { quoteId },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
    })

    if (logs.length === 0) return null

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'CREATE_QUOTE': return 'إنشاء العرض'
            case 'APPROVE_QUOTE': return 'اعتماد العرض'
            case 'CANCEL_QUOTE': return 'إلغاء العرض'
            case 'SEND_WHATSAPP': return 'إرسال واتساب'
            case 'DOWNLOAD_PDF': return 'تحميل PDF'
            default: return action
        }
    }

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE_QUOTE': return 'text-blue-600'
            case 'APPROVE_QUOTE': return 'text-emerald-600'
            case 'CANCEL_QUOTE': return 'text-red-600'
            case 'SEND_WHATSAPP': return 'text-green-600'
            case 'DOWNLOAD_PDF': return 'text-purple-600'
            default: return 'text-gray-600'
        }
    }

    return (
        <div className="mt-12 pt-8 border-t print:hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="text-gray-400" size={24} />
                سجل النشاطات
            </h3>

            <div className="space-y-4">
                {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm transition hover:shadow-md">
                        <div className={`p-2 rounded-lg bg-gray-50 ${getActionColor(log.action)}`}>
                            <UserIcon size={20} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <span className={`font-bold ${getActionColor(log.action)}`}>
                                    {getActionLabel(log.action)}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(log.createdAt).toLocaleString('en-US')}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                بواسطة: <span className="font-semibold">{log.user.name}</span>
                                {log.metadata && (
                                    <span className="text-xs text-gray-500 mr-2 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                        {log.metadata}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
