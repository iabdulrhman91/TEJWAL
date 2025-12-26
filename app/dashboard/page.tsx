import { getDashboardData } from './actions'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardFilter from './DashboardFilter'
import { LayoutDashboard, FileText, Send, CheckCircle2, XCircle, Users, Clock } from 'lucide-react'
import CurrencySymbol from '@/app/components/CurrencySymbol'

export default async function DashboardPage({ searchParams }: { searchParams: { range?: string } }) {
    const session = await getSession()
    if (!session || session.role !== 'Admin') {
        redirect('/')
    }

    const data = await getDashboardData(searchParams.range)

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <LayoutDashboard className="text-blue-600" size={32} />
                    لوحة التقارير
                </h1>
                <DashboardFilter />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <StatCard icon={<FileText className="text-blue-600" />} label="إجمالي العروض" value={data.stats.totalQuotes} color="bg-blue-50" />
                <StatCard icon={<FileText className="text-gray-600" />} label="مسودات" value={data.stats.draftCount} color="bg-gray-50" />
                <StatCard icon={<Send className="text-orange-600" />} label="تم الإرسال" value={data.stats.sentCount} color="bg-orange-50" />
                <StatCard icon={<CheckCircle2 className="text-emerald-600" />} label="معتمد" value={data.stats.approvedCount} color="bg-emerald-50" />
                <StatCard icon={<XCircle className="text-red-600" />} label="ملغي" value={data.stats.cancelledCount} color="bg-red-50" />
                <div className="md:col-span-1 p-6 rounded-2xl border bg-yellow-50 border-yellow-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-yellow-700 font-bold text-sm">
                        <LayoutDashboard size={18} />
                        إجمالي الأرباح
                    </div>
                    <div className="text-2xl font-black text-yellow-800 flex items-center justify-end gap-1">
                        {data.stats.totalProfit.toLocaleString('en-US')}
                        <CurrencySymbol className="w-5 h-5 text-yellow-600/50" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Performance Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm overflow-hidden">
                    <div className="p-6 border-b flex items-center gap-2 font-bold text-gray-900 bg-gray-50/50">
                        <Users size={20} className="text-gray-400" />
                        أداء الموظفين
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="text-sm text-gray-500 bg-gray-50">
                                <tr>
                                    <th className="p-4 font-medium">الموظف</th>
                                    <th className="p-4 font-medium text-center">النشطة</th>
                                    <th className="p-4 font-medium text-center">المرسلة</th>
                                    <th className="p-4 font-medium text-center">المعتمدة</th>
                                    <th className="p-4 font-medium text-center">الملغاة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-gray-700">
                                {data.performance.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900">{user.name}</div>
                                            <div className="text-xs text-gray-400">{user.role}</div>
                                        </td>
                                        <td className="p-4 text-center font-semibold">{user.createdCount}</td>
                                        <td className="p-4 text-center text-emerald-600 font-semibold">{user.sentCount}</td>
                                        <td className="p-4 text-center text-blue-600 font-semibold">{user.approvedCount}</td>
                                        <td className="p-4 text-center text-red-600 font-semibold">{user.cancelledCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <h3 className="text-gray-500 text-sm font-bold mb-4 flex items-center gap-2">
                            <Clock size={16} />
                            متوسط زمن التنفيذ
                        </h3>
                        <div className="space-y-4">
                            <MetricItem label="من الإنشاء إلى الإرسال" value={data.metrics.avgCreateToSend} unit="دقيقة" />
                            <MetricItem label="من الإرسال إلى الاعتماد" value={data.metrics.avgSentToApprove} unit="دقيقة" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
                        <h3 className="text-blue-100 text-sm font-medium mb-1">نسبة التحويل</h3>
                        <div className="text-4xl font-bold mb-2">
                            {data.stats.totalQuotes > 0
                                ? ((data.stats.approvedCount / data.stats.totalQuotes) * 100).toFixed(0)
                                : 0}%
                        </div>
                        <p className="text-blue-100 text-xs">من إجمالي العروض المنشأة</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
    return (
        <div className={`p-6 rounded-2xl border ${color} border-opacity-50 flex flex-col gap-2`}>
            <div className="p-2 w-fit bg-white rounded-xl shadow-sm">
                {icon}
            </div>
            <div className="text-gray-500 text-sm font-medium">{label}</div>
            <div className="text-3xl font-bold text-gray-900">{value.toLocaleString('en-US')}</div>
        </div>
    )
}

function MetricItem({ label, value, unit }: { label: string, value: string, unit: string }) {
    return (
        <div>
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                {value} {value !== '-' && <span className="text-xs font-normal text-gray-500">{unit}</span>}
            </div>
        </div>
    )
}
