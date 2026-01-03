# Car Listings Search 🔎

Simple Node.js + Express app that serves a JSON API for searching sample car listings and a minimal frontend UI.

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Run the app:

```bash
npm start
# or for dev with auto-reload (requires nodemon):
# npm run dev
```

3. Open the UI in your browser: http://localhost:3000

## API

- GET /api/search
  - Query params: q, make, model, minYear, maxYear, minPrice, maxPrice, sortBy (priceAsc, priceDesc, yearAsc, yearDesc), limit, offset
  - Returns: { total, results }

Examples:

Search for Toyotas:

```bash
curl "http://localhost:3000/api/search?make=Toyota"
```

Free-text search:

```bash
curl "http://localhost:3000/api/search?q=electric"
```

Get a single car by id:

```bash
curl "http://localhost:3000/api/4"
```

## Data

Sample data is in `data/cars.json`. This is in-memory for demo purposes — replace with a DB for production.

---

If you want, I can add tests, Dockerfile, or a more advanced UI next. ✅
