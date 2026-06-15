const mysql = require('mysql2/promise');

async function check() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'ks@1234',
      database: 'kairabilling'
    });
    const [result] = await connection.query('CALL sp_Login(?, ?)', ['8226811810', '15e2b0d3c33891ebb0f1ef609ec419420c20e320ce94c65fbc8c3312448eb225']);
    console.log('Result from CALL sp_Login:', result);
    await connection.end();
  } catch (err) {
    console.error('Error executing procedure:', err.message);
  }
}

check();
