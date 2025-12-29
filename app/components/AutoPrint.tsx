'use client'

import { useEffect } from 'react'

export default function AutoPrint() {
    useEffect(() => {
        // Short delay to ensure styles and images load
        const timer = setTimeout(() => {
            window.print()
        }, 500)
        return () => clearTimeout(timer)
    }, [])

    return null
}
