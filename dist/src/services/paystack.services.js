"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = __importDefault(require("request"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MySecretKey = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;
class PaystackServices {
    // Initialize Paystack  Payment (Mainly For Deposit and Funding)
    initializeDeposit(email, amount, mycallback, reference) {
        var options = {
            'method': 'POST',
            'url': 'https://api.paystack.co/transaction/initialize',
            'headers': {
                'Authorization': MySecretKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "email": email,
                "amount": amount *= 100,
                //   "reference": reference || Math.floor(Math.random() * 1000000000),
                "metadata": {
                    "custom_fields": [
                        {
                            "display_name": "Mobile Number",
                            "variable_name": "mobile_number",
                            "value": "+2348012345678"
                        }
                    ]
                }
            })
        };
        const callback = (error, response, body) => {
            return mycallback(error, body);
        };
        (0, request_1.default)(options, callback);
        //   request(options, function (error, response) {
        //     if (error) throw new Error(error);
        //     console.log(response.body);
        //   });
    }
    // Verify Transaction Webhook & Callback Url
    verifyTransaction = (ref, type, mycallback) => {
        const options = {
            url: `https://api.paystack.co/${type}/verify/` + encodeURIComponent(ref),
            headers: {
                authorization: MySecretKey,
                'content-type': 'application/json',
                'cache-control': 'no-cache'
            },
            formData: {}
        };
        const callback = (error, response, body) => {
            return mycallback(error, body);
        };
        (0, request_1.default)(options, callback);
    };
}
exports.default = PaystackServices;
