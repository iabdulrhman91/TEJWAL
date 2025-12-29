const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Starting seed...')
    const airlines = [
        // Saudi Arabia
        { code: 'SV', nameAr: 'الخطوط السعودية', nameEn: 'Saudi Arabian Airlines' },
        { code: 'XY', nameAr: 'طيران ناس', nameEn: 'flynas' },
        { code: 'F3', nameAr: 'طيران أديل', nameEn: 'Flyadeal' },

        // GCC
        { code: 'EK', nameAr: 'طيران الإمارات', nameEn: 'Emirates' },
        { code: 'QR', nameAr: 'الخطوط القطرية', nameEn: 'Qatar Airways' },
        { code: 'EY', nameAr: 'الاتحاد للطيران', nameEn: 'Etihad Airways' },
        { code: 'FZ', nameAr: 'فلاي دبي', nameEn: 'flydubai' },
        { code: 'G9', nameAr: 'العربية للطيران', nameEn: 'Air Arabia' },
        { code: 'WY', nameAr: 'الطيران العماني', nameEn: 'Oman Air' },
        { code: 'OV', nameAr: 'طيران السلام', nameEn: 'SalamAir' },
        { code: 'KU', nameAr: 'الخطوط الكويتية', nameEn: 'Kuwait Airways' },
        { code: 'J9', nameAr: 'طيران الجزيرة', nameEn: 'Jazeera Airways' },
        { code: 'GF', nameAr: 'طيران الخليج', nameEn: 'Gulf Air' },

        // Middle East
        { code: 'MS', nameAr: 'مصر للطيران', nameEn: 'EgyptAir' },
        { code: 'SM', nameAr: 'إير كايرو', nameEn: 'Air Cairo' },
        { code: 'NP', nameAr: 'النيل للطيران', nameEn: 'Nile Air' },
        { code: 'UJ', nameAr: 'المصرية العالمية', nameEn: 'AlMasria Universal' },
        { code: 'RJ', nameAr: 'الملكية الأردنية', nameEn: 'Royal Jordanian' },
        { code: 'ME', nameAr: 'طيران الشرق الأوسط', nameEn: 'Middle East Airlines' },

        // International
        { code: 'TK', nameAr: 'الخطوط التركية', nameEn: 'Turkish Airlines' },
        { code: 'BA', nameAr: 'الخطوط البريطانية', nameEn: 'British Airways' },
        { code: 'LH', nameAr: 'لوفتهانزا', nameEn: 'Lufthansa' },
        { code: 'AF', nameAr: 'الخطوط الفرنسية', nameEn: 'Air France' },
        { code: 'KL', nameAr: 'الخطوط الهولندية', nameEn: 'KLM' },
        { code: 'W6', nameAr: 'ويز إير', nameEn: 'Wizz Air' },
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
