const express = require('express');
const cors = require('cors');
const path = require('path');
const cars = require('./data/cars.json');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function matchesQuery(car, q) {
  if (!q) return true;
  q = q.toLowerCase();
  return (
    String(car.make).toLowerCase().includes(q) ||
    String(car.model).toLowerCase().includes(q) ||
    String(car.description || '').toLowerCase().includes(q)
  );
}

app.get('/api/search', (req, res) => {
  const {
    q,
    make,
    model,
    minYear,
    maxYear,
    minPrice,
    maxPrice,
    sortBy,
    limit = 25,
    offset = 0
  } = req.query;
  const lat = req.query.lat ? Number(req.query.lat) : null;
  const lon = req.query.lon ? Number(req.query.lon) : null;

  let results = cars.filter(car => {
    if (!matchesQuery(car, q)) return false;
    if (make && car.make.toLowerCase() !== make.toLowerCase()) return false;
    if (model && car.model.toLowerCase() !== model.toLowerCase()) return false;
    if (minYear && car.year < Number(minYear)) return false;
    if (maxYear && car.year > Number(maxYear)) return false;
    if (minPrice && car.price < Number(minPrice)) return false;
    if (maxPrice && car.price > Number(maxPrice)) return false;
    return true;
  });

  // If client provided lat/lon, compute distance for each car (in miles)
  function deg2rad(deg) { return deg * (Math.PI/180); }
  function distanceMiles(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = deg2rad(lat2-lat1);
    const dLon = deg2rad(lon2-lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const km = R * c;
    return km * 0.621371; // miles
  }

  if (lat !== null && lon !== null) {
    results = results.map(car => {
      if (typeof car.lat === 'number' && typeof car.lon === 'number') {
        return Object.assign({}, car, { distance: distanceMiles(lat, lon, car.lat, car.lon) });
      }
      return car;
    });
  }

  if (sortBy) {
    if (sortBy === 'priceAsc') results.sort((a,b) => a.price - b.price);
    else if (sortBy === 'priceDesc') results.sort((a,b) => b.price - a.price);
    else if (sortBy === 'yearDesc') results.sort((a,b) => b.year - a.year);
    else if (sortBy === 'yearAsc') results.sort((a,b) => a.year - b.year);
    else if (sortBy === 'distanceAsc') {
      if (lat === null || lon === null) return res.status(400).json({ error: 'lat and lon required when sorting by distance' });
      results.sort((a,b) => (a.distance || Infinity) - (b.distance || Infinity));
    }
    else if (sortBy === 'distanceDesc') {
      if (lat === null || lon === null) return res.status(400).json({ error: 'lat and lon required when sorting by distance' });
      results.sort((a,b) => (b.distance || -Infinity) - (a.distance || -Infinity));
    }
  }

  const total = results.length;
  const start = Math.max(0, Number(offset));
  const end = start + Number(limit);
  results = results.slice(start, end);

  res.json({ total, results });
});

app.get('/api/:id', (req, res) => {
  const id = Number(req.params.id);
  const car = cars.find(c => c.id === id);
  if (!car) return res.status(404).json({ error: 'Not found' });
  res.json(car);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Car search API running on http://localhost:${PORT}`);
});
