
const express = require("express");
const path = require("path");
require('dotenv').config();
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");


// require - database
const pool = require("./db/pool");

// require - routes
const signUpRouter = require("./routes/signUpRouter");
const membersClubRouter = require("./routes/membersClubRouter");
const loginRouter = require("./routes/loginRouter");
const { log } = require("console");

// set app
const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/*
    create session
    use urlencoded to read request body
*/ 

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));


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
app.get("/", (req, res) => {
    const username = req.user ? req.user.username.split("@")[0] : "Guest";
    const logged_in = req.user ? true : false

    res.render("index", {
        username: username,
        logged_in: logged_in
    });
})

// Routes for App
app.use("/sign-up", signUpRouter);
app.use("/members-club", membersClubRouter);
app.use("/log-in", loginRouter);
app.get("/create-message", (req, res) => {
    res.redirect("/");
})

// App LISTEN
const PORT = process.env.PORT || 3000 
app.listen(PORT, console.log(`Listening on port ${PORT}`));
