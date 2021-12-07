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
        
        // GET API
        app.get("/wordInfo", async (req,res) => {
            const cursor = wordsCollention.find({});
            const result =await cursor.toArray();
            res.send(result);
        })
        app.get("/wordInfoLimit", async (req,res) => {
            const query = {page:"home"};
            const cursor = wordsCollention.find(query).sort( {_id: ObjectId(-1)}).limit(60);
            const result =await cursor.toArray();
            res.send(result);
        })
        // app.get("/services/:id", async (req,res) => {
        //     const id = req.params.id;
        //     const query = {_id: ObjectId(id)}
        //     const service = await servicesCollention.findOne(query);
        //     res.send(service);
        // });

        // POST API
        app.post("/addword", async (req,res) => {
            const wordInfo = req.body;
            const result = await wordsCollention.insertOne(wordInfo);
            res.send(result);
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