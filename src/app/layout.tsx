import type { Metadata } from 'next'
import { Syne, Onest, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const syne         = Syne({ subsets: ['latin'], variable: '--font-syne', display: 'swap' })
const onest        = Onest({ subsets: ['latin'], variable: '--font-onest', display: 'swap' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' })

export const metadata: Metadata = {
  title: {
    default:  'Blacksmith — Android Project Generator',
    template: '%s | Blacksmith',
  },
  description:
    'Generate production-ready Android Studio Kotlin projects in seconds. ' +
    'Select architecture, UI layer, and features — download a .zip that compiles on the first try.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://blacksmith.mahtamun.com',
  ),
  openGraph: {
    type:        'website',
    title:       'Blacksmith — Android Project Generator',
    description: 'Select features. Gemini generates your Kotlin project. Download and build.',
    url:         '/',
    siteName:    'Blacksmith',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Blacksmith — Android Project Generator',
    description: 'Select features. Gemini generates your Kotlin project. Download and build.',
  },
  robots: {
    index:  true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${onest.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
