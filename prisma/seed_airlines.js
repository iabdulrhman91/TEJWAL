const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Starting seed...')
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
            update: {},
            create: airline
        })
    }
    console.log('Seed finished successfully')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
