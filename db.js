var mysql = require('mysql');
const dotenv = require('dotenv')

dotenv.config({ path: './.env' })

let db = mysql.createConnection({
  host: process.env.hostt,
  user: process.env.userr,
  password: process.env.passwordd,
  database: process.env.databasee
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
