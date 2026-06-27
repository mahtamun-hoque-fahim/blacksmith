'use client'

// ─────────────────────────────────────────────────────────
//  components/generator/CodePreview.tsx
//  File tree (left) + code viewer (right).
//  Renders from GeneratedFile[] returned by the Server Action.
//  The download button in GenerateForm is gated on this component
//  rendering — it must appear before the download CTA is shown.
// ─────────────────────────────────────────────────────────

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  File,
  FileCode2,
  FileText,
  Folder,
  FolderOpen,
} from 'lucide-react'

import type { GeneratedFile } from '@/lib/generation/prompt'

// ── Public component ───────────────────────────────────────

type Props = {
  files: GeneratedFile[]
}

export function CodePreview({ files }: Props) {
  const tree  = buildTree(files)
  const first = files[0]?.path ?? null

  const [selectedPath, setSelectedPath] = useState<string | null>(first)

  const selectedFile = files.find(f => f.path === selectedPath) ?? null

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-surface">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-bg/40">
        <FileCode2 size={14} className="text-accent" aria-hidden />
        <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">
          Preview
        </span>
        <span className="ml-auto text-xs text-text-faint">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Body — tree + viewer */}
      <div className="flex min-h-[420px] max-h-[600px]">
        {/* File tree — hidden on mobile, visible sm+ */}
        <aside
          aria-label="File tree"
          className="hidden sm:flex flex-col w-52 shrink-0 border-r border-border overflow-y-auto py-2"
        >
          {tree.children.map(node => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              selectedPath={selectedPath}
              onSelect={setSelectedPath}
            />
          ))}
        </aside>

        {/* Code viewer */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* File name bar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-bg/20 shrink-0">
            <File size={12} className="text-text-faint shrink-0" aria-hidden />
            <span className="text-xs text-text-muted font-mono truncate">
              {selectedFile ? selectedFile.path : '—'}
            </span>
          </div>

          {/* Mobile file picker (visible only on mobile) */}
          <div className="sm:hidden border-b border-border px-3 py-2 shrink-0">
            <select
              aria-label="Select file"
              value={selectedPath ?? ''}
              onChange={e => setSelectedPath(e.target.value || null)}
              className="w-full bg-surface border border-border rounded-md px-2 py-1.5 text-xs text-text font-mono focus:outline-none focus:border-accent"
            >
              {files.map(f => (
                <option key={f.path} value={f.path}>
                  {f.path}
                </option>
              ))}
            </select>
          </div>

          {/* Code content */}
          <div className="flex-1 overflow-auto">
            {selectedFile ? (
              <pre className="p-4 text-xs font-mono text-text-muted leading-relaxed whitespace-pre min-w-max">
                <code>{selectedFile.content}</code>
              </pre>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-text-faint">
                Select a file to preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tree builder ───────────────────────────────────────────

type TreeNode = {
  id:       string   // unique key for React
  name:     string
  path:     string   // full path (files only)
  type:     'file' | 'dir'
  children: TreeNode[]
}

function buildTree(files: GeneratedFile[]): TreeNode {
  const root: TreeNode = {
    id: '__root__', name: '', path: '', type: 'dir', children: [],
  }

  for (const file of files) {
    const parts = file.path.split('/')
    let cursor = root

    // Create / traverse directory nodes
    for (let i = 0; i < parts.length - 1; i++) {
      const segment = parts[i]
      let child = cursor.children.find(c => c.type === 'dir' && c.name === segment)
      if (!child) {
        child = {
          id:       parts.slice(0, i + 1).join('/'),
          name:     segment,
          path:     '',
          type:     'dir',
          children: [],
        }
        cursor.children.push(child)
      }
      cursor = child
    }

    // Add file leaf
    const fileName = parts[parts.length - 1]
    if (!cursor.children.some(c => c.type === 'file' && c.name === fileName)) {
      cursor.children.push({
        id:       file.path,
        name:     fileName,
        path:     file.path,
        type:     'file',
        children: [],
      })
    }
  }

  sortTree(root)
  return root
}

/** Directories first, then alphabetical within each group */
function sortTree(node: TreeNode): void {
  node.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  node.children.forEach(sortTree)
}

// ── Tree node renderer ─────────────────────────────────────

type TreeNodeProps = {
  node:         TreeNode
  depth:        number
  selectedPath: string | null
  onSelect:     (path: string) => void
}

function TreeNode({ node, depth, selectedPath, onSelect }: TreeNodeProps) {
  // Auto-expand first 3 levels (root=0, app=1, src=2)
  const [open, setOpen] = useState(depth < 3)

  const indent = depth * 12

  if (node.type === 'file') {
    const selected = selectedPath === node.path
    const Icon     = fileIcon(node.name)

    return (
      <button
        type="button"
        onClick={() => onSelect(node.path)}
        title={node.path}
        aria-current={selected ? 'true' : undefined}
        className={[
          'flex w-full items-center gap-1.5 py-1 pr-3 text-xs text-left truncate transition-colors duration-100',
          selected
            ? 'bg-accent-faint text-accent'
            : 'text-text-muted hover:text-text',
        ].join(' ')}
        style={{ paddingLeft: `${indent + 20}px` }}
      >
        <Icon size={12} className="shrink-0" aria-hidden />
        <span className="truncate">{node.name}</span>
      </button>
    )
  }

  // Directory
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-1.5 py-1 pr-3 text-xs text-text-muted hover:text-text transition-colors duration-100"
        style={{ paddingLeft: `${indent + 4}px` }}
      >
        {open
          ? <ChevronDown  size={12} className="shrink-0" aria-hidden />
          : <ChevronRight size={12} className="shrink-0" aria-hidden />
        }
        {open
          ? <FolderOpen size={12} className="shrink-0 text-accent/70" aria-hidden />
          : <Folder     size={12} className="shrink-0 text-text-faint" aria-hidden />
        }
        <span className="truncate font-medium">{node.name}</span>
      </button>

      {open && node.children.map(child => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

// ── File type → icon ───────────────────────────────────────

function fileIcon(name: string): typeof File {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['kt', 'kts'].includes(ext))             return FileCode2
  if (['xml', 'json', 'toml', 'yml', 'yaml'].includes(ext)) return FileText
  return File
}
