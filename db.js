var mysql = require('mysql');
const dotenv = require('dotenv')

dotenv.config({ path: './.env' })

let db = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database
});
db.connect((err) => {
    if (!err) {
      
      console.log('Connected to the MySQL server.');
    }
    else {
      console.error('error: ' + err);

    }
    
});

module.exports = db
