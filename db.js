var mysql = require('mysql');
const dotenv = require('dotenv')

dotenv.config({ path: './.env' })

let db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "appolo"
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
