import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, Minus, Zap } from 'lucide-react'

import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'

// ─────────────────────────────────────────────────────────
//  app/pricing/page.tsx — Pricing page
// ─────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Blacksmith Pricing — Free Android Project Generator',
  description:
    'Blacksmith is free to start — 5 Kotlin Android projects per month. Upgrade to Pro for $9/month: unlimited generations, Room DB migrations, GitHub Actions CI/CD, and multi-module Gradle.',
}

// ── Feature comparison table data ─────────────────────────

type Row = {
  feature: string
  free:    boolean | string
  pro:     boolean | string
}

const COMPARISON: Row[] = [
  { feature: 'Generations per month',         free: '5',         pro: 'Unlimited' },
  { feature: 'MVVM architecture',             free: true,        pro: true },
  { feature: 'Clean Architecture',            free: true,        pro: true },
  { feature: 'Jetpack Compose (Material3)',   free: true,        pro: true },
  { feature: 'XML Layouts + ViewBinding',     free: true,        pro: true },
  { feature: 'Retrofit + OkHttp3',            free: true,        pro: true },
  { feature: 'Room Database (basic)',          free: true,        pro: true },
  { feature: 'Hilt Dependency Injection',     free: true,        pro: true },
  { feature: 'Notifications helper',          free: true,        pro: true },
  { feature: 'Firebase Analytics setup',      free: true,        pro: true },
  { feature: 'Room DB Full (migrations)',      free: false,       pro: true },
  { feature: 'TypeConverters + search query', free: false,       pro: true },
  { feature: 'GitHub Actions CI/CD',          free: false,       pro: true },
  { feature: 'Multi-Module Gradle structure', free: false,       pro: true },
]

// ── FAQ ────────────────────────────────────────────────────

const FAQ = [
  {
    q: 'Does it actually compile on the first try?',
    a: "Yes. The Gemini prompt specifies exact version combinations (AGP 8.2.2, Kotlin 1.9.24, Gradle 8.6, Compose BOM 2024.02.00) that are known to work together. If a project doesn't build, regenerate. It's free.",
  },
  {
    q: 'What happens when I hit the free tier limit?',
    a: "You'll see an upgrade prompt when you hit the limit. It resets each month. Upgrade to Pro and the cap is gone.",
  },
  {
    q: 'Can I cancel Pro any time?',
    a: 'Yes. Cancel from the billing portal on your dashboard. Your Pro access continues until the end of the current billing period.',
  },
  {
    q: 'What Kotlin and Gradle versions does it use?',
    a: 'Always: Kotlin 1.9.24, AGP 8.2.2, Gradle 8.6, Compose BOM 2024.02.00, Room 2.6.1, Retrofit 2.9.0, Hilt 2.51.1. Pinned. No version drift.',
  },
]

// ── Page ───────────────────────────────────────────────────


const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  'name': 'Blacksmith',
  'applicationCategory': 'DeveloperApplication',
  'url': 'https://blacksmith.mahtamun.com',
  'offers': [
    {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
      'name': 'Free Plan',
      'description': '5 Android projects per month. All core Kotlin features.',
    },
    {
      '@type': 'Offer',
      'price': '9',
      'priceCurrency': 'USD',
      'name': 'Pro Plan',
      'description': 'Unlimited Android projects, Room DB Full with migrations, GitHub Actions CI/CD, Multi-Module Gradle structure.',
    },
  ],
}

