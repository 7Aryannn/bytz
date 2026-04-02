# 🌿 BYTZ | Fast & Secure URL Shortener

> **Link With Elegance.**
> Forge short, powerful BYTZ URLs instantly in a clean, minimalist space.

🔗 **Live Demo :** [bytz-url.vercel.app](https://bytz-url.vercel.app)

---

## 📁 Project Structure
```
bytz/
├── app/
│   ├── layout.js               # Root layout with Navbar + Geist fonts
│   ├── page.js                 # Home — URL shortener form
│   ├── [shorturl]/
│   │   └── page.js             # Dynamic redirect — queries MongoDB and redirects
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.js        # POST — saves new short URL to MongoDB
│   │   └── urls/
│   │       └── route.js        # GET — fetches all URLs from MongoDB
│   ├── vault/
│   │   └── page.js             # Vault — link history fetched from MongoDB
│   └── dashboard/
│       └── page.js             # Dashboard — analytics overview (UI prototype)
├── lib/
│   └── mongodb.js              # MongoDB client singleton
└── components/
    └── Navbar.js               # Top navigation bar
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
- POSTs to `/api/generate` to save link in MongoDB
- Uses `NEXT_PUBLIC_HOST` env var to construct the full short URL
- **Result Modal** with animated SVG border countdown timer, Copy + Open buttons, auto-dismisses in 10s or on `Escape`
- **Toast notification** with animated progress bar (7s)
- Link to Vault for history

---

### `app/[shorturl]/page.js` — Redirect Handler
- Server component that reads the `shorturl` param
- Queries MongoDB for a matching document
- Redirects to the original URL if found, otherwise redirects to `/`

---

### `app/api/generate/route.js` — Generate API
- `POST` — accepts `{ url, shorturl }` in the request body
- Checks for duplicate alias in MongoDB
- Inserts new document if alias is available
- Returns `{ success, message }`

### `app/api/urls/route.js` — URLs API
- `GET` — fetches all URL documents from MongoDB sorted by newest first
- Returns `{ success, data }`

---

### `app/vault/page.js` — Vault
**Key Features:**
- Fetches all saved links from `/api/generate` on mount
- Displays short URL and original URL for each entry
- Empty state with link back to generator

---


**Features:**
- Usage meter, create new link form, links table
- Analytics sidebar with clicks, countries, device breakdown
- Edit and delete modals

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

Links are persisted in **MongoDB** (`bytz` database, `url` collection):
```json
{
  "_id": "ObjectId(...)",
  "url": "https://example.com/long/path",
  "shorturl": "myalias"
}
```

---

## 🚀 Getting Started
```bash
git clone https://github.com/7Aryannn/bytz-url.git
cd bytz-url
npm install
```

Then run:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔮 Planned / TODO

- [ ] Auth (Login / Sign Up — stubs already in Navbar)
- [ ] Real analytics (clicks, countries, devices)
- [ ] Dashboard wired to live data
- [ ] Rate limiting & alias collision handling
- [ ] Deploy with MongoDB Atlas for production database
