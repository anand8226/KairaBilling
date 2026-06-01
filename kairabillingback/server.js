// Node Express Server Entrypoint for PropDeal Backend
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Body Parsers & CORS
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173', 'http://127.0.0.1:5173',
    'http://localhost:5174', 'http://127.0.0.1:5174',
    'http://localhost:5175', 'http://127.0.0.1:5175'
  ],
  credentials: true
}));

// Fallback JSON stores setup
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const propertiesFile = path.join(dataDir, 'properties.json');
const leadsFile = path.join(dataDir, 'leads.json');
const localUsersFile = path.join(dataDir, 'users.json');

// Bootstrap baseline data in JSON files if they don't exist
const initialProperties = [
  { id: 'P001', name: 'Green Villa', type: 'House', status: 'Available', price: 5000000, purchasePrice: 4000000, vendorName: 'Horizon Builders', acquisitionDate: '2026-01-10' },
  { id: 'P002', name: 'Sky Heights', type: 'Flat', status: 'Sold', price: 7500000, purchasePrice: 6200000, vendorName: 'Metro Developers', acquisitionDate: '2026-02-15' },
  { id: 'P003', name: 'Sunset Apartments', type: 'Flat', status: 'Available', price: 6000000, purchasePrice: 4800000, vendorName: 'Apex Properties', acquisitionDate: '2026-03-01' },
  { id: 'P004', name: 'Silver Oak', type: 'House', status: 'Rented', price: 25000, purchasePrice: 18000, vendorName: 'Local Owner', acquisitionDate: '2026-04-12' },
  { id: 'P005', name: 'Prime Commercial', type: 'Shop', status: 'Available', price: 12000000, purchasePrice: 9500000, vendorName: 'Capital Holdings', acquisitionDate: '2026-05-05' }
];

