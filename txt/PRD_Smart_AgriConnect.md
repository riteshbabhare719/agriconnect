# Product Requirements Document (PRD)
## Smart AgriConnect — Digital Solutions for Farmers of Vidarbha

| | |
|---|---|
| **Version** | 1.0 (hackathon submission draft) |
| **Date** | 2 October 2026 |
| **Event** | Nagpur RISE 2026, Stage 1 (Solution Submission) |
| **Submission deadline** | 5 October 2026, 11:59 PM |
| **Suggested category** | Open / Agri (can be mapped to an official problem statement once chosen) |
| **Team** | [Team name and members] |
| **Status** | Frontend prototype complete; backend planned |

---

## 1. Overview

### 1.1 Problem
Farmers in Vidarbha, especially those growing oranges (Nagpur santra) and cotton, have to look in many different places for the information they need to run a season: weather, mandi prices, crop advice, inputs, transport and peer knowledge. Information is scattered across calls, apps, shops and word of mouth. This leads to:

- selling at a poor mandi because prices were not compared,
- spraying or harvesting just before rain,
- late response to pests such as pink bollworm,
- difficulty finding inputs and transport at fair prices,
- low digital confidence, and English-only apps that exclude many farmers.

### 1.2 Vision
One simple, mobile-first platform where a farmer can check the weather, compare mandi prices, track crops, get crop advice, buy inputs, find transport, and learn from other farmers, in the language they are comfortable with.

### 1.3 Product summary
Smart AgriConnect is a web application (HTML, CSS, vanilla JavaScript) designed to be backed by a FastAPI + MySQL service. It is organised around the farmer's real decisions: *when to spray, where to sell, what to do about a pest, how to move the harvest.*

---

## 2. Goals and Non-Goals

### 2.1 Goals (for the hackathon submission)
1. Deliver a **working, clickable software prototype** that demonstrates the full farmer journey end to end.
2. Make **at least one data source genuinely live** (weather via Open-Meteo) and clearly label everything else as demo data.
3. Localise content for **Vidarbha** (orange, cotton, soybean, tur; local mandis and districts).
4. Provide a **responsive, mobile-friendly** experience for low-end phones.
5. Present a credible **path to production** (FastAPI + MySQL architecture, data model, API list).

### 2.2 Non-goals (for this phase)
- A production backend, real authentication, or payment processing.
- Real ML models for crop recommendation or disease detection (currently rule-based or fixed demo results and labelled as such).
- Live mandi price feeds (sample data only).
- Native mobile apps.

---

## 3. Target Users

| Persona | Description | Key needs |
|---|---|---|
| **Primary: Orange / cotton farmer** (e.g. Ramesh Patil, Katol, Nagpur) | Owns 3–10 acres, uses a basic smartphone, Marathi-first, limited tech confidence | Weather before spraying, best mandi price, pest help, simple screens, Marathi |
| **Secondary: Input buyer / seller** | Buys seeds and fertilisers, or lists products | Browse, cart, list products |
| **Secondary: Transport provider** | Owns tractor or truck | Be discoverable by farmers |
| **Admin** | Platform moderator | Manage farmers, products, market data, community posts |

---

## 4. Scope and Current Status

| Module | Page | Status in prototype | Data source |
|---|---|---|---|
| Landing page | `index.html` | Complete | Static |
| Registration and login | `register.html`, `login.html` | Working (demo auth) | localStorage |
| Dashboard | `dashboard.html` | Working | Live weather + localStorage + sample data |
| My Crops (CRUD) | `crops.html` | Fully working | localStorage |
| Weather | `weather.html` | **Live** with offline fallback | Open-Meteo API |
| Market prices | `market.html` | Working (filter, search, sort, best-price insight) | Sample data |
| Crop recommendation | `recommendation.html` | Rule-based demo | Local logic |
| Disease detection | `disease-detection.html` | Upload + preview; fixed demo result | Demo |
| Marketplace and cart | `marketplace.html`, `cart.html` | Working (add, remove, quantity, total) | localStorage |
| Transport | `transport.html` | Listing | Sample data |
| Community | `community.html` | Working (posts, likes, comments) | localStorage |
| AI farming assistant | `ai-assistant.html` | Keyword-matched answers, Vidarbha knowledge base | Local logic |
| Profile | `profile.html` | View and edit | localStorage |
| Admin | `admin.html` | UI with partial data | localStorage |
| Languages | Footer selector | Navbar and footer translated (Marathi, Hindi, Gujarati); page text in English | Local dictionary |

**Honesty principle:** every non-live feature is labelled as demo/sample in the UI and in the video.

---

## 5. User Flows

