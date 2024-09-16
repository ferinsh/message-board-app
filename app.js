
const express = require("express");
const path = require("path");
require('dotenv').config();
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");

const pool = require("./db/pool");




const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

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



passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
passport.deserializeUser(async (id, done) => {
    try {
        const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        const user = rows[0];

        done(null, user);
    } catch(err) {
        done(err);
    }
});


app.get("/sign-up", (req, res) => {
    res.render("signup");
})
app.get("/", (req, res) => {
    res.render("index");
})
app.post("/sign-up", (req, res) => {
    console.log(req.body);
    // res.redirect("/");
    bcrypt.hash(req.body.password, 10, async(err, hashedPassword) => {
        if(err){
            console.error("bcrypt has fail: ", err);
            res.redirect("/");
        }else {
            await pool.query("INSERT INTO users (first_name, last_name, username, password) VALUES ($1, $2, $3, $4)", [
                req.body.first_name,
                req.body.last_name,
                req.body.username,
                hashedPassword
            ])
            res.redirect("/");
        }
    })
})


const PORT = process.env.PORT || 3000 
app.listen(PORT, console.log(`Listening on port ${PORT}`));