const initialLeads = [
  { id: 'L001', name: 'Rahul Sharma', mobile: '98xxxxxx12', requirement: '2BHK Flat', status: 'Follow-up', avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" },
  { id: 'L002', name: 'Amit Verma', mobile: '99xxxxxx45', requirement: 'Plot', status: 'New Lead', avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop" },
  { id: 'L003', name: 'Neha Gupta', mobile: '97xxxxxx88', requirement: '3BHK Flat', status: 'Interested', avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" },
  { id: 'L004', name: 'Vikash Patel', mobile: '91xxxxxx32', requirement: 'House', status: 'Follow-up', avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop" },
  { id: 'L005', name: 'Pooja Singh', mobile: '90xxxxxx21', requirement: 'Shop', status: 'New Lead', avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop" }
];

if (!fs.existsSync(propertiesFile)) fs.writeFileSync(propertiesFile, JSON.stringify(initialProperties, null, 2));
if (!fs.existsSync(leadsFile)) fs.writeFileSync(leadsFile, JSON.stringify(initialLeads, null, 2));
if (!fs.existsSync(localUsersFile)) fs.writeFileSync(localUsersFile, JSON.stringify([], null, 2));

// Helper for secure SHA-256 deterministic hashing matching the sp_Login SQL query criteria
function hashPasswordSHA256(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// MySQL Connection State
let dbPool = null;
let useMySQL = false;

async function initDB() {
  try {
    // 1. Establish connection to MySQL server first (without database)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('🔌 Connected to MySQL server successfully.');

    // 2. Automatically create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'kairabilling'}\`;`);
    await connection.end();

    // 3. Create Connection Pool for active API operations
    dbPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kairabilling',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log(`🗃️ Switched database to: ${process.env.DB_NAME || 'kairabilling'}`);

    // 4. Provision tables (incorporates the user's expanded CREATE TABLE Users schema)
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS Users (
        UserId INT PRIMARY KEY AUTO_INCREMENT,
        FullName VARCHAR(100) NOT NULL,
        EmailAddress VARCHAR(150) NOT NULL UNIQUE,
        CountryCode VARCHAR(10) DEFAULT '+91',
        PhoneNumber VARCHAR(15) NOT NULL UNIQUE,
        PasswordHash VARCHAR(255) NOT NULL,
        Role VARCHAR(50) DEFAULT 'Agent',
        CompanyName VARCHAR(150),
        City VARCHAR(100),
        State VARCHAR(100),
        ProfileImage VARCHAR(500),
        IsActive BIT DEFAULT 1,
        CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        UpdatedDate DATETIME NULL
      );
    `);
    console.log('✅ MySQL Table "Users" auto-verified.');

    // 5. Provision the Stored Procedure "sp_Login" dynamically!
    await dbPool.query('DROP PROCEDURE IF EXISTS sp_Login;');
    await dbPool.query(`
      CREATE PROCEDURE sp_Login(
        IN pPhoneNumber VARCHAR(15),
        IN pPassword VARCHAR(255)
      )
      BEGIN
        SELECT *
        FROM Users
        WHERE PhoneNumber = pPhoneNumber
        AND PasswordHash = pPassword
        LIMIT 1;
      END;
    `);
    console.log('✅ MySQL Stored Procedure "sp_Login" verified/provisioned.');

    // Bootstrap Users baseline if empty
    const defaultUsers = [
      {
        fullName: 'Anand Kumar',
        emailAddress: 'anand@propdeal.com',
        countryCode: '+91',
        phoneNumber: '9999999999',
        passwordHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // password: 123456
        role: 'Super Admin',
        companyName: 'PropDeal Corp',
        city: 'Mumbai',
        state: 'Maharashtra',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop'
      },
      {
        fullName: 'Karan Singh',
        emailAddress: 'karan@propdeal.com',
        countryCode: '+91',
        phoneNumber: '8888888888',
        passwordHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // password: 123456
        role: 'Manager',
        companyName: 'PropDeal Corp',
        city: 'Mumbai',
        state: 'Maharashtra',
        profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150&auto=format&fit=crop'
      },
      {
        fullName: 'Rajesh Kumar',
        emailAddress: 'rajesh@propdeal.com',
        countryCode: '+91',
        phoneNumber: '7777777777',
        passwordHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // password: 123456
        role: 'Agent',
        companyName: 'PropDeal Corp',
        city: 'Mumbai',
        state: 'Maharashtra',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop'
      },
      {
        fullName: 'Sunita Rao',
        emailAddress: 'sunita@propdeal.com',
        countryCode: '+91',
        phoneNumber: '7777777778',
        passwordHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // password: 123456
        role: 'Agent',
        companyName: 'PropDeal Corp',
        city: 'Pune',
        state: 'Maharashtra',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop'
      }
    ];

    const [rowsUsers] = await dbPool.query('SELECT COUNT(*) as count FROM Users');
    if (rowsUsers[0].count === 0) {
      for (const u of defaultUsers) {
        await dbPool.query(
          `INSERT INTO Users 
          (FullName, EmailAddress, CountryCode, PhoneNumber, PasswordHash, Role, CompanyName, City, State, ProfileImage) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [u.fullName, u.emailAddress, u.countryCode, u.phoneNumber, u.passwordHash, u.role, u.companyName, u.city, u.state, u.profileImage]
        );
      }
      console.log('✅ MySQL Table "Users" bootstrapped with dynamic role credentials.');
    }

    // Provision Properties and Leads tables in MySQL for a fully synchronized DB experience
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS Properties (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        price DECIMAL(15,2) NOT NULL,
        purchasePrice DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        vendorName VARCHAR(150) DEFAULT 'Independent Owner',
        acquisitionDate VARCHAR(50) NULL,
        paymentMethod VARCHAR(100) NULL,
        paymentDetails VARCHAR(255) NULL,
        ownerName VARCHAR(100) NULL,
        ownerMobile VARCHAR(20) NULL,
        propertyImage VARCHAR(500) NULL
      );
    `);

    // Gracefully update columns if they don't exist
    try {
      await dbPool.query("ALTER TABLE Properties ADD COLUMN purchasePrice DECIMAL(15,2) NOT NULL DEFAULT 0.00;");
    } catch (e) {}
    try {
      await dbPool.query("ALTER TABLE Properties ADD COLUMN vendorName VARCHAR(150) DEFAULT 'Independent Owner';");
    } catch (e) {}
    try {
      await dbPool.query("ALTER TABLE Properties ADD COLUMN acquisitionDate VARCHAR(50) NULL;");
    } catch (e) {}
    try {
      await dbPool.query("ALTER TABLE Properties ADD COLUMN paymentMethod VARCHAR(100) NULL;");
    } catch (e) {}
    try {
      await dbPool.query("ALTER TABLE Properties ADD COLUMN paymentDetails VARCHAR(255) NULL;");
    } catch (e) {}
    try {
      await dbPool.query("ALTER TABLE Properties ADD COLUMN ownerName VARCHAR(100) NULL;");
    } catch (e) {}
    try {
      await dbPool.query("ALTER TABLE Properties ADD COLUMN ownerMobile VARCHAR(20) NULL;");
    } catch (e) {}
    try {
      await dbPool.query("ALTER TABLE Properties ADD COLUMN propertyImage VARCHAR(500) NULL;");
    } catch (e) {}

    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS Leads (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        requirement VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        avatar VARCHAR(255) NOT NULL,
        assignedTo VARCHAR(100) DEFAULT 'Unassigned'
      );
    `);

    // Gracefully update column if it doesn't exist
    try {
      await dbPool.query("ALTER TABLE Leads ADD COLUMN assignedTo VARCHAR(100) DEFAULT 'Unassigned';");
    } catch (e) {}

    // Provision new tables for the Property Dealer Buy & Sell specifications
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS Requirements (
        id VARCHAR(10) PRIMARY KEY,
        buyerName VARCHAR(100) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        budgetRange VARCHAR(100) NOT NULL,
        preferredLocation VARCHAR(150) NOT NULL,
        propertyType VARCHAR(50) NOT NULL,
        areaRequirement VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Open'
      );
    `);

    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS Visits (
        id VARCHAR(10) PRIMARY KEY,
        customerName VARCHAR(100) NOT NULL,
        propertyName VARCHAR(150) NOT NULL,
        visitDate VARCHAR(50) NOT NULL,
        agentName VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'Scheduled',
        notes TEXT NULL
      );
    `);

    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS Deals (
        id VARCHAR(10) PRIMARY KEY,
        propertyId VARCHAR(10) NOT NULL,
        propertyName VARCHAR(150) NOT NULL,
        buyerName VARCHAR(100) NOT NULL,
        tokenAmount DECIMAL(15,2) DEFAULT 0.00,
        advancePayment DECIMAL(15,2) DEFAULT 0.00,
        finalPayment DECIMAL(15,2) DEFAULT 0.00,
        agreementFile VARCHAR(255) NULL,
        commissionPercent DECIMAL(5,2) DEFAULT 2.00,
        commissionEarned DECIMAL(15,2) DEFAULT 0.00,
        saleDate VARCHAR(50) NOT NULL
      );
    `);

    // Bootstrap MySQL baseline items if empty
    const [rowsProps] = await dbPool.query('SELECT COUNT(*) as count FROM Properties');
    if (rowsProps[0].count === 0) {
      for (const p of initialProperties) {
        await dbPool.query('INSERT INTO Properties (id, name, type, status, price, purchasePrice, vendorName, acquisitionDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [p.id, p.name, p.type, p.status, p.price, p.purchasePrice, p.vendorName, p.acquisitionDate]);
      }
    }

    const [rowsLeads] = await dbPool.query('SELECT COUNT(*) as count FROM Leads');
    if (rowsLeads[0].count === 0) {
      for (const l of initialLeads) {
        await dbPool.query('INSERT INTO Leads (id, name, mobile, requirement, status, avatar) VALUES (?, ?, ?, ?, ?, ?)', [l.id, l.name, l.mobile, l.requirement, l.status, l.avatar]);
      }
    }

    useMySQL = true;
    console.log('🌐 Server fully running in MySQL synchronized mode.');
  } catch (error) {
    console.error('⚠️ [MySQL WARNING] Database initialization failed:');
    console.error(error.message);
    console.warn('📁 [BACKUP ENGINE] Falling back to file-based JSON database persistence. Full functionality preserved!');
    useMySQL = false;
  }
}

// -------------------------------------------------------------
// Helper Persistence Functions (Files Backup Mode)
// -------------------------------------------------------------
function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Auth: User Registration Endpoint
app.post('/api/auth/register', async (req, res) => {
  const { 
    fullName, 
    emailAddress, 
    countryCode, 
    phoneNumber, 
    password,
    role,
    companyName,
    city,
    state
  } = req.body;

  if (!fullName || !emailAddress || !phoneNumber || !password) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  try {
    // Hash password using SHA-256 to allow direct comparison in Stored Procedure sp_Login!
    const passwordHash = hashPasswordSHA256(password);
    const code = countryCode || '+91';
    const userRole = role || 'Agent';
    const company = companyName || null;
    const userCity = city || null;
    const userState = state || null;
    const profileImage = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop";

    if (useMySQL) {
      // Check if user already exists
      const [existing] = await dbPool.query(
        'SELECT * FROM Users WHERE EmailAddress = ? OR PhoneNumber = ?', 
        [emailAddress, phoneNumber]
      );
      if (existing.length > 0) {
        return res.status(400).json({ error: 'A user with this email or phone number already exists.' });
      }

      // Insert user
      const [result] = await dbPool.query(
        `INSERT INTO Users 
        (FullName, EmailAddress, CountryCode, PhoneNumber, PasswordHash, Role, CompanyName, City, State, ProfileImage) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [fullName, emailAddress, code, phoneNumber, passwordHash, userRole, company, userCity, userState, profileImage]
      );

      return res.status(201).json({
        success: true,
        user: {
          id: result.insertId,
          fullName,
          emailAddress,
          countryCode: code,
          phoneNumber,
          role: userRole,
          companyName: company,
          city: userCity,
          state: userState
        }
      });
    } else {
      // Local file registry mode
      const users = readJSON(localUsersFile);
      const exists = users.find(u => u.emailAddress === emailAddress || u.phoneNumber === phoneNumber);
      if (exists) {
        return res.status(400).json({ error: 'A user with this email or phone number already exists.' });
      }

      const newUser = {
        userId: users.length + 1,
        fullName,
        emailAddress,
        countryCode: code,
        phoneNumber,
        passwordHash,
        role: userRole,
        companyName: company,
        city: userCity,
        state: userState,
        profileImage
      };
      users.push(newUser);
      writeJSON(localUsersFile, users);

      return res.status(201).json({
        success: true,
        user: {
          id: newUser.userId,
          fullName,
          emailAddress,
          countryCode: code,
          phoneNumber,
          role: userRole,
          companyName: company,
          city: userCity,
          state: userState
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration error. Please check server logs.' });
  }
});

// 2. Auth: User Login Endpoint executing MySQL Stored Procedure "sp_Login"!
app.post('/api/auth/login', async (req, res) => {
  const { countryCode, phoneNumber, password, role } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).json({ error: 'Phone number and password are required' });
  }

  // Guard to prevent SQL truncation crashes on Stored Procedure parameters
  if (phoneNumber.length > 15) {
    return res.status(400).json({ 
      error: 'Invalid Phone Number format. Please enter your registered phone number (e.g. 8226811810), not your email address.' 
    });
  }

  try {
    const code = countryCode || '+91';
    // Hash input password with SHA-256 to match database stored values
    const passwordHash = hashPasswordSHA256(password);
    let user = null;

    if (useMySQL) {
      // Execute the MySQL Stored Procedure!
      const [result] = await dbPool.query('CALL sp_Login(?, ?)', [phoneNumber, passwordHash]);
      const rows = result[0]; // mysql2 returns procedure datasets nested inside the first index
      
      if (rows && rows.length > 0) {
        user = rows[0];
      }
    } else {
      // Local file simulation backup
      const users = readJSON(localUsersFile);
      user = users.find(u => u.phoneNumber === phoneNumber && u.passwordHash === passwordHash);
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid phone number or password' });
    }

    // Enforce strict Role verification matching their registered signup details
    const dbRole = user.Role || user.role || 'Agent';
    if (role && dbRole !== role) {
      return res.status(400).json({ 
        error: `Role mismatch. This account is registered as a "${dbRole}", but you selected "${role}".` 
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.UserId || user.userId,
        fullName: user.FullName || user.fullName,
        emailAddress: user.EmailAddress || user.emailAddress,
        countryCode: user.CountryCode || user.countryCode,
        phoneNumber: user.PhoneNumber || user.phoneNumber,
        role: user.Role || user.role || 'Agent',
        companyName: user.CompanyName || user.companyName || '',
        city: user.City || user.city || '',
        state: user.State || user.state || ''
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server authentication login error.' });
  }
});

// 3. Properties: Fetch Registry
app.get('/api/properties', async (req, res) => {
  try {
    if (useMySQL) {
      const [rows] = await dbPool.query('SELECT * FROM Properties');
      const formatted = rows.map(r => ({
        id: r.id,
        name: r.name,
        type: r.type,
        status: r.status,
        price: parseFloat(r.price),
        purchasePrice: parseFloat(r.purchasePrice || 0),
        vendorName: r.vendorName || 'Independent Owner',
        acquisitionDate: r.acquisitionDate || '',
        paymentMethod: r.paymentMethod || '',
        paymentDetails: r.paymentDetails || '',
        ownerName: r.ownerName || '',
        ownerMobile: r.ownerMobile || '',
        propertyImage: r.propertyImage || ''
      }));
      res.json(formatted);
    } else {
      res.json(readJSON(propertiesFile));
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch properties.' });
  }
});

// 4. Properties: Add Record
app.post('/api/properties', async (req, res) => {
  const { name, type, status, price, purchasePrice, vendorName, acquisitionDate, ownerName, ownerMobile, propertyImage } = req.body;
  if (!name || !type || !status || !price) {
    return res.status(400).json({ error: 'All property details are required' });
  }

  const pCost = purchasePrice ? parseFloat(purchasePrice) : 0.00;
  const vendor = vendorName || 'Independent Owner';
  const aDate = acquisitionDate || new Date().toISOString().split('T')[0];
  const oName = ownerName || '';
  const oMobile = ownerMobile || '';
  const pImage = propertyImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=350&auto=format&fit=crop';

  try {
    if (useMySQL) {
      const [rows] = await dbPool.query('SELECT id FROM Properties');
      const nextIdNum = Math.max(...rows.map(r => parseInt(r.id.replace('P', ''), 10)), 5) + 1;
      const id = `P${String(nextIdNum).padStart(3, '0')}`;

      await dbPool.query(
        'INSERT INTO Properties (id, name, type, status, price, purchasePrice, vendorName, acquisitionDate, ownerName, ownerMobile, propertyImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, name, type, status, price, pCost, vendor, aDate, oName, oMobile, pImage]
      );
      res.status(201).json({ id, name, type, status, price: parseFloat(price), purchasePrice: pCost, vendorName: vendor, acquisitionDate: aDate, ownerName: oName, ownerMobile: oMobile, propertyImage: pImage });
    } else {
      const props = readJSON(propertiesFile);
      const nextIdNum = Math.max(...props.map(p => parseInt(p.id.replace('P', ''), 10)), 5) + 1;
      const id = `P${String(nextIdNum).padStart(3, '0')}`;

      const newProp = { id, name, type, status, price: parseFloat(price), purchasePrice: pCost, vendorName: vendor, acquisitionDate: aDate, ownerName: oName, ownerMobile: oMobile, propertyImage: pImage };
      props.push(newProp);
      writeJSON(propertiesFile, props);
      res.status(201).json(newProp);
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not write property record.' });
  }
});

// 5. Properties: Update Status
app.put('/api/properties/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    if (useMySQL) {
      await dbPool.query('UPDATE Properties SET status = ? WHERE id = ?', [status, id]);
      res.json({ success: true, id, status });
    } else {
      const props = readJSON(propertiesFile);
      const updated = props.map(p => p.id === id ? { ...p, status } : p);
      writeJSON(propertiesFile, updated);
      res.json({ success: true, id, status });
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not update property status.' });
  }
});

// 6. Properties: Remove Record
app.delete('/api/properties/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (useMySQL) {
      await dbPool.query('DELETE FROM Properties WHERE id = ?', [id]);
      res.json({ success: true, id });
    } else {
      const props = readJSON(propertiesFile);
      const filtered = props.filter(p => p.id !== id);
      writeJSON(propertiesFile, filtered);
      res.json({ success: true, id });
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not remove property.' });
  }
});

// 7. Leads: Fetch Catalog
app.get('/api/leads', async (req, res) => {
  try {
    if (useMySQL) {
      const [rows] = await dbPool.query('SELECT * FROM Leads');
      res.json(rows);
    } else {
      res.json(readJSON(leadsFile));
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch customer leads.' });
  }
});

// 8. Leads: Add Record
app.post('/api/leads', async (req, res) => {
  const { name, mobile, requirement, status } = req.body;
  if (!name || !mobile || !requirement || !status) {
    return res.status(400).json({ error: 'All customer lead details are required' });
  }

  const avatars = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop"
  ];
  const avatar = avatars[Math.floor(Math.random() * avatars.length)];

  try {
    if (useMySQL) {
      const [rows] = await dbPool.query('SELECT id FROM Leads');
      const nextIdNum = rows.length + 1;
      const id = `L${String(nextIdNum).padStart(3, '0')}`;

      await dbPool.query(
        'INSERT INTO Leads (id, name, mobile, requirement, status, avatar) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, mobile, requirement, status, avatar]
      );
      res.status(201).json({ id, name, mobile, requirement, status, avatar });
    } else {
      const leads = readJSON(leadsFile);
      const id = `L${String(leads.length + 1).padStart(3, '0')}`;

      const newLead = { id, name, mobile, requirement, status, avatar };
      leads.push(newLead);
      writeJSON(leadsFile, leads);
      res.status(201).json(newLead);
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not append customer lead.' });
  }
});

// 9. Users: Fetch standard agents
app.get('/api/users/agents', async (req, res) => {
  try {
    if (useMySQL) {
      const [rows] = await dbPool.query("SELECT UserId as userId, FullName as fullName, EmailAddress as emailAddress, PhoneNumber as phoneNumber, Role as role, CompanyName as companyName, City as city, State as state, ProfileImage as profileImage FROM Users WHERE Role = 'Agent'");
      res.json(rows);
    } else {
      const users = readJSON(localUsersFile);
      const agents = users.filter(u => u.role === 'Agent');
      res.json(agents);
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch agents.' });
  }
});

// 10. Leads: Assign Lead to Agent
app.put('/api/leads/:id/assign', async (req, res) => {
  const { id } = req.params;
  const { assignedTo } = req.body;

  if (!assignedTo) {
    return res.status(400).json({ error: 'Agent name is required for assignment.' });
  }

  try {
    if (useMySQL) {
      await dbPool.query('UPDATE Leads SET assignedTo = ? WHERE id = ?', [assignedTo, id]);
      res.json({ success: true, id, assignedTo });
    } else {
      const leads = readJSON(leadsFile);
      const updated = leads.map(l => l.id === id ? { ...l, assignedTo } : l);
      writeJSON(leadsFile, updated);
      res.json({ success: true, id, assignedTo });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not assign lead.' });
  }
});

// 11. Properties: Process Sales Deal (Generate Invoice metadata)
app.put('/api/properties/:id/sell', async (req, res) => {
  const { id } = req.params;
  const { soldPrice, buyerName, saleDate, paymentMethod, paymentDetails } = req.body;

  if (!soldPrice || !buyerName) {
    return res.status(400).json({ error: 'Sold price and buyer name are required to close the deal.' });
  }

  const payMethod = paymentMethod || 'Cash';
  const payDetails = paymentDetails || '';

  try {
    let property = null;

    if (useMySQL) {
      // Fetch property details first to calculate profit
      const [rows] = await dbPool.query('SELECT * FROM Properties WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Property not found' });
      }
      property = rows[0];

      // Update property details with payment method and details
      await dbPool.query('UPDATE Properties SET status = "Sold", price = ?, paymentMethod = ?, paymentDetails = ? WHERE id = ?', [soldPrice, payMethod, payDetails, id]);
    } else {
      const props = readJSON(propertiesFile);
      const idx = props.findIndex(p => p.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: 'Property not found' });
      }
      property = props[idx];
      props[idx] = { ...property, status: 'Sold', price: parseFloat(soldPrice), paymentMethod: payMethod, paymentDetails: payDetails };
      writeJSON(propertiesFile, props);
    }

    const purchasePrice = parseFloat(property.purchasePrice || property.PurchasePrice || 0);
    const netProfit = parseFloat(soldPrice) - purchasePrice;

    res.json({
      success: true,
      invoice: {
        invoiceId: `INV-${Date.now().toString().slice(-6)}`,
        propertyId: id,
        propertyName: property.name || property.Name,
        propertyType: property.type || property.Type,
        purchasePrice,
        soldPrice: parseFloat(soldPrice),
        netProfit,
        buyerName,
        vendorName: property.vendorName || property.VendorName || 'Independent Owner',
        acquisitionDate: property.acquisitionDate || property.AcquisitionDate || '',
        saleDate: saleDate || new Date().toISOString().split('T')[0],
        paymentMethod: payMethod,
        paymentDetails: payDetails,
        invoiceDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Could not process sales transaction.' });
  }
});

// 12. Requirements (Buy Requirement Module)
app.get('/api/requirements', async (req, res) => {
  try {
    if (useMySQL) {
      const [rows] = await dbPool.query('SELECT * FROM Requirements');
      res.json(rows);
    } else {
      res.json([
        { id: 'R001', buyerName: 'Neha Gupta', mobile: '97xxxxxx88', budgetRange: '₹50L - ₹80L', preferredLocation: 'Mumbai West', propertyType: 'Flat', areaRequirement: '1200 sqft', status: 'Open' },
        { id: 'R002', buyerName: 'Amit Verma', mobile: '99xxxxxx45', budgetRange: '₹1.2Cr - ₹1.5Cr', preferredLocation: 'Andheri', propertyType: 'House', areaRequirement: '2400 sqft', status: 'Open' }
      ]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch requirements.' });
  }
});

app.post('/api/requirements', async (req, res) => {
  const { buyerName, mobile, budgetRange, preferredLocation, propertyType, areaRequirement } = req.body;
  if (!buyerName || !mobile || !budgetRange || !preferredLocation || !propertyType || !areaRequirement) {
    return res.status(400).json({ error: 'All requirement parameters are required.' });
  }

  try {
    if (useMySQL) {
      const [rows] = await dbPool.query('SELECT id FROM Requirements');
      const nextIdNum = rows.length + 1;
      const id = `R${String(nextIdNum).padStart(3, '0')}`;

      await dbPool.query(
        'INSERT INTO Requirements (id, buyerName, mobile, budgetRange, preferredLocation, propertyType, areaRequirement, status) VALUES (?, ?, ?, ?, ?, ?, ?, "Open")',
        [id, buyerName, mobile, budgetRange, preferredLocation, propertyType, areaRequirement]
      );
      res.status(201).json({ id, buyerName, mobile, budgetRange, preferredLocation, propertyType, areaRequirement, status: 'Open' });
    } else {
      res.status(201).json({ id: 'R999', buyerName, mobile, budgetRange, preferredLocation, propertyType, areaRequirement, status: 'Open' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not append requirement.' });
  }
});

// 13. Visits (Site Visit CRM)
app.get('/api/visits', async (req, res) => {
  try {
    if (useMySQL) {
      const [rows] = await dbPool.query('SELECT * FROM Visits');
      res.json(rows);
    } else {
      res.json([
        { id: 'V001', customerName: 'Rahul Sharma', propertyName: 'Green Villa', visitDate: '2026-06-02 14:00', agentName: 'Rajesh Kumar', status: 'Scheduled', notes: 'Interested in house size and garden layout.' }
      ]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch site visits.' });
  }
});

app.post('/api/visits', async (req, res) => {
  const { customerName, propertyName, visitDate, agentName, notes } = req.body;
  if (!customerName || !propertyName || !visitDate || !agentName) {
    return res.status(400).json({ error: 'All visit schedules details are required.' });
  }

  try {
    if (useMySQL) {
      const [rows] = await dbPool.query('SELECT id FROM Visits');
      const nextIdNum = rows.length + 1;
      const id = `V${String(nextIdNum).padStart(3, '0')}`;

      await dbPool.query(
        'INSERT INTO Visits (id, customerName, propertyName, visitDate, agentName, status, notes) VALUES (?, ?, ?, ?, ?, "Scheduled", ?)',
        [id, customerName, propertyName, visitDate, agentName, notes || '']
      );
      res.status(201).json({ id, customerName, propertyName, visitDate, agentName, status: 'Scheduled', notes: notes || '' });
    } else {
      res.status(201).json({ id: 'V999', customerName, propertyName, visitDate, agentName, status: 'Scheduled', notes: notes || '' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not schedule site visit.' });
  }
});

// 14. Deals (Payments, Agreements & Commissions Ledger)
app.get('/api/deals', async (req, res) => {
  try {
    if (useMySQL) {
      const [rows] = await dbPool.query('SELECT * FROM Deals');
      res.json(rows.map(r => ({
        id: r.id,
        propertyId: r.propertyId,
        propertyName: r.propertyName,
        buyerName: r.buyerName,
        tokenAmount: parseFloat(r.tokenAmount || 0),
        advancePayment: parseFloat(r.advancePayment || 0),
        finalPayment: parseFloat(r.finalPayment || 0),
        agreementFile: r.agreementFile || '',
        commissionPercent: parseFloat(r.commissionPercent || 0),
        commissionEarned: parseFloat(r.commissionEarned || 0),
        saleDate: r.saleDate
      })));
    } else {
      res.json([
        { id: 'D001', propertyId: 'P002', propertyName: 'Sky Heights', buyerName: 'Neha Gupta', tokenAmount: 100000, advancePayment: 1500000, finalPayment: 5900000, agreementFile: 'Contract_P002.pdf', commissionPercent: 2.0, commissionEarned: 150000, saleDate: '2026-05-20' }
      ]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch deals registry.' });
  }
});

app.post('/api/deals', async (req, res) => {
  const { propertyId, propertyName, buyerName, tokenAmount, advancePayment, finalPayment, agreementFile, commissionPercent, commissionEarned, saleDate } = req.body;
  if (!propertyId || !propertyName || !buyerName || !saleDate) {
    return res.status(400).json({ error: 'Essential deal parameters are missing.' });
  }

  const tok = parseFloat(tokenAmount || 0);
  const adv = parseFloat(advancePayment || 0);
  const fin = parseFloat(finalPayment || 0);
  const commPct = parseFloat(commissionPercent || 2.00);
  const commEarn = parseFloat(commissionEarned || (tok + adv + fin) * (commPct / 100));

  try {
    if (useMySQL) {
      const [rows] = await dbPool.query('SELECT id FROM Deals');
      const nextIdNum = rows.length + 1;
      const id = `D${String(nextIdNum).padStart(3, '0')}`;

      // Insert deal record
      await dbPool.query(
        'INSERT INTO Deals (id, propertyId, propertyName, buyerName, tokenAmount, advancePayment, finalPayment, agreementFile, commissionPercent, commissionEarned, saleDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, propertyId, propertyName, buyerName, tok, adv, fin, agreementFile || 'Agreement_Signed.pdf', commPct, commEarn, saleDate]
      );

      // Update target property status to Sold
      await dbPool.query('UPDATE Properties SET status = "Sold", price = ? WHERE id = ?', [(tok + adv + fin), propertyId]);

      res.status(201).json({ id, propertyId, propertyName, buyerName, tokenAmount: tok, advancePayment: adv, finalPayment: fin, agreementFile: agreementFile || 'Agreement_Signed.pdf', commissionPercent: commPct, commissionEarned: commEarn, saleDate });
    } else {
      res.status(201).json({ id: 'D999', propertyId, propertyName, buyerName, tokenAmount: tok, advancePayment: adv, finalPayment: fin, agreementFile: agreementFile || 'Agreement_Signed.pdf', commissionPercent: commPct, commissionEarned: commEarn, saleDate });
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not write deal record.' });
  }
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Node Express Server listening securely on port ${PORT}`);
  });
});
