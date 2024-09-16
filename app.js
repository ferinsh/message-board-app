
const express = require("express");
const path = require("path");
require('dotenv').config();
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");
const { body, validationResult } = require('express-validator');

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

app.post(
    '/sign-up',
    body('username').isEmail().withMessage('Invalid email format'), // Added validation for email format
    body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'), // Validating password length
    body('confirm_password').custom((value, { req }) => { // Using correct field name for validation
        if (value !== req.body.password) { // Compare with password
        throw new Error('Passwords do not match'); // Throw error if passwords do not match
        }
        return true;
    }),
    async (req, res) => {
        const errors = validationResult(req); // Added to handle validation errors
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
             // Send validation errors as response
        }
        // Handle request
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
    },
);


const PORT = process.env.PORT || 3000 
app.listen(PORT, console.log(`Listening on port ${PORT}`));
