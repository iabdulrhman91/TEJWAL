
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Cleaning up invalid airports...')

    // List of invalid codes that were replaced or removed in the new seed
    // ABH (Old Abha) -> Replaced by AHB
    // HOE (Old Al-Jouf typo) -> Replaced by HOF (Al-Ahsa)
    // RAO (Old Arar) -> Replaced by RAE
    // GAY (Old Qurayat) -> Replaced by URY
    // URA (Old Umluj) -> Removed
    const invalidCodes = ['ABH', 'HOE', 'RAO', 'GAY', 'URA']

    const result = await prisma.airport.deleteMany({
        where: {
            code: {
                in: invalidCodes
            }
        }
    })

    console.log(`Deleted ${result.count} invalid airport records.`)

    // Optional: Log what remains for verification
    const abha = await prisma.airport.findMany({
        where: {
            OR: [
                { cityAr: { contains: 'أبها' } },
                { code: 'AHB' },
                { code: 'ABH' }
            ]
        }
    })
    console.log('Remaining Abha records:', abha.map(a => `${a.code}: ${a.cityAr}`))
}

main().finally(() => prisma.$disconnect())
