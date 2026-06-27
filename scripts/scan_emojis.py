#!/usr/bin/env python3
"""
Waterborne emoji scanner — Blacksmith / Fahim Citadel toolchain.
Walks the repo, detects emoji glyphs, prints hits with file:line:col.
Exit 0 = clean. Exit 1 = emojis found.
"""
import os, re, sys, json, unicodedata

# ── Emoji detection regex ──────────────────────────────────────────────────
# Targeted at real emoji blocks only. Deliberately excludes:
#   U+2500-U+257F  Box Drawing (─ │ ┌ etc)   <- NOT emojis
#   U+2580-U+259F  Block Elements             <- NOT emojis
#   U+25A0-U+25FF  Geometric Shapes           <- mostly not emojis
EMOJI_RE = re.compile(
    "["
    "\U0001F600-\U0001F64F"   # Emoticons / faces
    "\U0001F300-\U0001F5FF"   # Misc Symbols & Pictographs
    "\U0001F680-\U0001F6FF"   # Transport & Map
    "\U0001F700-\U0001F77F"   # Alchemical
    "\U0001F780-\U0001F7FF"   # Geometric Extended
    "\U0001F800-\U0001F8FF"   # Supplemental Arrows-C
    "\U0001F900-\U0001F9FF"   # Supplemental Symbols & Pictographs
    "\U0001FA00-\U0001FA6F"   # Chess Symbols / Extended-A
    "\U0001FA70-\U0001FAFF"   # Symbols Extended-B
    "\U00002600-\U000026FF"   # Misc Symbols (sun, moon, snowman, hearts, etc.)
    "\U00002702-\U000027B0"   # Dingbats (scissors, check marks, etc.)
    "\U0000FE00-\U0000FE0F"   # Variation Selectors (emoji vs text presentation)
    "\U0001F1E0-\U0001F1FF"   # Regional Indicator Symbols (country flags)
    "]+",
    flags=re.UNICODE,
)

SKIP_DIRS = {
    "node_modules", ".git", ".next", "out", "dist", "build",
    ".turbo", ".vercel", "coverage", "__pycache__", ".cache",
}
SKIP_FILES = {
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb", ".DS_Store",
}
TEXT_EXTENSIONS = {
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".json", ".md", ".mdx", ".txt", ".toml", ".yaml", ".yml",
    ".env", ".env.example", ".env.local", ".css", ".scss", ".html",
    ".py", ".sh",
}

def is_text_file(path):
    _, ext = os.path.splitext(path)
    return ext.lower() in TEXT_EXTENSIONS

def scan(root, as_json=False):
    hits = []
    files_scanned = 0
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fname in filenames:
            if fname in SKIP_FILES:
                continue
            fpath = os.path.join(dirpath, fname)
            rel   = os.path.relpath(fpath, root)
            if not is_text_file(fpath):
                continue
            try:
                text = open(fpath, encoding="utf-8", errors="ignore").read()
            except Exception:
                continue
            files_scanned += 1
            for lineno, line in enumerate(text.splitlines(), 1):
                for m in EMOJI_RE.finditer(line):
                    for ch in m.group():
                        try:
                            name = unicodedata.name(ch, "UNKNOWN")
                        except Exception:
                            name = "UNKNOWN"
                        hits.append({
                            "file":    rel,
                            "line":    lineno,
                            "col":     m.start() + 1,
                            "glyph":   ch,
                            "name":    name,
                            "context": line.strip()[:80],
                        })
    return files_scanned, hits

if __name__ == "__main__":
    root    = "."
    as_json = "--json" in sys.argv
    if "--root" in sys.argv:
        idx  = sys.argv.index("--root")
        root = sys.argv[idx + 1]

    files_scanned, hits = scan(root, as_json)

    if as_json:
        print(json.dumps(hits, ensure_ascii=False, indent=2))
        sys.exit(1 if hits else 0)

    if not hits:
        print(f"CLEAN: no emojis found. ({files_scanned} files scanned)")
        sys.exit(0)

    # Deduplicate for display (same glyph same file:line)
    seen = set()
    unique = []
    for h in hits:
        key = (h["file"], h["line"], h["glyph"])
        if key not in seen:
            seen.add(key)
            unique.append(h)

    print(f"FOUND: {len(unique)} unique emoji hit(s) across {files_scanned} files scanned\n")
    print(f"{'File':<55} {'Line':>5}  Glyph  Unicode name")
    print("-" * 90)
    for h in unique:
        print(f"{h['file']:<55} {h['line']:>5}  {h['glyph']}      {h['name']}")
        print(f"         context: {h['context'][:70]}")
        print()
    sys.exit(1)
