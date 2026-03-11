const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Import routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const productStockRoutes = require('./routes/productStockRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const siteVisitRoutes = require('./routes/siteVisitRoutes');
const customerRoutes = require('./routes/customerRoutes');

// Route middleware
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/stock', productStockRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/sitevisits', siteVisitRoutes);
app.use('/api/customers', customerRoutes);

// Serve static files from the client build
app.use(express.static(path.join(__dirname, '../client/dist')));

// SPA catch-all: serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));