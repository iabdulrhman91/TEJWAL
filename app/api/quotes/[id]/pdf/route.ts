import { NextRequest, NextResponse } from 'next/server'
import { getQuote } from '@/app/quotes/actions'
import { getSession } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)
        if (isNaN(id)) {
            return new NextResponse('Invalid Quote ID', { status: 400 })
        }

        const quote = await getQuote(id)
        if (!quote) {
            return new NextResponse('Quote not found', { status: 404 })
        }

        const session = await getSession()
        if (session) {
            await createAuditLog({
                action: 'DOWNLOAD_PDF',
                userId: session.id,
                quoteId: id,
                metadata: { quoteNumber: quote.quoteNumber }
            })
        }

        // Detect Chrome Path on Windows
        // In a real production env, this might need an env var
        const possiblePaths = [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        ]

        // Simple check (in a real app we'd access fs, but here we'll try to let puppeteer launch)
        // Since we can't easily check file existence in this runtime without fs import which might be restricted in edge functionality (though this is nodejs runtime)
        // We will loop or just try one. Let's try to map the paths.

        let executablePath = possiblePaths[0] // Default try

        // For the purpose of this environment which is likely a standard windows user env:
        // We will try to rely on the first one, or if we had 'fs' we could check.
        // Let's assume standard 64-bit installation.

        // Read logo and convert to base64 for PDF
        let logoBase64 = ''
        try {
            const logoPath = path.join(process.cwd(), 'public', 'logo.png')
            const logoBuffer = fs.readFileSync(logoPath)
            logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`
        } catch (e) {
            console.error('Logo not found for PDF')
        }

        // Helper to generate HTML with "Precise Premium" Design
        const html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>عرض سعر ${quote.quoteNumber}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
                body { 
                    font-family: 'Cairo', sans-serif; 
                    color: #1e293b;
                    background-color: #f8fafc;
                    margin: 0;
                    padding: 0;
                    font-size: 11px;
                }
                .page {
                    background: white;
                    width: 210mm;
                    height: 297mm;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .header-slim {
                    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
                    color: white;
                    padding: 24px 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    -webkit-print-color-adjust: exact;
                }
                .logo-box {
                    background: white;
                    padding: 8px;
                    border-radius: 12px;
                    width: 70px;
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .content-area {
                    padding: 20px 40px;
                    flex: 1;
                }
                .section-header {
                    font-size: 10px;
                    font-weight: 800;
                    color: #0369a1;
                    padding-bottom: 6px;
                    margin-bottom: 15px;
                    border-bottom: 2px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    text-transform: uppercase;
                }
                .flight-card {
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 15px 20px;
                    margin-bottom: 12px;
                }
                .path-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                }
                .airport-info { width: 140px; }
                .plane-icon {
                    display: inline-block;
                    font-size: 16px;
                    color: #38bdf8;
                    position: relative;
                    z-index: 10;
                }
                .rotate-left { transform: rotate(180deg); display: inline-block; }
                .rotate-right { transform: rotate(0deg); display: inline-block; }
                
                .hotel-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .hotel-card {
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 12px 18px;
                    background: #fff;
                }
                .total-bar {
                    background: #0f172a;
                    color: white;
                    padding: 22px 45px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    -webkit-print-color-adjust: exact;
                    border-radius: 20px;
                    margin: 0 40px 15px 40px;
                }
                .footer-slim {
                    padding: 12px 40px;
                    border-top: 1px solid #f1f5f9;
                    text-align: center;
                    font-size: 9px;
                    color: #94a3b8;
                }
                .label-pill {
                    background: #f0f9ff;
                    color: #0369a1;
                    padding: 3px 12px;
                    border-radius: 6px;
                    font-size: 8px;
                    font-weight: 800;
                }
            </style>
        </head>
        <body>
            <div class="page">
                <!-- Header -->
                <div class="header-slim">
                    <div>
                        <div class="text-[9px] font-bold opacity-70 tracking-widest uppercase">Tejwal Travel / تجوال للسياحة</div>
                        <div class="text-3xl font-black italic ltr">QUOTATION</div>
                        <div class="text-xs font-bold opacity-80 mt-1">
                            رقم الملف: <span class="font-mono">${quote.quoteNumber}</span> | ${new Date().toLocaleDateString('en-US')}
                        </div>
                    </div>
                    <div class="logo-box">
                        ${logoBase64 ? `<img src="${logoBase64}" style="max-height: 55px; width: auto;" />` : `<div class="text-blue-600 font-black italic">TEJWAL</div>`}
                    </div>
                </div>

                <div class="content-area">
                    <!-- Client Board -->
                    <div class="flex justify-between items-center mb-8 bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                        <div>
                            <div class="text-[9px] font-extrabold text-sky-600 uppercase mb-1.5 tracking-[2px]">مقدم إلى / CLIENT</div>
                            <div class="text-2xl font-black text-slate-900">${quote.customerName}</div>
                            <div class="text-xs font-bold text-slate-500 mt-1" dir="ltr">${quote.customerPhone ? quote.customerPhone : ''}</div>
                        </div>
                        <div class="flex gap-8">
                            <div class="text-center">
                                <div class="text-[8px] text-slate-400 font-black uppercase mb-1">بالغ</div>
                                <div class="text-lg font-black text-slate-800">${quote.travelersCountAdults}</div>
                            </div>
                            <div class="w-px h-10 bg-slate-200"></div>
                            <div class="text-center">
                                <div class="text-[8px] text-slate-400 font-black uppercase mb-1">طفل</div>
                                <div class="text-lg font-black text-slate-800">${quote.travelersCountChildren}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Flight Journey -->
                    ${quote.flightSegments.length > 0 ? `
                        <div class="section-header"><span>مسار الرحلات الجوية / FLIGHT JOURNEY</span></div>
                        <div class="space-y-4 mb-8">
                            ${quote.flightSegments.map((seg: any) => `
                                <div class="flight-card">
                                    <div class="flex justify-between items-center mb-4">
                                        <div class="flex items-center gap-3">
                                            <div class="text-[13px] font-black text-slate-800 underline decoration-sky-300 decoration-2 underline-offset-4">${seg.airline}</div>
                                            <div class="label-pill">${seg.flightType === 'RoundTrip' ? 'ذهاب وعودة' : 'ذهاب فقط'}</div>
                                        </div>
                                        <div class="text-[10px] font-bold text-slate-400">تذاكر: ${seg.ticketCount}</div>
                                    </div>
                                    
                                    <!-- Outbound -->
                                    <div class="path-row">
                                        <div class="airport-info text-right">
                                            <div class="text-sm font-black text-slate-900">${seg.fromAirport}</div>
                                            <div class="text-[9px] text-slate-600 font-bold mt-1">${seg.departureDateTime ? new Date(seg.departureDateTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</div>
                                        </div>
                                        <div class="flex-1 border-t-2 border-dashed border-slate-100 relative text-center">
                                            <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2">
                                                <span class="plane-icon rotate-left">✈</span>
                                            </div>
                                        </div>
                                        <div class="airport-info text-left">
                                            <div class="text-sm font-black text-slate-900">${seg.toAirport}</div>
                                            <div class="text-[9px] text-slate-600 font-bold mt-1">${seg.arrivalDateTime ? new Date(seg.arrivalDateTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</div>
                                        </div>
                                    </div>

                                    <!-- Inbound (Prominent Display) -->
                                    ${seg.flightType === 'RoundTrip' ? `
                                        <div class="mt-5 pt-4 border-t border-slate-100">
                                            <div class="path-row">
                                                <div class="airport-info text-right">
                                                    <div class="text-sm font-black text-slate-800">${seg.toAirport}</div>
                                                    <div class="text-[9px] text-slate-700 font-bold mt-1">${seg.returnDepartureDateTime ? new Date(seg.returnDepartureDateTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</div>
                                                </div>
                                                <div class="flex-1 border-t-2 border-dashed border-slate-100 relative text-center">
                                                    <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2">
                                                        <span class="plane-icon rotate-right">✈</span>
                                                    </div>
                                                </div>
                                                <div class="airport-info text-left">
                                                    <div class="text-sm font-black text-slate-800">${seg.fromAirport}</div>
                                                    <div class="text-[9px] text-slate-700 font-bold mt-1">${seg.returnArrivalDateTime ? new Date(seg.returnArrivalDateTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Accommodation -->
                    ${quote.hotelStays.length > 0 ? `
                        <div class="section-header"><span>الإقامة الفندقية / ACCOMMODATION</span></div>
                        <div class="hotel-grid mb-8">
                            ${quote.hotelStays.map((stay: any) => `
                                <div class="hotel-card">
                                    <div class="text-xs font-black text-slate-800 leading-tight">${stay.hotelName}</div>
                                    <div class="flex justify-between items-center mt-1.5">
                                        <div class="text-[9px] font-bold text-sky-600 flex items-center gap-1">
                                            <span>📍 ${stay.city}</span>
                                            <span class="text-amber-400 font-serif -mt-0.5">${'★'.repeat(stay.hotelStars)}</span>
                                        </div>
                                        <div class="text-[8px] bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full font-black">${stay.nights} ليالي</div>
                                    </div>
                                    <div class="mt-3 pt-3 border-t border-slate-100">
                                        <div class="flex justify-between text-[9px] font-bold text-slate-500 mb-1.5">
                                            <span class="flex items-center gap-1">📅 دخول: ${stay.checkInDate ? new Date(stay.checkInDate).toLocaleDateString('en-US') : '-'}</span>
                                            <span class="flex items-center gap-1">📅 خروج: ${stay.checkOutDate ? new Date(stay.checkOutDate).toLocaleDateString('en-US') : '-'}</span>
                                        </div>
                                        <div class="text-[10px] text-slate-700 font-black flex gap-3">
                                            ${stay.roomType ? `<span>🏠 ${stay.roomType}</span>` : ''}
                                            ${stay.mealPlan ? `<span class="text-sky-600">🍽 ${stay.mealPlan}</span>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <!-- Footer Total -->
                <div class="total-bar">
                    <div>
                        <div class="text-[11px] font-black text-sky-300 tracking-[1.5px] uppercase">إجمالي تكلفة البرنامج بالكامل</div>
                        <div class="text-[8px] opacity-60">Complete Package Total (All taxes included)</div>
                    </div>
                    <div class="text-4xl font-black" style="display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
                        <span>${quote.grandTotal.toLocaleString('en-US')}</span>
                        <svg viewBox="0 0 1124.14 1256.39" style="width: 24px; height: 24px; fill: #7dd3fc;">
                            <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"/>
                            <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"/>
                        </svg>
                    </div>
                </div>

                <div class="footer-slim">
                    تجوال للسفر والسياحة | الرياض | +966 50 000 0000 | WWW.TEJWAL.COM
                </div>
            </div>
        </body>
        </html>
        `

        // Launch Browser
        // Trying simple fallback logic for paths
        const puppeteer = (await import('puppeteer-core')).default || (await import('puppeteer-core'))

        let browser;
        try {
            browser = await puppeteer.launch({
                executablePath: possiblePaths[0],
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                headless: true
            })
        } catch (e) {
            // Try second path
            browser = await puppeteer.launch({
                executablePath: possiblePaths[1],
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                headless: true
            })
        }

        const page = await browser.newPage()
        await page.setContent(html)
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '0', bottom: '20px', left: '0' }
        })
        await browser.close()

        // Return PDF
        const response = new NextResponse(pdfBuffer as any)
        response.headers.set('Content-Type', 'application/pdf')
        response.headers.set('Content-Disposition', `inline; filename="Quote-${quote.quoteNumber}.pdf"`)
        return response

    } catch (error) {
        console.error('PDF Generation Error:', error)
        return new NextResponse('Error generating PDF', { status: 500 })
    }
}
