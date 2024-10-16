import { readFileSync } from "fs"
import https from "https"
import app from "./app.mjs"

const options = {
    key: readFileSync('keys/privatekey.pem'),
    cert: readFileSync('keys/certificate.pem'),
}

const server = https.createServer(options, app);

server.listen(3001)
console.log('Server running on https://localhost:3001');