const mysql = require('mysql2/promise');
const crypto = require('crypto');

function hashPasswordSHA256(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function insert() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'ks@1234',
      database: 'kairabilling'
    });

    const phoneNumber = '8226811810';
    const passwordHash = hashPasswordSHA256('123456789');
    
    // Check if exists
    const [existing] = await connection.query('SELECT * FROM Users WHERE PhoneNumber = ?', [phoneNumber]);
    if (existing.length > 0) {
      console.log('User already exists!');
      await connection.end();
      return;
    }

    // Insert user
    await connection.query(
      `INSERT INTO Users 
      (FullName, EmailAddress, CountryCode, PhoneNumber, PasswordHash, Role, CompanyName, City, State, ProfileImage) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Anand Kumar', 'anand.k@kairadeal.com', '+91', phoneNumber, passwordHash, 'Super Admin', 'Kaira Deal Corp', 'Mumbai', 'Maharashtra', '/kaira_logo.svg']
    );
    console.log('SUCCESS: Inserted Super Admin with phone number 8226811810 and password 123456789 successfully in MySQL!');
    await connection.end();
  } catch (err) {
    console.error('Error inserting user:', err.message);
  }
}

insert();
