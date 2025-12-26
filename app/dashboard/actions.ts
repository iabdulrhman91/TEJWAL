'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function getDashboardData(timeFilter: string = 'Today') {
    const session = await getSession()
    if (!session || session.role !== 'Admin') {
        throw new Error('Unauthorized')
    }

    const now = new Date()
    let startDate: Date

    switch (timeFilter) {
        case 'Today':
            startDate = new Date(now.setHours(0, 0, 0, 0))
            break
        case 'Week':
            const lastWeek = new Date(now)
            lastWeek.setDate(lastWeek.getDate() - 7)
            startDate = new Date(lastWeek.setHours(0, 0, 0, 0))
            break
        case 'Month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
        default:
            startDate = new Date(0)
    }

    const quotes = await prisma.quote.findMany({
        where: { createdAt: { gte: startDate } },
        include: { createdBy: true, sentBy: true }
    })

    const totalQuotes = quotes.length
    const draftCount = quotes.filter(q => q.status === 'Draft').length
    const sentCount = quotes.filter(q => q.status === 'Sent' || q.status === 'Approved').length
    const approvedCount = quotes.filter(q => q.status === 'Approved').length
    const cancelledCount = quotes.filter(q => q.status === 'Cancelled').length
    const totalProfit = quotes.filter(q => q.status === 'Approved').reduce((acc, q) => acc + (q.markup || 0), 0)

    // Employee Performance
    const users = await prisma.user.findMany()
    const performance = users.map(user => {
        const userQuotes = quotes.filter(q => q.createdByUserId === user.id)
        const sentSuccess = quotes.filter(q => q.sentByUserId === user.id && q.lastSendStatus === 'success')
        const approved = quotes.filter(q => q.status === 'Approved' && q.createdByUserId === user.id) // simplistic
        const cancelled = quotes.filter(q => q.status === 'Cancelled' && q.createdByUserId === user.id)

        return {
            id: user.id,
            name: user.name,
            role: user.role,
            createdCount: userQuotes.length,
            sentCount: sentSuccess.length,
            approvedCount: approved.length,
            cancelledCount: cancelled.length
        }
    }).sort((a, b) => b.createdCount - a.createdCount)

    // Average Times
    const createToSentTimes = quotes
        .filter(q => q.createdAt && q.sentAt)
        .map(q => (q.sentAt!.getTime() - q.createdAt.getTime()) / (1000 * 60))

    const sentToApprovedTimes = quotes
        .filter(q => q.sentAt && q.approvedAt)
        .map(q => (q.approvedAt!.getTime() - q.sentAt!.getTime()) / (1000 * 60))

    const avgCreateToSend = createToSentTimes.length > 0
        ? (createToSentTimes.reduce((a, b) => a + b, 0) / createToSentTimes.length).toFixed(1)
        : '-'

    const avgSentToApprove = sentToApprovedTimes.length > 0
        ? (sentToApprovedTimes.reduce((a, b) => a + b, 0) / sentToApprovedTimes.length).toFixed(1)
        : '-'

    return {
        stats: {
            totalQuotes,
            draftCount,
            sentCount,
            approvedCount,
            cancelledCount,
            totalProfit
        },
        performance,
        metrics: {
            avgCreateToSend,
            avgSentToApprove
        }
    }
}
