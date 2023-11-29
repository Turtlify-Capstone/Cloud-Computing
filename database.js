const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'penyu',
    password: 'Hertzman01'
});

module.exports = pool.promise();
