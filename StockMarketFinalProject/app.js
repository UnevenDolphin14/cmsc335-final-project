const http = require('http');
const path = require("path");
const express = require("express"); 
const app = express(); 
const bodyParser = require("body-parser");
const finnhub = require('finnhub');
const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = "Cp2ges1r01qh00mjb9ugcp2ges1r01qh00mjb9v0";
require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') }) 
const USERNAME = process.env.MONGO_DB_USERNAME;
const PASSWORD = process.env.MONGO_DB_PASSWORD;
const {MongoClient, ServerApiVersion} = require('mongodb');
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection:process.env.MONGO_COLLECTION};
const uri = 'mongodb+srv://liamgedeon1:CQ59EYtA@cluster0.l3sf3ic.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const finnhubClient = new finnhub.DefaultApi();
const { ObjectId } = require('mongodb');



process.stdin.setEncoding("utf8");
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(__dirname)); 


const portNumber = process.env.PORT || 4000
app.listen(portNumber);
const prompt = "Type stop to shutdown the server:";
console.log(prompt);


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
    response.render("buyShare");
});

app.get("/sellShare", (request, response) => {
    const variables = {
        link: `http://localhost:${portNumber}/sellShare`
    }
    response.render("sellShare");
});


app.post("/buyShare", async (request, response) => {
    let { companyName, quantity } = request.body;
    quantity = parseInt(quantity);
    
    let purchaseRequest = {
        companyName: companyName,
        quantity: quantity
    };


    finnhubClient.quote(companyName, async (error, data, response) => {
        if (error) {
            response.status(500).send('Error fetching cost');
            return;
        }
        let cost = data.c; 
        renderPage(cost);
    });

    async function renderPage(cost) {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        try {
            await client.connect();
            
            const database = client.db(databaseAndCollection.db);
            const collection = database.collection(databaseAndCollection.collection);
            
            const existingDocument = await collection.findOne({ companyName: companyName });

            if (existingDocument) {
                await collection.updateOne(
                    { companyName: companyName },
                    { $inc: { quantity: quantity } } 
                );
            } else {
                await collection.insertOne(purchaseRequest);
            }

            response.render("buyShareReview", { companyName, quantity, cost });
        } catch (e) {
            response.status(500).send('Error processing request');
        } finally {
            await client.close();
        }
    }
});




app.post("/sellShare", async (request, response) => {
    let { companyName, quantity } = request.body;
    quantity = parseInt(quantity);
    
    let sellRequest = {
        companyName: companyName,
        quantity: quantity
    };

    finnhubClient.quote(companyName, async (error, data, response) => {
        if (error) {
            response.status(500).send('Error fetching cost');
            return;
        }

        let cost = data.c; 
        renderPage(cost);
    });

    async function renderPage(cost) {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        try {
            await client.connect();
            
            const database = client.db(databaseAndCollection.db);
            const collection = database.collection(databaseAndCollection.collection);
            
            const existingDocument = await collection.findOne({ companyName: companyName });

            if (existingDocument) {
                if (quantity === 0) {
                    await collection.deleteOne({ companyName: companyName });
                } else {
                    await collection.updateOne(
                        { companyName: companyName },
                        { $set: { quantity: quantity } }
                    );
                }
            } else {
                if (quantity > 0) {
                    await collection.insertOne(sellRequest);
                }
            }
            response.render("sellShareReview", { companyName, quantity, cost });
        } catch (e) {
            response.status(500).send('Error processing request');
        } finally {
            await client.close();
        }
    }
});






