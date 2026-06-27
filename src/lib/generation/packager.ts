// ─────────────────────────────────────────────────────────
//  lib/generation/packager.ts
//  Parses raw Gemini text output → GeneratedFile[] → JSZip base64.
//  Runs server-side inside generateProject Server Action (Node runtime).
//  JSZip is incompatible with Edge Runtime — never call this from a
//  Route Handler or any segment with `export const runtime = 'edge'`.
// ─────────────────────────────────────────────────────────

import JSZip from 'jszip'
import type { GeneratedFile } from './prompt'

export type PackageResult = {
  files: GeneratedFile[]
  zipBase64: string
}

/**
 * Takes the raw text response from Gemini, strips any markdown fences,
 * parses the JSON file array, and packages everything into a base64 zip.
 *
 * Throws a descriptive error if the output can't be parsed or is empty.
 */
export async function parseAndPackage(geminiOutput: string): Promise<PackageResult> {
  const files = parseFiles(geminiOutput)
  const zipBase64 = await buildZip(files)
  return { files, zipBase64 }
}

// ── Parse ──────────────────────────────────────────────────

function parseFiles(raw: string): GeneratedFile[] {
  const cleaned = stripFences(raw)

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    // Last-ditch: find the first '[' and last ']' and try that substring
    const start = cleaned.indexOf('[')
    const end   = cleaned.lastIndexOf(']')
    if (start !== -1 && end > start) {
      try {
        parsed = JSON.parse(cleaned.slice(start, end + 1))
      } catch {
        throw new Error(
          'Gemini returned output that could not be parsed as JSON. ' +
          'This is usually a transient model error — please try again.',
        )
      }
    } else {
      throw new Error(
        'Gemini returned output that could not be parsed as JSON. ' +
        'This is usually a transient model error — please try again.',
      )
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Gemini output was valid JSON but not an array. Please try again.')
  }

  const files: GeneratedFile[] = parsed
    .filter(
      (item): item is GeneratedFile =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>).path === 'string' &&
        typeof (item as Record<string, unknown>).content === 'string' &&
        (item as GeneratedFile).path.length > 0,
    )
    // Normalise path separators (Windows backslash defence)
    .map(f => ({ ...f, path: f.path.replace(/\\/g, '/') }))

  if (files.length === 0) {
    throw new Error(
      'Gemini returned an empty file list. The model may have run out of tokens — ' +
      'try reducing the number of selected features and generating again.',
    )
  }

  return files
}

function stripFences(text: string): string {
  return text
    .trim()
    // Remove opening fence (```json or ``` alone)
    .replace(/^```(?:json)?\s*/i, '')
    // Remove closing fence
    .replace(/\s*```\s*$/i, '')
    .trim()
}

// ── Zip ────────────────────────────────────────────────────

async function buildZip(files: GeneratedFile[]): Promise<string> {
  const zip = new JSZip()

  for (const { path, content } of files) {
    zip.file(path, content)
  }

  return zip.generateAsync({ type: 'base64', compression: 'DEFLATE' })
}
