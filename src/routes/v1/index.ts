import app from "express";
import { isAuthorized } from "../../middlewares/auth.middleware";
const router = app.Router();


//Import Routes
const Auth = require('./auth/auth.routes');
const Wallet = require('./wallet/wallet.routes');



//Mount Routers

// AUTH
// Users can create an account(Basic Information- email, name, password) and Login
router.use('/auth', Auth);


// WALLET
// User can fund their Account with a Card or Bank Transfer.
// User can Withdraw From their Account Into A Bank Account.
// Users can send money to another User using their email.
// A Verify Transaction Webhook & Callback Url
router.use('/wallet', Wallet);






module.exports = router;