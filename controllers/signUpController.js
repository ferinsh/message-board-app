const { body, validationResult } = require('express-validator');
const bcrypt = require("bcrypt");
const pool = require("../db/pool");
const passport = require("passport");


function renderSignUpPage(req, res){
    res.render('signup', {
        errors: null,
        formData: req.body
    });
}

async function handleSignUp(req, res){
    const errors = validationResult(req); // Added to handle validation errors
    if (!errors.isEmpty()) {
        // return res.status(400).json({ errors: errors.array() });
            // Send validation errors as response
        return res.status(400).render('signup', {
            errors: errors.array(),
            formData: req.body
        });
    }
    // Handle request
    
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
            res.redirect("/log-in");
        }
    })
}

async function emailExists(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [email]);
    return rows.length > 0;
}

function signUpValidationRules() {
    return [
        body('username')
            .isEmail()
            .withMessage('Invalid email format')
            .custom(async (value) => {
                const exists = await emailExists(value);
                if (exists) {
                    throw new Error('Email is already in use');
                }
            }),
        body('password')
            .isLength({ min: 5 })
            .withMessage('Password must be at least 5 characters long'),
        body('confirm_password')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords do not match');
                }
                return true;
            }),
    ];
}

module.exports = {
    renderSignUpPage,
    handleSignUp,
    signUpValidationRules
}