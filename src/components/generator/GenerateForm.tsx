'use client'

// ─────────────────────────────────────────────────────────
//  components/generator/GenerateForm.tsx
//  Client orchestrator for the generation flow.
//  Manages form → loading → preview → download states.
//  Calls generateProject Server Action via useTransition.
// ─────────────────────────────────────────────────────────

import { useState, useTransition } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Code2,
  Download,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react'

import { generateProject, type GenerationResult } from '@/lib/generation/actions'
import type { Architecture, GeneratedFile, UILayer } from '@/lib/generation/prompt'

import { ArchSelector }      from './ArchSelector'
import { CodePreview }       from './CodePreview'
import { FeatureSelector }   from './FeatureSelector'
import { UILayerSelector }   from './UILayerSelector'
import { UpgradeModal }      from './UpgradeModal'

// ── Props ──────────────────────────────────────────────────

type Props = {
  /** Generation count consumed so far this month (from Redis) */
  initialCount: number
  /** Monthly cap for free users (from env FREE_TIER_GENERATION_LIMIT) */
  limit:        number
  /** Whether the current user has an active Pro subscription */
  isPro:        boolean
}

// ── Component ──────────────────────────────────────────────

export function GenerateForm({ initialCount, limit, isPro }: Props) {
  // ── Form state ────────────────────────────────────────────
  const [projectName,  setProjectName]  = useState('')
  const [features,     setFeatures]     = useState<string[]>([])
  const [architecture, setArchitecture] = useState<Architecture>('mvvm')
  const [uiLayer,      setUILayer]      = useState<UILayer>('xml')

  // ── Result / error state ───────────────────────────────────
  const [result,       setResult]       = useState<{
    files: GeneratedFile[]; zipBase64: string; fileName: string
  } | null>(null)
  const [genError,     setGenError]     = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // ── Usage tracking ─────────────────────────────────────────
  // Optimistically updated after a successful generation.
  const [count, setCount] = useState(initialCount)

  // ── Transition ─────────────────────────────────────────────
  const [isPending, startTransition] = useTransition()

  // ── Derived ────────────────────────────────────────────────
  const isNameValid  = /^[a-zA-Z][a-zA-Z0-9_]{1,49}$/.test(projectName.trim())
  const nameError    = projectName.length > 0 && !isNameValid
  const atLimit      = !isPro && count >= limit
  const canSubmit    = isNameValid && !atLimit && !isPending

  // ── Handlers ───────────────────────────────────────────────

  function handleGenerate() {
    if (!canSubmit) return
    setGenError(null)
    setResult(null)

    startTransition(async () => {
      const res: GenerationResult = await generateProject({
        projectName: projectName.trim(),
        features,
        architecture,
        uiLayer,
      })

      if (!res.success) {
        if (res.limitReached) {
          setLimitReached(true)
          setCount(limit)
          setShowUpgradeModal(true)
        } else {
          setGenError(res.error ?? 'Generation failed. Please try again.')
        }
        return
      }

      setResult({ files: res.files, zipBase64: res.zipBase64, fileName: res.fileName })
      setCount(c => c + 1)
    })
  }

  function handleDownload() {
    if (!result) return
    const binary = atob(result.zipBase64)
    const bytes  = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const blob   = new Blob([bytes], { type: 'application/zip' })
    const url    = URL.createObjectURL(blob)
    const a      = document.createElement('a')
    a.href       = url
    a.download   = result.fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleReset() {
    setResult(null)
    setGenError(null)
    setLimitReached(false)
  }

  // ── Loading state ──────────────────────────────────────────

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 rounded-2xl bg-accent-faint border border-accent">
          <Loader2 size={28} className="text-accent animate-spin" aria-hidden />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-text">Generating your project…</p>
          <p className="text-xs text-text-muted mt-1">
            Gemini is writing your Kotlin files. This usually takes 15–30 seconds.
          </p>
        </div>
      </div>
    )
  }

  // ── Preview / result state ─────────────────────────────────

  if (result) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors"
            aria-label="Generate another project"
          >
            <ArrowLeft size={14} aria-hidden />
            New project
          </button>
          <span className="text-text-faint text-xs">/</span>
          <span className="font-syne text-sm font-semibold text-text">
            {projectName.trim()}
          </span>
        </div>

        {/* Code preview — gating the download button */}
        <CodePreview files={result.files} />

        {/* Download */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 bg-accent text-bg px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent-hover transition-[transform,background-color] duration-150 active:scale-[0.97]"
          >
            <Download size={16} aria-hidden />
            Download .zip
          </button>
          <p className="text-xs text-text-faint">
            Open in Android Studio and run — it compiles on the first try.
          </p>
        </div>
      </div>
    )
  }

  // ── Form state ─────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Code2 size={20} className="text-accent" aria-hidden />
          <h1 className="font-syne text-2xl font-bold text-text">New project</h1>
        </div>

        {/* Usage pill */}
        {!isPro && (
          <span
            className={[
              'text-xs font-semibold px-2.5 py-1 rounded-full border',
              atLimit
                ? 'text-warning border-warning/40 bg-warning/10'
                : 'text-text-muted border-border bg-surface',
            ].join(' ')}
          >
            {count} / {limit} used
          </span>
        )}
        {isPro && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent-faint border border-accent/30 px-2.5 py-1 rounded-full">
            <Zap size={12} aria-hidden />
            Pro · Unlimited
          </span>
        )}
      </div>

      {/* Limit warning — shown before submission when count is already at cap */}
      {(atLimit || limitReached) && (
        <div className="flex gap-3 items-start bg-warning/10 border border-warning/30 rounded-xl px-4 py-3.5">
          <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-semibold text-warning">
              You have used all {limit} free generations this month.
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Upgrade to Blacksmith Pro for unlimited projects and all pro features.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="shrink-0 text-xs font-semibold text-accent hover:underline"
          >
            Upgrade
          </button>
        </div>
      )}

      {/* Error banner */}
      {genError && (
        <div className="flex gap-3 items-start bg-warning/10 border border-warning/30 rounded-xl px-4 py-3.5">
          <AlertCircle size={16} className="text-warning mt-0.5 shrink-0" aria-hidden />
          <p className="text-sm text-warning">{genError}</p>
        </div>
      )}

      {/* ── Project name ── */}
      <div>
        <label
          htmlFor="project-name"
          className="text-xs font-semibold text-text-muted uppercase tracking-widest block mb-3"
        >
          Project name
        </label>
        <input
          id="project-name"
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="MyAndroidApp"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          maxLength={50}
          aria-invalid={nameError}
          aria-describedby={nameError ? 'name-error' : undefined}
          className={[
            'w-full bg-surface border rounded-xl px-4 py-2.5 text-sm font-mono text-text placeholder:text-text-faint',
            'focus:outline-none focus:ring-1 transition-colors duration-150',
            nameError
              ? 'border-warning/60 focus:border-warning focus:ring-warning/20'
              : 'border-border focus:border-accent focus:ring-accent/20',
          ].join(' ')}
        />
        {nameError && (
          <p id="name-error" role="alert" className="mt-1.5 text-xs text-warning">
            Must start with a letter, then letters, numbers, or underscores only.
          </p>
        )}
        {!nameError && (
          <p className="mt-1.5 text-xs text-text-faint">
            Used as the Android package name — no spaces or special characters.
          </p>
        )}
      </div>

      {/* ── Architecture ── */}
      <ArchSelector value={architecture} onChange={setArchitecture} />

      {/* ── UI Layer ── */}
      <UILayerSelector value={uiLayer} onChange={setUILayer} />

      {/* ── Features ── */}
      <FeatureSelector value={features} onChange={setFeatures} isPro={isPro} />

      {/* ── Generate button ── */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canSubmit}
          aria-disabled={!canSubmit}
          className={[
            'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-[transform,background-color,opacity] duration-150',
            canSubmit
              ? 'bg-accent text-bg hover:bg-accent-hover cursor-pointer active:scale-[0.97]'
              : 'bg-surface border border-border text-text-faint cursor-not-allowed opacity-50',
          ].join(' ')}
        >
          <Sparkles size={16} aria-hidden />
          Generate project
        </button>

        {atLimit && !isPro && (
          <p className="mt-3 text-xs text-text-faint">
            Upgrade to Pro to generate more projects this month.
          </p>
        )}
      </div>

      {/* Upgrade modal — triggered by limit banner or limitReached action response */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        count={count}
        limit={limit}
      />
    </div>
  )
}
