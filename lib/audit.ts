import { prisma } from './prisma'

export async function createAuditLog({
    action,
    userId,
    quoteId,
    metadata,
}: {
    action: string
    userId: number
    quoteId?: number
    metadata?: any
}) {
    try {
        await prisma.auditLog.create({
            data: {
                action,
                userId,
                quoteId,
                metadata: metadata ? JSON.stringify(metadata) : null,
            },
        })
    } catch (error) {
        console.error('Failed to create audit log:', error)
    }
}