### 5.1 Core farmer journey
1. Lands on the home page and chooses **Get Started**.
2. **Registers** with name, mobile, village, district and preferred language.
3. Arrives at the **dashboard**: greeting, live weather, crop count, price snapshot, available transport, farming tips.
4. Checks **Weather** and reads the farming advisory (for example, "rain likely, postpone spraying").
5. Opens **Market Prices**, filters to one crop, and sees which mandi pays best.
6. Opens **Transport** to find a vehicle for the harvest.
7. Tracks the season in **My Crops** with harvest countdowns and pest alerts.
8. Asks the **AI assistant** a question (for example, pink bollworm control).
9. Buys inputs in the **Marketplace** or asks other farmers in the **Community**.

### 5.2 Admin journey
Logs in, views summary stats, reviews farmers and products, and links out to market data and community moderation.

---

## 6. Functional Requirements

Priority: **P0** = required for submission, **P1** = should have, **P2** = future.

### 6.1 Accounts and profile
| ID | Requirement | Priority |
|---|---|---|
| FR-1 | A user can register with name, mobile (10-digit, Indian format), optional email, password, state, district, village and language. | P0 |
| FR-2 | Mobile numbers are accepted with common formats (+91, spaces, leading 0) and normalised. | P1 |
| FR-3 | A user can log in and return to their saved profile. | P0 |
| FR-4 | A user can view and edit their profile. | P0 |
| FR-5 | Real authentication with hashed passwords and token sessions. | P2 |

### 6.2 Dashboard
| ID | Requirement | Priority |
|---|---|---|
| FR-6 | Greeting follows the time of day and shows the farmer's name and location. | P0 |
| FR-7 | Summary cards show weather, crop count, a market price and available transport. | P0 |
| FR-8 | Weather card shows live data for the farmer's district, falling back to sample data. | P0 |
| FR-9 | Farming tips include the live weather advisory. | P1 |

### 6.3 My Crops
| ID | Requirement | Priority |
|---|---|---|
| FR-10 | Create, view, edit, delete and search crops (name, type, sowing and harvest dates, area, soil, irrigation). | P0 |
| FR-11 | Each crop shows an icon, status (Healthy, Needs Water, Pest Alert) and growth stage. | P0 |
| FR-12 | Harvest countdown is shown; harvest date cannot precede the sowing date. | P1 |
| FR-13 | Editing a crop preserves its stage and status. | P0 |

### 6.4 Weather
| ID | Requirement | Priority |
|---|---|---|
| FR-14 | Show current temperature, condition, humidity, rainfall and wind for the farmer's district (Vidarbha districts supported). | P0 |
| FR-15 | Show a 5-day forecast with temperature range and rain chance. | P0 |
| FR-16 | Generate a rule-based farming advisory (rain soon, extreme heat, strong wind, high humidity). | P0 |
| FR-17 | Clearly indicate whether data is live or sample. | P0 |

### 6.5 Market prices
| ID | Requirement | Priority |
|---|---|---|
| FR-18 | List mandi prices (min, max, average) for orange, cotton, soybean, tur, wheat and gram across Vidarbha mandis. | P0 |
| FR-19 | Filter by district and crop, search, and sort by price or name. | P0 |
| FR-20 | When a single crop is selected, highlight the best-paying mandi and the price gap. | P1 |
| FR-21 | Prices are labelled as sample data until a live feed is connected. | P0 |
| FR-22 | Integrate real mandi data (for example Agmarknet). | P2 |

### 6.6 AI farming assistant
| ID | Requirement | Priority |
|---|---|---|
| FR-23 | Answer common questions on pink bollworm, boll shedding, orange fruit drop, gummosis, bahar, soybean, tur, black soil, irrigation, fertiliser and schemes. | P0 |
| FR-24 | Choose the most specific matching answer, and understand a few Marathi/Hindi keywords. | P1 |
| FR-25 | Respond in Marathi for key questions when Marathi is selected. | P1 |
| FR-26 | Direct users to the Weather, Market and Transport pages where relevant. | P1 |
| FR-27 | Replace keyword matching with an LLM-backed service. | P2 |

### 6.7 Marketplace, cart and transport
| ID | Requirement | Priority |
|---|---|---|
| FR-28 | Browse and filter products by category; search by name. | P0 |
| FR-29 | Add to cart, change quantity, remove, and see the total. | P0 |
| FR-30 | A seller can list a product. | P1 |
| FR-31 | Checkout is a demo (no payment). Real orders and payments. | P0 / P2 |
| FR-32 | Transport listing shows vehicle type, capacity, location, price and availability. | P0 |
| FR-33 | Booking and driver contact flow. | P2 |

### 6.8 Community
| ID | Requirement | Priority |
|---|---|---|
| FR-34 | Create posts, like, comment and search posts. | P0 |
| FR-35 | Moderation by admin. | P1 |

