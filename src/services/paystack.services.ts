import request from 'request';
import dotenv from 'dotenv';
dotenv.config();
const MySecretKey = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;


class PaystackServices {

// Initialize Paystack  Payment (Mainly For Deposit and Funding)
initializeDeposit(email: string, amount: number, mycallback: (error: any, response: any) => void, reference?: string) {
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

            const callback = (error: any, response: any, body: any) => {
            return mycallback(error, body);
        };
        request(options, callback);

    //   request(options, function (error, response) {
    //     if (error) throw new Error(error);
    //     console.log(response.body);
    //   });
}

    // Verify Transaction Webhook & Callback Url
    verifyTransaction = (ref: string, type: string , mycallback: any) => {
        const options = {
            url: `https://api.paystack.co/${type}/verify/`+encodeURIComponent(ref),
            headers: {
                authorization: MySecretKey,
                'content-type': 'application/json',
                'cache-control': 'no-cache'
            },
            formData: {
          
            }
        };
    
        const callback = (error: any, response: any, body: any) => {
            return mycallback(error, body);
        }
        request(options, callback);
    }
}



export default PaystackServices;