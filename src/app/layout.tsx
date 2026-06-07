import type { Metadata } from 'next'
import { Syne, Onest, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const syne         = Syne({ subsets: ['latin'], variable: '--font-syne', display: 'swap' })
const onest        = Onest({ subsets: ['latin'], variable: '--font-onest', display: 'swap' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'Blacksmith — Android Project Generator',
  description: 'Generate production-ready Android Studio Kotlin projects in seconds. Pick features, download, build.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${onest.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
