const {Router} = require("express");
const signUpController = require("../controllers/signUpController");
const signUpRouter = Router();

signUpRouter.get("/", signUpController.renderSignUpPage);

signUpRouter.post(
    '/',
    signUpController.signUpValidationRules(),
    signUpController.handleSignUp
);


module.exports = signUpRouter;