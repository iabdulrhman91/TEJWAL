import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'عروض الأسعار - تجوال',
    description: 'نظام إدارة عروض الأسعار',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en-US" dir="rtl">
            <body className={inter.className}>
                <Navbar />
                <main className="min-h-screen bg-gray-50 text-gray-900">
                    {children}
                </main>
            </body>
        </html>
    )
}
