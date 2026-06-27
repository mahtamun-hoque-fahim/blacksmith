import Link from 'next/link'
import {
  Check,
  Download,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react'

import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'

// ─────────────────────────────────────────────────────────
//  app/page.tsx — Landing page
//  Pure Server Component — no client JS.
// ─────────────────────────────────────────────────────────

// ── Static code snippet shown in the demo section ─────────
const DEMO_CODE = `@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                MainScreen()
            }
        }
    }
}`.trim()

// ── Feature tiles (static demo, no interactivity) ─────────
type Tile = { label: string; description: string; selected: boolean }

const DEMO_TILES: Tile[] = [
  { label: 'Retrofit',      description: 'HTTP + OkHttp3 + Gson',        selected: true  },
  { label: 'Hilt DI',       description: '@HiltAndroidApp scaffolding',   selected: true  },
  { label: 'Room DB',       description: 'Entity, DAO, AppDatabase',      selected: true  },
  { label: 'Notifications', description: 'Channels + helper class',       selected: false },
  { label: 'Firebase',      description: 'Analytics + google-services',   selected: false },
]

// ── How-it-works steps ─────────────────────────────────────
const STEPS = [
  {
    icon:  Layers,
    title: 'Select your stack',
    body:  'Choose architecture (MVVM or Clean), UI layer (Compose or XML), and toggle the features you need.',
  },
  {
    icon:  Sparkles,
    title: 'Gemini builds it',
    body:  'Gemini 2.0 Flash generates every Kotlin file with correct versions, proper wiring, and no placeholders.',
  },
  {
    icon:  Download,
    title: 'Download and run',
    body:  'Open the .zip in Android Studio. It compiles on the first try — every time.',
  },
]

// ── Free vs Pro features ───────────────────────────────────
const FREE_ITEMS = [
  '5 projects / month',
  'MVVM or Clean Architecture',
  'Jetpack Compose or XML Layouts',
  'Retrofit + OkHttp3',
  'Room Database',
  'Hilt DI',
  'Notifications helper',
  'Firebase Analytics',
]

const PRO_ITEMS = [
  'Unlimited projects',
  'Everything in Free',
  'Room DB Full — migrations + TypeConverters',
  'GitHub Actions CI/CD workflow',
  'Multi-Module Gradle structure',
]

// ── Page ───────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* ── Hero ─────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent-faint border border-accent/30 text-accent text-xs font-semibold px-3 py-1 rounded-full mb-8 uppercase tracking-widest">
            <Zap size={11} aria-hidden />
            Powered by Gemini 2.0 Flash
          </div>

          {/* Headline */}
          <h1 className="font-syne text-5xl sm:text-6xl lg:text-7xl font-bold text-text leading-tight tracking-tight mb-6">
            No more Android
            <br />
            <span className="text-accent">boilerplate.</span>
          </h1>

          {/* Sub */}
          <p className="text-text-muted text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Select your architecture, UI layer, and features.
            Blacksmith generates a complete, compiling Kotlin project —
            download and build in seconds.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/sign-up"
              className="bg-accent text-bg px-7 py-3 rounded-xl font-semibold hover:bg-accent-hover transition-colors duration-150 text-sm"
            >
              Start for free
            </Link>
            <Link
              href="/pricing"
              className="bg-surface border border-border text-text px-7 py-3 rounded-xl font-semibold hover:border-accent/50 transition-colors duration-150 text-sm"
            >
              View pricing
            </Link>
          </div>

          {/* Proof strip */}
          <div className="flex items-center justify-center gap-3 flex-wrap mt-10">
            {['Kotlin only', 'Gradle Kotlin DSL', 'Compiles first try', 'No Java', 'No Groovy'].map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 text-xs text-text-faint border border-border rounded-full px-3 py-1"
              >
                <span className="w-1 h-1 rounded-full bg-accent shrink-0" aria-hidden />
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* ── Demo preview ─────────────────────────────── */}
        <section aria-label="Product preview" className="max-w-5xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border border-border rounded-2xl p-4 bg-surface/50">

            {/* Left — feature selector */}
            <div className="space-y-3 p-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">
                Select features
              </p>

              {/* Architecture chip */}
              <div className="flex gap-2 mb-4">
                {['MVVM', 'Clean Architecture'].map((opt, i) => (
                  <div
                    key={opt}
                    className={[
                      'flex-1 rounded-xl p-3 text-center text-xs font-medium border',
                      i === 0
                        ? 'bg-accent-faint border-accent text-accent'
                        : 'bg-surface border-border text-text-muted',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    {opt}
                  </div>
                ))}
              </div>

              {/* Feature tiles */}
              <div className="grid grid-cols-2 gap-2">
                {DEMO_TILES.map(tile => (
                  <div
                    key={tile.label}
                    aria-hidden="true"
                    className={[
                      'rounded-xl p-3 border',
                      tile.selected
                        ? 'bg-accent-faint border-accent'
                        : 'bg-surface border-border opacity-50',
                    ].join(' ')}
                  >
                    <span className={`block text-xs font-semibold ${tile.selected ? 'text-accent' : 'text-text'}`}>
                      {tile.label}
                    </span>
                    <span className="block text-xs text-text-faint mt-0.5 leading-snug">
                      {tile.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — generated code preview */}
            <div className="rounded-xl bg-bg border border-border overflow-hidden">
              {/* Editor chrome */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border">
                <span className="w-3 h-3 rounded-full bg-border" aria-hidden />
                <span className="w-3 h-3 rounded-full bg-border" aria-hidden />
                <span className="w-3 h-3 rounded-full bg-border" aria-hidden />
                <span className="ml-3 text-xs text-text-faint font-mono">MainActivity.kt</span>
              </div>
              {/* Code */}
              <pre
                className="p-5 text-xs font-mono text-text-muted leading-relaxed overflow-x-auto"
                aria-label="Example generated MainActivity.kt"
              >
                <code>{DEMO_CODE}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 pb-24" aria-labelledby="how-it-works">
          <h2
            id="how-it-works"
            className="font-syne text-3xl font-bold text-text text-center mb-14"
          >
            How it works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent-faint border border-accent/20 shrink-0">
                      <Icon size={16} className="text-accent" aria-hidden />
                    </div>
                    <span className="text-xs font-semibold text-text-faint uppercase tracking-widest">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="font-syne text-lg font-bold text-text">{step.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{step.body}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Pricing strip ────────────────────────────── */}
        <section
          className="max-w-5xl mx-auto px-6 pb-24"
          aria-labelledby="pricing-heading"
        >
          <h2
            id="pricing-heading"
            className="font-syne text-3xl font-bold text-text text-center mb-4"
          >
            Simple pricing
          </h2>
          <p className="text-text-muted text-center mb-14 text-sm">
            Start free. Upgrade when you need more.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* Free */}
            <div className="bg-surface border border-border rounded-2xl p-7 flex flex-col">
              <div className="mb-6">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">Free</p>
                <div className="flex items-end gap-1">
                  <span className="font-syne text-4xl font-bold text-text">$0</span>
                  <span className="text-text-muted text-sm mb-1">/ month</span>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-8">
                {FREE_ITEMS.map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check size={13} className="text-text-muted mt-0.5 shrink-0" aria-hidden />
                    <span className="text-sm text-text-muted">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="block text-center bg-surface border border-border text-text text-sm font-semibold py-2.5 rounded-xl hover:border-accent/50 transition-colors duration-150"
              >
                Start for free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-accent-faint border border-accent/40 rounded-2xl p-7 flex flex-col relative overflow-hidden">
              {/* Glow */}
              <div className="absolute inset-x-0 top-0 h-px bg-accent/60" aria-hidden />

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs font-semibold text-accent uppercase tracking-widest">Pro</p>
                  <span className="text-xs bg-accent text-bg px-2 py-0.5 rounded-sm font-bold uppercase tracking-wide">
                    Popular
                  </span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="font-syne text-4xl font-bold text-text">$9</span>
                  <span className="text-text-muted text-sm mb-1">/ month</span>
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-8">
                {PRO_ITEMS.map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check size={13} className="text-accent mt-0.5 shrink-0" aria-hidden />
                    <span className="text-sm text-text">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className="block text-center bg-accent text-bg text-sm font-semibold py-2.5 rounded-xl hover:bg-accent-hover transition-colors duration-150"
              >
                Get Pro
              </Link>
            </div>
          </div>

          <p className="text-center mt-6">
            <Link href="/pricing" className="text-xs text-text-faint hover:text-text-muted transition-colors underline underline-offset-4">
              See full feature comparison
            </Link>
          </p>
        </section>

        {/* ── Final CTA ────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="bg-surface border border-border rounded-2xl p-10 text-center relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" aria-hidden />
            <h2 className="font-syne text-3xl font-bold text-text mb-3">
              Start generating for free
            </h2>
            <p className="text-text-muted text-sm mb-8 max-w-md mx-auto">
              No credit card required. 5 free projects per month.
              Upgrade any time.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-accent text-bg px-7 py-3 rounded-xl font-semibold hover:bg-accent-hover transition-colors duration-150 text-sm"
            >
              <Zap size={15} aria-hidden />
              Start for free
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
