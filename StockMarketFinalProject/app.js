const http = require('http');
const path = require("path");
const express = require("express"); 
const app = express(); 
const bodyParser = require("body-parser");
const finnhub = require('finnhub');
const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = "Cp2ges1r01qh00mjb9ugcp2ges1r01qh00mjb9v0";
require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') }) 
const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const {MongoClient, ServerApiVersion} = require('mongodb');
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection:process.env.MONGO_COLLECTION};
const uri = 'mongodb+srv://liamgedeon1:CQ59EYtA@cluster0.l3sf3ic.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const finnhubClient = new finnhub.DefaultApi();


process.stdin.setEncoding("utf8");
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(__dirname));

if (process.argv.length != 3) {
    console.error("Usage app.js jsonFile");
    process.exit(0);
}

const portNumber = process.argv[2];
app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);
const prompt = "Type stop to shutdown the server:";
console.log(prompt);
finnhubClient.symbolSearch('AAPL', (error, data, response) => {
    console.log(data)
});

process.stdin.on('readable', () => {

    let dataIn = process.stdin.read();

    if(dataIn !== null){

        const command = dataIn.trim();

        if(command === "stop"){
            console.log("Shutting Down Server");
            process.exit(0);
        }else{ 
            console.log(`Invalid command: ${command}`);
            process.stdout.write(prompt);
   		    process.stdin.resume();
        }
    }

});

app.get("/", (request, response) => {
    response.render("index");
});

app.get("/buyShare", (request, response) => {
    const variables = {
        link: `http://localhost:${portNumber}/buyShare`
    }
    response.render("buyShare", variables);
});

app.get("/sellShare", (request, response) => {
    const variables = {
        link: `http://localhost:${portNumber}/sellShare`
    }
    response.render("sellShare", variables);
});

