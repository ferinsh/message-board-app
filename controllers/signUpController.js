const { body, validationResult } = require('express-validator');
const bcrypt = require("bcrypt");
const pool = require("../db/pool");


function renderSignUpPage(req, res){
    res.render('signup');
}

async function handleSignUp(req, res){
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
}

function signUpValidationRules() {
    return [
        body('username')
            .isEmail()
            .withMessage('Invalid email format'),
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