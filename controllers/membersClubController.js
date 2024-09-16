const pool = require("../db/pool");

function renderMembersPage(req, res){
    const username = req.user ? req.user.username.split("@")[0] : "Guest";
    const membership = req.user ? req.user.membership_status : false;
    // console.log(username);
    
    res.render("members-club-index.ejs", {
        username: username,
        member: membership
    });
}

async function handleActivateMember(req, res){
    const username = req.user ? req.user.username.split("@")[0] : "Guest";

    // Validate the passkey
    if (req.body.passkey === process.env.MEMBER_PASSKEY) {
        // console.log(username);
        
        // Check if the user is logged in
        if (username === "Guest") {
            return res.status(400).redirect("/log-in");
        } else {
            try {
                // Update membership status for the logged-in user
                await pool.query("UPDATE users SET membership_status = TRUE WHERE username = $1", [req.user.username]);
                // await rows = pool.query("SELECT * FROM users")
                console.log("Membership activated");

                // Redirect or render the success page
                res.render("members-club-index.ejs", {
                    username: username,
                    member: true
                });
            } catch (err) {
                console.error("Error updating membership:", err);
                res.status(500).send("Error updating membership. Please try again later.");
            }
        }
    } else {
        // Handle invalid passkey
        res.status(401).send("Invalid passkey");
    }
}

module.exports = {
    renderMembersPage,
    handleActivateMember
}