const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const adminPassword = await bcrypt.hash('admin123', 10)
    const salesPassword = await bcrypt.hash('sales123', 10)

    await prisma.user.upsert({
        where: { email: 'admin@tejwal.com' },
        update: {},
        create: {
            email: 'admin@tejwal.com',
            name: 'مدير النظام',
            passwordHash: adminPassword,
            role: 'Admin',
            isActive: true,
        },
    })

    await prisma.user.upsert({
        where: { email: 'sales@tejwal.com' },
        update: {},
        create: {
            email: 'sales@tejwal.com',
            name: 'موظف مبيعات',
            passwordHash: salesPassword,
            role: 'Sales',
            isActive: true,
        },
    })

    console.log('Seed completed: admin@tejwal.com / admin123, sales@tejwal.com / sales123')

    // Seed Airports
    const airports = require('./airports.json')
    console.log(`Seeding ${airports.length} airports...`)

    for (const airport of airports) {
        await prisma.airport.upsert({
            where: { code: airport.code },
            update: {
                cityAr: airport.cityAr,
                cityEn: airport.cityEn,
                countryAr: airport.countryAr,
                isActive: true
            },
            create: {
                code: airport.code,
                cityAr: airport.cityAr,
                cityEn: airport.cityEn,
                countryAr: airport.countryAr,
                isActive: true
            }
        })
    }
    console.log('Airports seeded.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
