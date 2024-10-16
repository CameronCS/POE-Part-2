import express from "express"
import cors from "cors"

// Import User Routes
import registration from "./routes/customer/registration.mjs"
import login from "./routes/customer/login.mjs"
import payment from "./routes/customer/payment.mjs"

// Import Employee Routes
import e_login from "./routes/employee/login.mjs"
import e_verification from "./routes/employee/verification.mjs"

const app = express();

app.use(cors())
app.use(express.json())

app.use((reg, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Headers", "*")
    res.setHeader("Access-Control-Allow-Methods", "*")
    next()
})

const API_URL = '/api';
const EMP = `${API_URL}/employee`
// Define Routes
app.use(`${API_URL}/register`, registration)
app.use(`${API_URL}/login`, login)
app.use(`${API_URL}/payments`, payment)
app.use(`${EMP}/login`, e_login)
app.use(`${EMP}/payments`, e_verification)

app.route(`${API_URL}/register`, registration)
app.route(`${API_URL}/login`, login)
app.route(`${API_URL}/payments`, payment)
app.route(`${EMP}/login`, e_login)
app.route(`${EMP}/payments`, e_verification)


app.get('/health', (req, res) => {
    res.status(200).send('OK');
});



export default app;