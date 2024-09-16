const {Router} = require("express");
const pool = require("../db/pool");

const membersClubRouter = Router();

const clubController = require("../controllers/membersClubController");

membersClubRouter.get("/", clubController.renderMembersPage)

membersClubRouter.post("/", clubController.handleActivateMember)


module.exports = membersClubRouter