### 6.9 Crop recommendation and disease detection
| ID | Requirement | Priority |
|---|---|---|
| FR-36 | Accept soil type, N-P-K, temperature, humidity, rainfall and pH and return a suggestion (rule-based demo, labelled). | P0 |
| FR-37 | Accept a crop photo and return a demo result (labelled; no real image analysis). | P0 |
| FR-38 | Replace with trained ML models. | P2 |

### 6.10 Language
| ID | Requirement | Priority |
|---|---|---|
| FR-39 | A language selector (English, Hindi, Marathi, Gujarati) persists the choice and translates the navbar and footer. | P0 |
| FR-40 | Translate all page content; support voice input and output for low-literacy users. | P2 |

### 6.11 Admin
| ID | Requirement | Priority |
|---|---|---|
| FR-41 | Show summary statistics and tables of farmers and products. | P1 |
| FR-42 | Full management actions (approve, suspend, edit prices, moderate posts). | P2 |

---

## 7. Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Responsiveness** | Usable from 320px to desktop. Navigation collapses to a menu at 1024px and below; tables become cards or scroll on phones; no horizontal page scroll. |
| **Accessibility** | Tap targets of at least 44px, 16px form inputs (prevents iOS zoom), visible focus states, icons paired with text, reduced-motion support. |
| **Performance** | No build step, no framework; pages load on low-bandwidth 4G. External calls (weather) time out after 8 seconds and fall back gracefully. |
| **Reliability** | If the weather API fails, the app continues with sample data and says so. |
| **Security (prototype)** | User-entered text is escaped before rendering; passwords are not stored. |
| **Security (production)** | Hashed passwords, token auth, input validation, rate limiting, HTTPS, role-based access for admin. |
| **Privacy** | Collect only what is needed (name, mobile, location). Provide consent and deletion in production. |
| **Browser support** | Current Chrome, Edge, Firefox and Safari; Android Chrome priority. |

---

## 8. Technical Architecture

### 8.1 Current (prototype)
- **Frontend:** HTML5, CSS3, vanilla JavaScript; shared `main.js` provides navbar, footer, language, toast, localStorage helpers and sample data.
- **Storage:** browser `localStorage` (keys: user, profile, crops, products, posts, cart, language, data version).
- **External service:** Open-Meteo (free, no API key) for weather.
- **Hosting:** static (GitHub Pages or Netlify).

### 8.2 Target (production)

```
Browser (HTML/CSS/JS)  --fetch-->  FastAPI service  -->  MySQL
                                        |
                                        +--> Weather API, Mandi data feed, ML / LLM services
```

- **Backend:** FastAPI (Python), SQLAlchemy ORM, Pydantic schemas, JWT authentication, auto-generated API docs at `/docs`.
- **Database:** MySQL.
- **Swap point:** every page already reads and writes through `AGRI.get` / `AGRI.set`; replacing their bodies with `fetch()` calls moves the app to the backend without rewriting page scripts.

### 8.3 Proposed project layout
```
agriconnect/
├── backend/
│   ├── main.py          # FastAPI app entry
│   ├── routers/         # users, crops, market, products, transport, community, ai
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   ├── database.py      # engine and session
│   └── auth.py          # password hashing, JWT
└── frontend/
    ├── *.html
    ├── css/
    ├── js/
    └── assets/
```

### 8.4 API endpoints (planned)
| Resource | Endpoints |
|---|---|
| Auth and users | `POST /auth/register`, `POST /auth/login`, `GET/PUT /users/me` |
| Crops | `GET/POST /crops`, `GET/PUT/DELETE /crops/{id}` |
| Market prices | `GET /market-prices?district=&crop=` |
| Products and orders | `GET/POST /products`, `POST /orders`, `GET /orders` |
| Transport | `GET /transport`, `POST /transport/{id}/book` |
| Community | `GET/POST /community/posts`, `POST /community/posts/{id}/like`, `POST /community/posts/{id}/comments` |
| Weather | `GET /weather?district=` (proxy and cache) |
| AI | `POST /ai/recommend`, `POST /ai/disease`, `POST /ai/assistant` |

### 8.5 Data model (summary)
| Table | Key fields |
|---|---|
| `users` | id, name, mobile (unique), email, password_hash, role, language, created_at |
| `farmer_profiles` | user_id, state, district, village, farm_area, main_crops |
| `crops` | id, user_id, name, type, stage, status, sow_date, harvest_date, area, soil, irrigation |
| `market_prices` | id, crop, market, district, state, min_price, max_price, avg_price, price_date |
| `products` | id, seller_id, name, category, price, quantity, description |
| `orders`, `order_items` | order_id, user_id, product_id, quantity, price, status |
| `transport_vehicles` | id, owner_id, type, capacity, location, price, available |
| `posts`, `comments`, `likes` | id, user_id, text, post_id, created_at |

