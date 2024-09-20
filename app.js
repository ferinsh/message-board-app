
const express = require("express");
const path = require("path");
require('dotenv').config();
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");
const { error } = require("console");


// require - database
const pool = require("./db/pool");

// require - routes
const signUpRouter = require("./routes/signUpRouter");
const membersClubRouter = require("./routes/membersClubRouter");
const loginRouter = require("./routes/loginRouter");
const createMessageRouter = require("./routes/createMessageRouter");
const logOutRouter = require("./routes/logOutRouter");

// set app
const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/*
    create session
    use urlencoded to read request body
    use static assets
*/ 

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));



// create local strategy for passport
passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = rows[0];
  
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          // passwords do not match!
          return done(null, false, { message: "Incorrect password" })
        }
        return done(null, user);
      } catch(err) {
        return done(err);
      }
    })
);


// function to serialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
// 
passport.deserializeUser(async (id, done) => {
    try {
        const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        const user = rows[0];

        done(null, user);
    } catch(err) {
        done(err);
    }
});

// GET index page
app.get("/", async (req, res) => {
    const username = req.user ? req.user.username.split("@")[0] : "guest";
    const logged_in = !!req.user;

    const user = {
      username: req.user ? req.user.username.split("@")[0] : "guest",
      member: req.user ? req.user.membership_status : false
    }

    try {
      const query = "SELECT message, username FROM messages WHERE message <> $1 ORDER BY CASE WHEN username = $2 THEN 0  ELSE 1 END;"
      const messages = await pool.query(query, ["No Messages", req.user ? req.user.username : ""]);
      console.log(messages.rows);
      res.render("index", {
        username: user.username,
        member: user.member,
        logged_in: logged_in,
        messages: messages.rows,
        error: false
      });
    } catch (err) {
      console.error(err);
      const messages = [{message: "Cannot load messages"}]
      res.render("index", {
        username: user.username,
        member: user.member,
        logged_in: logged_in,
        messages: messages,
        error: true
      })
    }

})

// Routes for App
app.use("/sign-up", signUpRouter);
app.use("/members-club", membersClubRouter);
app.use("/log-in", loginRouter);
app.use("/create-message", createMessageRouter);
app.use("/log-out", logOutRouter);

// App LISTEN
const PORT = process.env.PORT || 3000 
app.listen(PORT, console.log(`Listening on port ${PORT}`));
