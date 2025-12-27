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

    // Seed Countries
    console.log('Seeding Countries...')
    const countries = [
        { code: 'SA', nameAr: 'السعودية', nameEn: 'Saudi Arabia' },
        { code: 'AE', nameAr: 'الإمارات', nameEn: 'United Arab Emirates' },
        { code: 'QA', nameAr: 'قطر', nameEn: 'Qatar' },
        { code: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait' },
        { code: 'BH', nameAr: 'البحرين', nameEn: 'Bahrain' },
        { code: 'OM', nameAr: 'عمان', nameEn: 'Oman' },
        { code: 'EG', nameAr: 'مصر', nameEn: 'Egypt' },
        { code: 'JO', nameAr: 'الأردن', nameEn: 'Jordan' },
        { code: 'MA', nameAr: 'المغرب', nameEn: 'Morocco' },
        { code: 'TR', nameAr: 'تركيا', nameEn: 'Turkey' },
        { code: 'UK', nameAr: 'بريطانيا', nameEn: 'United Kingdom' },
        { code: 'FR', nameAr: 'فرنسا', nameEn: 'France' },
        { code: 'DE', nameAr: 'ألمانيا', nameEn: 'Germany' },
        { code: 'IT', nameAr: 'إيطاليا', nameEn: 'Italy' },
        { code: 'ES', nameAr: 'إسبانيا', nameEn: 'Spain' },
        { code: 'CH', nameAr: 'سويسرا', nameEn: 'Switzerland' },
        { code: 'AT', nameAr: 'النمسا', nameEn: 'Austria' },
        { code: 'MY', nameAr: 'ماليزيا', nameEn: 'Malaysia' },
        { code: 'ID', nameAr: 'إندونيسيا', nameEn: 'Indonesia' },
        { code: 'TH', nameAr: 'تايلاند', nameEn: 'Thailand' },
        { code: 'MV', nameAr: 'المالديف', nameEn: 'Maldives' }
    ]

    for (const country of countries) {
        await prisma.country.upsert({
            where: { code: country.code },
            update: {
                nameAr: country.nameAr,
                nameEn: country.nameEn
            },
            create: {
                code: country.code,
                nameAr: country.nameAr,
                nameEn: country.nameEn,
                isActive: true
            }
        })
    }
    console.log('Countries seeded.')

    // Seed Airlines
    console.log('Seeding Airlines...')
    const airlines = [
        { code: 'SV', nameAr: 'الخطوط السعودية', nameEn: 'Saudi Arabian Airlines' },
        { code: 'EK', nameAr: 'طيران الإمارات', nameEn: 'Emirates' },
        { code: 'QR', nameAr: 'الخطوط القطرية', nameEn: 'Qatar Airways' },
        { code: 'EY', nameAr: 'الاتحاد للطيران', nameEn: 'Etihad Airways' },
        { code: 'BA', nameAr: 'الخطوط البريطانية', nameEn: 'British Airways' },
        { code: 'TK', nameAr: 'الخطوط التركية', nameEn: 'Turkish Airlines' },
        { code: 'LH', nameAr: 'لوفتهانزا', nameEn: 'Lufthansa' },
        { code: 'WY', nameAr: 'الطيران العماني', nameEn: 'Oman Air' },
        { code: 'KU', nameAr: 'الخطوط الكويتية', nameEn: 'Kuwait Airways' },
        { code: 'XY', nameAr: 'طيران ناس', nameEn: 'flynas' }
    ]

    for (const airline of airlines) {
        await prisma.airline.upsert({
            where: { code: airline.code },
            update: {
                nameAr: airline.nameAr,
                nameEn: airline.nameEn
            },
            create: {
                code: airline.code,
                nameAr: airline.nameAr,
                nameEn: airline.nameEn,
                isActive: true
            }
        })
    }
    console.log('Airlines seeded.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
