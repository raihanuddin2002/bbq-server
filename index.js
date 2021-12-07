const express = require('express');
const app = express();
const {MongoClient} = require("mongodb"); 
const env = require('dotenv').config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// DATABASE 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.svqjf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run () {
    try{
        await client.connect(); 
        const database = client.db("bbq");
        const wordsCollention = database.collection("wordCollection");
        
        // // GET API
        // app.get("/service", async (req,res) => {
        //     const cursor = servicesCollention.find({});
        //     const services =await cursor.toArray();
        //     res.send(services);
        // })
        // app.get("/services/:id", async (req,res) => {
        //     const id = req.params.id;
        //     const query = {_id: ObjectId(id)}
        //     const service = await servicesCollention.findOne(query);
        //     res.send(service);
        // });

        // POST API
        app.post("/addWordInfo", async (req,res) => {
            console.log("hiting")
            const wordInfo = req.body.wordInfo;
            // const result = await haiku.insertOne(wordInfo);
            res.send("Send");
        });
        
    }finally{

    }

}
run().catch(console.dir());


// Basic
app.get("/", (req,res) => {
    res.send("JungUrl server Server Running...");
});

app.listen(port, () => {
    console.log("JungUrl server Running on port:", port);
});