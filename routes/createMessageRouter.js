const {Router} = require("express");
const pool = require("../db/pool")

const createMsgRoute = Router();

createMsgRoute.get("/", (req, res) => {
    const username = req.user ? req.user.username : "guest";
    const member = req.user ? req.user.membership_status : false ;
    // console.log(username);
    // console.log(member);
    res.render("create-message", {
      username: username,
      member: member
    });
})

createMsgRoute.post("/", async (req, res) => {
    const username = req.user ? req.user.username : "guest";
    const message = req.body.message;
    console.log(message);

    try {
      await pool.query("INSERT INTO messages (username, message) VALUES ($1, $2);", [username, message]);
      res.redirect("/create-message");
    } catch (err){
      console.error(err);
      res.redirect("/create-message");
    }
})

module.exports = createMsgRoute