import express from 'express';
import { createServer as createViteServer } from 'vite';
import db, { initDb } from './db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyFirebaseToken } from './auth';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database
  initDb();

  // Seed data if empty
  const count = db.prepare('SELECT COUNT(*) as count FROM vehicles').get() as { count: number };
  if (count.count === 0) {
    console.log('Seeding database...');
    // ... (seeding logic remains same, just ensuring context)
    const insertVehicle = db.prepare('INSERT INTO vehicles (make, model, year, vin, license_plate, status) VALUES (?, ?, ?, ?, ?, ?)');
    const insertDoc = db.prepare('INSERT INTO documents (vehicle_id, type, expiration_date) VALUES (?, ?, ?)');
    const insertLog = db.prepare('INSERT INTO maintenance_logs (vehicle_id, description, service_date, cost) VALUES (?, ?, ?, ?)');

    const vehicles = [
      { make: 'Toyota', model: 'Camry', year: 2022, vin: '1HGCM82633A004352', license_plate: 'ABC-1234', status: 'Available' },
      { make: 'Honda', model: 'Civic', year: 2021, vin: '2HGFC2F58MH554321', license_plate: 'XYZ-5678', status: 'Rented' },
      { make: 'Ford', model: 'F-150', year: 2023, vin: '1FTEW1E54KFA12345', license_plate: 'TRK-9012', status: 'Maintenance' },
    ];

    vehicles.forEach((v) => {
      const info = insertVehicle.run(v.make, v.model, v.year, v.vin, v.license_plate, v.status);
      const vehicleId = info.lastInsertRowid;
      insertDoc.run(vehicleId, 'Insurance', '2025-12-31');
      insertDoc.run(vehicleId, 'RC', '2030-01-01');
      if (v.status === 'Maintenance') {
        insertLog.run(vehicleId, 'Oil Change', '2024-03-01', 50.00);
        insertLog.run(vehicleId, 'Brake Pad Replacement', '2024-03-01', 200.00);
      }
    });
    console.log('Database seeded!');
  }

  app.use(express.json());
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadDir));

  // API Routes

  // Vehicles
  app.get('/api/vehicles', verifyFirebaseToken, (req, res) => {
    try {
      const stmt = db.prepare(`
        SELECT v.*, 
        (SELECT file_path FROM media m WHERE m.vehicle_id = v.id LIMIT 1) as image_path
        FROM vehicles v 
        ORDER BY v.created_at DESC
      `);
      const vehicles = stmt.all();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
  });

  app.post('/api/vehicles', verifyFirebaseToken, (req, res) => {
    try {
      const { make, model, year, vin, license_plate, status } = req.body;
      const stmt = db.prepare(
        'INSERT INTO vehicles (make, model, year, vin, license_plate, status) VALUES (?, ?, ?, ?, ?, ?)'
      );
      const info = stmt.run(make, model, year, vin, license_plate, status || 'Available');
      res.json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/vehicles/:id', verifyFirebaseToken, (req, res) => {
    try {
      const { id } = req.params;
      const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);
      
      if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

      const documents = db.prepare('SELECT * FROM documents WHERE vehicle_id = ?').all(id);
      const maintenance = db.prepare('SELECT * FROM maintenance_logs WHERE vehicle_id = ? ORDER BY service_date DESC').all(id);
      const media = db.prepare('SELECT * FROM media WHERE vehicle_id = ?').all(id);

      res.json({ ...vehicle, documents, maintenance, media });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch vehicle details' });
    }
  });

  app.put('/api/vehicles/:id', verifyFirebaseToken, (req, res) => {
    try {
      const { id } = req.params;
      const { make, model, year, vin, license_plate, status } = req.body;
      const stmt = db.prepare(`
        UPDATE vehicles 
        SET make = ?, model = ?, year = ?, vin = ?, license_plate = ?, status = ? 
        WHERE id = ?
      `);
      stmt.run(make, model, year, vin, license_plate, status, id);
      res.json({ success: true });
    } catch (error) {
      console.error('Update vehicle error:', error);
      res.status(500).json({ error: 'Failed to update vehicle' });
    }
  });

  // Documents
  app.post('/api/vehicles/:id/documents', verifyFirebaseToken, upload.single('file'), (req, res) => {
    try {
      const { id } = req.params;
      const { type, expiration_date } = req.body;
      const file_path = req.file ? `/uploads/${req.file.filename}` : null;

      const stmt = db.prepare(
        'INSERT INTO documents (vehicle_id, type, expiration_date, file_path) VALUES (?, ?, ?, ?)'
      );
      stmt.run(id, type, expiration_date, file_path);
      res.json({ success: true });
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({ error: 'Failed to add document' });
    }
  });

  // Maintenance
  app.post('/api/vehicles/:id/maintenance', verifyFirebaseToken, (req, res) => {
    try {
      const { id } = req.params;
      const { description, service_date, cost } = req.body;
      const stmt = db.prepare(
        'INSERT INTO maintenance_logs (vehicle_id, description, service_date, cost) VALUES (?, ?, ?, ?)'
      );
      stmt.run(id, description, service_date, cost);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add maintenance log' });
    }
  });

  // Media
  app.post('/api/vehicles/:id/media', verifyFirebaseToken, upload.single('file'), (req, res) => {
    try {
      const { id } = req.params;
      const { type } = req.body;
      
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      
      const file_path = `/uploads/${req.file.filename}`;
      const stmt = db.prepare(
        'INSERT INTO media (vehicle_id, type, file_path) VALUES (?, ?, ?)'
      );
      stmt.run(id, type, file_path);
      res.json({ success: true, file_path });
    } catch (error) {
      console.error('Media upload error:', error);
      res.status(500).json({ error: 'Failed to upload media' });
    }
  });

  // Reports
  app.get('/api/reports/dashboard', verifyFirebaseToken, (req, res) => {
    try {
      // Vehicle Status Distribution
      const statusCounts = db.prepare('SELECT status, COUNT(*) as count FROM vehicles GROUP BY status').all();

      // Maintenance Costs (Last 6 months)
      const maintenanceCosts = db.prepare(`
        SELECT strftime('%Y-%m', service_date) as month, SUM(cost) as total_cost 
        FROM maintenance_logs 
        WHERE service_date >= date('now', '-6 months')
        GROUP BY month 
        ORDER BY month ASC
      `).all();

      // Document Expiration Status
      const documents = db.prepare('SELECT expiration_date FROM documents').all();
      const now = new Date();
      const docStatus = {
        valid: 0,
        expired: 0,
        expiringSoon: 0, // within 30 days
      };

      documents.forEach((doc: any) => {
        const expDate = new Date(doc.expiration_date);
        const daysUntilExp = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExp < 0) {
          docStatus.expired++;
        } else if (daysUntilExp <= 30) {
          docStatus.expiringSoon++;
        } else {
          docStatus.valid++;
        }
      });

      // Recent Activity (Maintenance Logs)
      const recentActivity = db.prepare(`
        SELECT m.*, v.make, v.model, v.license_plate 
        FROM maintenance_logs m
        JOIN vehicles v ON m.vehicle_id = v.id
        ORDER BY m.service_date DESC 
        LIMIT 5
      `).all();

      // Recent Vehicles
      const recentVehicles = db.prepare(`
        SELECT * FROM vehicles ORDER BY created_at DESC LIMIT 5
      `).all();

      res.json({
        vehicleStatus: statusCounts,
        maintenanceCosts,
        documentStatus: [
          { name: 'Valid', value: docStatus.valid },
          { name: 'Expiring Soon', value: docStatus.expiringSoon },
          { name: 'Expired', value: docStatus.expired },
        ],
        recentActivity,
        recentVehicles
      });
    } catch (error) {
      console.error('Reports error:', error);
      res.status(500).json({ error: 'Failed to fetch reports data' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving (simplified for this context)
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();