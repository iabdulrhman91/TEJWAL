
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('--- Verification Results ---')

    const abha = await prisma.airport.findUnique({ where: { code: 'AHB' } })
    console.log(`Abha (AHB): ${abha ? '✅ Found: ' + abha.cityAr : '❌ Not Found'}`)

    const albaha = await prisma.airport.findUnique({ where: { code: 'ABT' } })
    console.log(`Al-Baha (ABT): ${albaha ? '✅ Found: ' + albaha.cityAr : '❌ Not Found'}`)

    const flyadeal = await prisma.airline.findUnique({ where: { code: 'F3' } })
    console.log(`Flyadeal (F3): ${flyadeal ? '✅ Found: ' + flyadeal.nameAr : '❌ Not Found'}`)

    const wizz = await prisma.airline.findUnique({ where: { code: 'W6' } })
    console.log(`Wizz Air (W6): ${wizz ? '✅ Found: ' + wizz.nameAr : '❌ Not Found'}`)
}

main().finally(() => prisma.$disconnect())
