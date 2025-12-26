const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Starting country seed...')
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
            update: {},
            create: country
        })
    }
    console.log('Country seed finished successfully')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