---

## 9. Success Metrics

**Hackathon (Stage 1)**
- Prototype and 3-minute video submitted before the deadline.
- All P0 requirements demonstrable in the video without errors.
- Works on a real phone through the deployed link.

**Product (post-pilot, indicative)**
- Weekly active farmers in a pilot cluster (for example, one taluka).
- Share of sessions that include a weather or price check.
- Repeat usage within 7 days of first visit.
- Assistant questions answered without fallback.
- Self-reported improvement in selling decisions (survey).

---

## 10. Submission Plan (Nagpur RISE 2026, Stage 1)

| Date | Milestone |
|---|---|
| **Fri 2 Oct** | Choose category; apply responsive fix; Vidarbha data; live weather; deploy to a public link |
| **Sat 3 Oct** | Remaining pages checked (marketplace, community, transport, profile); full phone test; fix bugs |
| **Sun 4 Oct** | Write video script; record; upload to YouTube as **unlisted** |
| **Mon 5 Oct (before evening)** | Submit prototype link and video on the Nagpur RISE platform |

### 10.1 3-minute video outline
1. **0:00–0:30** Problem: scattered information, poor price and timing decisions.
2. **0:30–2:15** Live demo of one farmer's journey: register (Marathi) → dashboard → weather advisory → best mandi price → transport → pink bollworm question to the assistant.
3. **2:15–2:45** What is live and what is demo; architecture and roadmap.
4. **2:45–3:00** Impact and close.

### 10.2 Rule compliance checklist
- [ ] Solution is original and built by the team.
- [ ] AI tools were used for productivity only; the idea and design are the team's own.
- [ ] Working prototype (software application) submitted.
- [ ] Video is under or about 3 minutes, shows the prototype, and is an unlisted YouTube link.
- [ ] Submission completed before the deadline.

---

## 11. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| No backend at submission | Judges see "just a frontend" | Frame as a working software prototype per the rules; show live weather; present the FastAPI + MySQL architecture and data model |
| Sample data mistaken for real data | Credibility loss | Label every demo feature in the UI and video |
| Weather API failure during demo | Broken page | Built-in fallback to sample data; record the video early |
| Agronomy advice is wrong | Real-world harm | Keep advice general; defer doses and schedules to KVK / ICAR-CCRI; have a domain expert review answers |
| Mobile layout bugs | Poor first impression | Test on real phones; follow the responsive fixes |
| Last-minute submission problems | Missed deadline | Submit on Monday daytime, not at night; check platform requirements early |
| localStorage limits | Data loss across devices | Acceptable for demo; solved by the backend |

---

## 12. Roadmap After Stage 1

1. **Backend:** FastAPI + MySQL, real authentication, move all pages to the API.
2. **Real data:** live mandi prices; a weather proxy with caching.
3. **Language:** full Marathi and Hindi content; voice input and output.
4. **Intelligence:** LLM-backed assistant grounded in KVK / ICAR guidance; trained disease-detection and crop-recommendation models.
5. **Commerce:** orders, payments, seller verification, transport booking.
6. **Reach:** installable web app (PWA) with offline support; SMS and WhatsApp alerts.
7. **Pilot:** one taluka in orange or cotton belt with farmer feedback loops.

---

## 13. Open Questions
- Which official problem statement (or the Open category) best fits the submission?
- Is a deployed link required, or only the video and source files?
- Who will review the assistant's agronomy answers before the demo?
- Which Vidarbha districts and mandis should be prioritised for the first pilot?
- What is the plan for sourcing real mandi price data?

---

## Appendix A — Frontend file map
`index`, `login`, `register`, `dashboard`, `crops`, `weather`, `market`, `recommendation`, `disease-detection`, `marketplace`, `cart`, `transport`, `community`, `ai-assistant`, `profile`, `admin` (HTML) · `style.css`, `auth.css`, `dashboard.css`, `responsive.css` (CSS) · `main.js`, `auth.js`, `dashboard.js`, `crops.js`, `weather.js`, `market.js`, `assistant.js` and per-page scripts (JS).

## Appendix B — Glossary
- **Mandi / APMC:** regulated agricultural wholesale market.
- **Quintal:** 100 kg.
- **KVK:** Krishi Vigyan Kendra, a local agricultural extension centre.
- **CCRI:** ICAR-Central Citrus Research Institute, Nagpur.
- **Bahar:** flowering season in citrus orchards (Ambia, Mrig).
- **Pink bollworm:** a major cotton pest.
