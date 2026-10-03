# Smart AgriConnect — Digital Solutions for Farmers

A complete, farmer-friendly frontend for an Indian agriculture platform. Built with plain **HTML5, CSS3 and vanilla JavaScript** — no frameworks — and structured so a **Flask + MySQL** backend can be dropped in later.

## How to run it locally

No build step is needed — it's static HTML/CSS/JS.

1. Unzip the project.
2. Open `index.html` directly in a browser, **or** (recommended, avoids some browser file:// restrictions) serve it locally:
   ```bash
   cd agriconnect
   python3 -m http.server 8000
   ```
   Then visit `http://localhost:8000`.
3. Click **Get Started** or **Login** — the login/registration forms are demo-only, so any valid-looking input logs you in and takes you to the dashboard.

## What's demo vs. what's backend-ready

| Feature | Status |
|---|---|
| Login / Registration | Demo — accepts any valid input, stores a fake session in `localStorage` |
| My Crops (CRUD) | Fully working with `localStorage`, ready to swap for a `/api/crops` REST endpoint |
| Weather | Mock data in `js/weather.js`, structured for a real weather API |
| Market Prices | Mock data in `js/main.js` (`AGRI.mock.marketPrices`), filter/search/sort all work live |
| AI Crop Recommendation | Rule-based demo logic — **not a real ML model** (clearly labeled in the UI) |
| Crop Disease Detection | Upload + preview works; the "diagnosis" is a fixed demo result — **not real image AI** |
| Marketplace + Cart | Fully working with `localStorage` (add/remove/qty/total) |
| Farmer Community | Fully working posts/likes/comments via `localStorage` |
| AI Farming Assistant | Simple keyword-matched predefined replies, not a live model |
| Admin Dashboard | UI only, with some data pulled from the same `localStorage` used by the rest of the site |

Every mock/demo section has a short note in the JS file explaining exactly what to replace when the Flask API is ready (search for `FUTURE:` comments throughout `js/*.js`).

## Folder structure

```
agriconnect/
├── index.html, login.html, register.html, dashboard.html,
│   crops.html, weather.html, market.html, recommendation.html,
│   disease-detection.html, marketplace.html, cart.html,
│   transport.html, community.html, ai-assistant.html,
│   profile.html, admin.html
├── css/
│   ├── style.css        → design system: colors, type, buttons, cards, nav
│   ├── auth.css          → login/register split layout
│   ├── dashboard.css     → dashboard, admin sidebar, chat widget
│   └── responsive.css    → mobile/tablet breakpoints
├── js/
│   ├── main.js            → navbar, footer, toast, localStorage helpers, mock data
│   ├── auth.js             → login/register validation
│   ├── dashboard.js        → dashboard summary widgets
│   ├── crops.js            → crop CRUD
│   ├── weather.js          → weather + forecast rendering
│   ├── market.js           → mandi price search/filter/sort
│   ├── recommendation.js  → crop recommendation demo logic
│   ├── disease.js          → disease detection demo logic
│   ├── marketplace.js      → products, cart, seller listings
│   ├── transport.js        → transport listings
│   ├── community.js        → posts/likes/comments
│   ├── assistant.js        → chatbot demo replies
│   ├── profile.js          → profile view/edit
│   └── admin.js            → admin dashboard widgets
└── assets/
    ├── images/  (empty — add real photos here later)
    └── icons/   (empty — emoji icons are used as placeholders for now)
```

## How each module works (short version)

- **`main.js`** runs on every page. It renders the navbar and footer based on login state, holds all the mock/sample data in one place (`AGRI.mock`), and provides small helpers (`AGRI.get/set`, `AGRI.toast`, `AGRI.requireLogin`) that every other script reuses.
- **Login state** is a single object in `localStorage` under the key `agri_user`. Any page that should be protected calls `AGRI.requireLogin()` on load, which redirects to `login.html` if no user is stored.
- **Crops, Marketplace, Community, Profile** all follow the same pattern: read from `localStorage` (seeded with sample data the first time), render to the DOM, and write back on every change — so refreshing the page keeps your data.
- **Weather, Market Prices, AI Recommendation, Disease Detection, AI Assistant** use fixed mock data/logic since there's no backend yet. Each file has a comment block at the top explaining exactly which Flask endpoint would replace it.

## Future Flask + MySQL integration

The frontend expects a REST API roughly shaped like this (see `AGRI.api.base` in `js/main.js`):

```
/users, /farmers, /crops, /market-prices, /products,
/orders, /transport, /community, /weather,
/ai/recommend, /ai/disease, /ai/assistant
```

To connect a real backend: replace the `AGRI.get/set(AGRI.KEYS.*)` calls in each page's JS file with `fetch()` calls to the matching endpoint, and swap `localStorage`-based auth in `auth.js` for a real login request that stores a session token.

## Multi-language support

A language selector (English / Hindi / Marathi / Gujarati) is in the footer on every page. It currently shows a "coming soon" message — hook it up by building a translation dictionary per language and swapping visible text on `change`, keyed off the same selector.

## Accessibility & farmer-friendly notes

- Buttons are at least 48px tall for easy tapping.
- All forms show clear, plain-English error messages instead of only red borders.
- Icons are always paired with text labels, not color alone.
- Focus states are visible for keyboard users.
- Tables collapse into stacked cards on mobile (see `market.html` and `admin.html`).