export default function PricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <main className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="pt-20 pb-16 text-center">
          <h1 className="font-syne text-5xl font-bold text-text mb-4 tracking-tight">
            Generate Kotlin Android Projects. Free to start.
          </h1>
          <p className="text-text-muted text-lg max-w-xl mx-auto">
            Start free. Pay only when you need more.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-20">
          {/* Free card */}
          <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">Free</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="font-syne text-5xl font-bold text-text">$0</span>
              <span className="text-text-muted text-sm mb-2">/ month</span>
            </div>
            <p className="text-xs text-text-faint mb-8">5 projects per month. No card required.</p>

            <Link
              href="/sign-up"
              className="block text-center border border-border text-text text-sm font-semibold py-3 rounded-xl hover:border-accent/50 transition-[transform,border-color] duration-150 active:scale-[0.97] mb-8"
            >
              Get started free
            </Link>

            <ul className="space-y-3 flex-1">
              {COMPARISON.filter(r => r.free !== false).map(row => (
                <li key={row.feature} className="flex items-start gap-2.5">
                  <Check size={13} className="text-text-muted mt-0.5 shrink-0" aria-hidden />
                  <span className="text-sm text-text-muted">
                    {typeof row.free === 'string' ? `${row.feature} — ${row.free}` : row.feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro card */}
          <div className="bg-accent-faint border border-accent/40 rounded-2xl p-8 flex flex-col relative overflow-hidden transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10">
            <div className="absolute inset-x-0 top-0 h-px bg-accent/60" aria-hidden />

            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs font-semibold text-accent uppercase tracking-widest">Pro</p>
              <span className="text-xs bg-accent text-bg px-2 py-0.5 rounded-sm font-bold uppercase tracking-wide">
                Popular
              </span>
            </div>

            <div className="flex items-end gap-1 mb-1">
              <span className="font-syne text-5xl font-bold text-text">$9</span>
              <span className="text-text-muted text-sm mb-2">/ month</span>
            </div>
            <p className="text-xs text-text-faint mb-8">Unlimited projects. All features.</p>

            <Link
              href="/sign-up"
              className="block text-center bg-accent text-bg text-sm font-semibold py-3 rounded-xl hover:bg-accent-hover transition-[transform,background-color] duration-150 active:scale-[0.97] mb-8"
            >
              Get Pro
            </Link>

            <ul className="space-y-3 flex-1">
              {COMPARISON.map(row => (
                <li key={row.feature} className="flex items-start gap-2.5">
                  {row.pro !== false ? (
                    <Check size={13} className="text-accent mt-0.5 shrink-0" aria-hidden />
                  ) : (
                    <Minus size={13} className="text-text-faint mt-0.5 shrink-0" aria-hidden />
                  )}
                  <span className={`text-sm ${row.free === false ? 'text-text font-medium' : 'text-text-muted'}`}>
                    {typeof row.pro === 'string' ? `${row.feature} — ${row.pro}` : row.feature}
                    {row.free === false && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-accent font-semibold">
                        <Zap size={11} aria-hidden />
                        Pro only
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Comparison table */}
        <section className="mb-20" aria-labelledby="comparison-heading">
          <h2
            id="comparison-heading"
            className="font-syne text-2xl font-bold text-text mb-8 text-center"
          >
            Feature comparison
          </h2>

          <div className="border border-border rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-3 border-b border-border bg-surface/60">
              <div className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest">
                Feature
              </div>
              <div className="px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-widest text-center">
                Free
              </div>
              <div className="px-5 py-3 text-xs font-semibold text-accent uppercase tracking-widest text-center">
                Pro
              </div>
            </div>

            {/* Rows */}
            {COMPARISON.map((row, i) => (
              <div
                key={row.feature}
                className={[
                  'grid grid-cols-3 border-b border-border/50 last:border-0',
                  i % 2 === 0 ? 'bg-transparent' : 'bg-surface/30',
                ].join(' ')}
              >
                <div className="px-5 py-3.5 text-sm text-text-muted">{row.feature}</div>
                <div className="px-5 py-3.5 flex items-center justify-center">
                  {row.free === false ? (
                    <Minus size={14} className="text-text-faint" aria-label="Not included" />
                  ) : typeof row.free === 'string' ? (
                    <span className="text-sm text-text font-medium">{row.free}</span>
                  ) : (
                    <Check size={14} className="text-text-muted" aria-label="Included" />
                  )}
                </div>
                <div className="px-5 py-3.5 flex items-center justify-center">
                  {row.pro === false ? (
                    <Minus size={14} className="text-text-faint" aria-label="Not included" />
                  ) : typeof row.pro === 'string' ? (
                    <span className="text-sm text-accent font-semibold">{row.pro}</span>
                  ) : (
                    <Check size={14} className="text-accent" aria-label="Included" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-20" aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="font-syne text-2xl font-bold text-text mb-8 text-center"
          >
            Frequently asked
          </h2>

          <div className="space-y-4">
            {FAQ.map(item => (
              <div
                key={item.q}
                className="bg-surface border border-border rounded-xl px-6 py-5"
              >
                <h3 className="text-sm font-semibold text-text mb-2">{item.q}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mb-24 text-center">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-accent text-bg px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-accent-hover transition-[transform,background-color] duration-150 active:scale-[0.97]"
          >
            <Zap size={15} aria-hidden />
            Start generating for free
          </Link>
          <p className="text-xs text-text-faint mt-3">
            No credit card required · Cancel any time
          </p>
        </section>
      </main>

      <Footer />
    </>
  )
}
