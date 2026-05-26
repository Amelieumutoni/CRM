require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const mongoose     = require('mongoose');
const errorHandler = require('./src/middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000', 'https://salescrm-gules.vercel.app'] }));
app.use(express.json());

// Routes
app.use('/api/companies',  require('./src/routes/companies'));
app.use('/api/contacts',   require('./src/routes/contacts'));
app.use('/api/deals',      require('./src/routes/deals'));
app.use('/api/activities', require('./src/routes/activities'));
app.use('/api/dashboard',  require('./src/routes/dashboard'));
app.use('/api/grants',     require('./src/routes/grants'));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', db: 'mongodb' }));

app.use(errorHandler);

// Connect to MongoDB then start server
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/b2b_crm')
  .then(async () => {
    console.log('MongoDB connected ✅');
    // Auto-seed on first run
    const { seedIfEmpty } = require('./src/seed');
    await seedIfEmpty();
    app.listen(PORT, () => console.log(`Backend running → http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
    console.error('    Set MONGO_URI in backend/.env and make sure MongoDB is running.');
    process.exit(1);
  });
