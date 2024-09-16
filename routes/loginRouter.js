const {Router} = require("express");
const passport = require("passport")

loginRouter = Router();

loginRouter.get("/", (req, res) => {
    res.render("login.ejs", {
        formData: {
            username: null
        }
    });
})

loginRouter.post("/", 
    passport.authenticate("local", { // Adjust strategy name if different
        successRedirect: "/", // Redirect to home page on success
        failureRedirect: "/login", // Redirect back to login page on failure
        failureFlash: true // Optionally use flash messages for errors (requires connect-flash)
    })
);

loginRouter.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect("/"); // Redirect to home page after logout
    });
});

module.exports = loginRouter