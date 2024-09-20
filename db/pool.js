const {Pool} = require("pg")

// console.log(process.env)

  
  // Export the pool for use in other modules
module.exports = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST, // Changed from server to host for accuracy
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

module.exports = new Pool({
  connectionString: `postgresql://message_board_ns44_user:vGXc3DwIhjlZqS8K8TrUBaczq5qek5mw@dpg-crmnculumphs739hkt80-a.singapore-postgres.render.com/message_board_ns44`
})