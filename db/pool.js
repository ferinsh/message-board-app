const {Pool} = require("pg")

// console.log(process.env)

  
  // Export the pool for use in other modules
module.exports = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST, // Changed from server to host for accuracy
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    ssl: {
      rejectUnauthorized: false, // Adjust as needed
    },
});
