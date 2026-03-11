# 🌿 BYTZ | Fast & Secure URL Shortener

> **Minimalist URLs. Maximum Velocity.**
> Forge short, powerful BYTZ URLs instantly in a clean, minimalist space.

🔗 **Live Demo :** [bytz-url.vercel.app](https://bytz-url.vercel.app)

---

## 📁 Project Structure

```
bytz/
├── app/
│   ├── layout.js           # Root layout with Navbar + Geist fonts
│   ├── page.js             # Home — URL shortener form
│   ├── vault/
│   │   └── page.js         # Vault — link history manager
│   └── dashboard/
│       └── page.js         # Dashboard — analytics overview (UI prototype)
└── components/
    └── Navbar.js           # Top navigation bar
```

---

## 🗂️ File Breakdown

### `components/Navbar.js`
- Fixed top navbar (`80px` height) with dark green (`#2D4F1E`) background
- **BYTZ** brand logo with a masked 🌿 SVG icon
- **My Vault** CTA button linking to `/vault`
- Commented-out Login / Sign Up links (ready for auth integration)

---

### `app/layout.js`
- Root layout wrapping all pages
- Loads **Geist Sans** and **Geist Mono** from `next/font/google`
- Injects `<Navbar />` globally above `{children}`
- Sets metadata: title, description, and SVG favicon (🌿 emoji)

---

### `app/page.js` — Home / Generator
**State:**
| State | Purpose |
|---|---|
| `longUrl` | Destination URL input |
| `alias` | Custom alias input |
| `isGenerating` | Loading spinner toggle |
| `generatedLink` | Result short URL |
| `isCopiedGen` | Copy button feedback |
| `toastMessage` | Toast notification text |
| `countdown` | Auto-close timer (10s) |

**Key Features:**
- URL shortening form with optional custom alias (`bytz.io/<alias>`)
- Auto-generates random 6-char alias if none provided
- Saves links to `localStorage` under key `bytz_links`
- **Result Modal** with animated SVG border countdown timer, Copy + Open buttons, auto-dismisses in 10s or on `Escape`
- **Toast notification** with animated progress bar (7s)
- Link to Vault for history

---

### `app/vault/page.js` — Vault
**State:**
| State | Purpose |
|---|---|
| `history` | Links loaded from `localStorage` |
| `selectedIds` | Multi-select checkbox state |
| `copiedId` | Per-item copy feedback |
| `toastMessage` | Copy toast |
| `undoToast` | Undo delete toast with restore logic |
| `confirmDelete` | Delete confirmation modal state |
| `isDesktop` | Responsive keyboard hint toggle |

**Key Features:**
- Loads all saved links from `localStorage` on mount
- **Checkbox multi-select** with `Ctrl/Cmd + A` to select all
- **Delete flows:** single, selected, or all — with confirmation modal
- **Undo delete** — restores deleted links within 7s via undo toast
- Per-item Copy Link button with feedback state
- Empty state with link back to generator
- Two toast types: copy (green) and undo-delete (dark)

---

### `app/dashboard/page.js` — Dashboard *(UI Prototype)*
> ⚠️ This is a **frontend-only prototype** with hardcoded mock data. Not yet wired to a backend.

**Theme:** Dark indigo + fuchsia/orange gradient — analytics-focused UI

**Features:**
- Usage meter (`links created / 100` limit)
- Create new link form with alias validation (alphanumeric, hyphens, underscores only)
- Links table with short URL, original URL, date, click count, edit & delete actions
- **Analytics sidebar** (sticky) — shows for selected link:
  - Total clicks
  - Top countries with percentage bars (orange)
  - Device type breakdown with percentage bars (fuchsia)
- Edit modal — update destination URL for an existing short link
- Delete modal — confirm before removing a link

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary Green | `#2D4F1E` |
| Dark Green | `#1A3011` |
| Cream Background | `#F5E6CC` |
| Card Background | `#EAE0C8` |
| Input Background | `#FBF6EC` |
| Text Primary | `stone-900` |
| Text Muted | `stone-500 / stone-600` |

**Fonts:** Geist Sans (UI) + Geist Mono (code)

---

## 💾 Data Storage

Links are persisted in `localStorage` under the key `bytz_links` as a JSON array:

```json
[
  {
    "id": "abc123",
    "originalUrl": "https://example.com/long/path",
    "shortUrl": "bytz.io/myalias",
    "date": "Mar 5, 2026"
  }
]
```

> ⚠️ Currently client-side only. No backend/database integration yet.

---

## 🚀 Getting Started

```bash
git clone https://github.com/7Aryannn/bytz-url.git
cd bytz-url
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔮 Planned / TODO

- [ ] Backend API for actual URL redirection
- [ ] Auth (Login / Sign Up — stubs already in Navbar)
- [ ] Real analytics (clicks, countries, devices)
- [ ] Dashboard wired to live data
- [ ] Rate limiting & alias collision handling
