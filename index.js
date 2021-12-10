const express = require('express');
const app = express();
const {MongoClient} = require("mongodb"); 
const env = require('dotenv').config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcryptjs");

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// DATABASE 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.svqjf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run () {
    try{
        /*==================================
          *       Words Collection start 
          *==================================*/
        await client.connect(); 
        const database = client.db("bbq");
        const wordsCollention = database.collection("wordCollection");
        
        // GET API
        app.get("/wordInfo", async (req,res) => {
            const cursor = wordsCollention.find({}).sort( {_id: -1});
            const result =await cursor.toArray();
            res.send(result);
        });
        app.get("/wordInfo/:id", async (req,res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result =await wordsCollention.findOne(query);
            res.send(result);
        });
        app.get("/wordInfoLimit", async (req,res) => {
            const query = {page:"home"};
            const cursor = wordsCollention.find(query).limit(60).sort( {_id: -1});
            const result =await cursor.toArray();
            res.send(result);
        });
        app.get("/wordJungUrl", async (req,res) => {
            const cursor = wordsCollention.find({}).sort( {_id: -1});
            const result =await cursor.toArray();
            res.send(result);
        });

        // POST API
        app.post("/addword", async (req,res) => {
            const wordInfo = req.body;
            const result = await wordsCollention.insertOne(wordInfo);
            res.send(result);
        });

        app.post("/wordJungUrlSearch", async (req,res) => {
            const searchText = req.body.searchText;
            const query = {wordLine1: { $regex: searchText, $options: 'si'}}; //{wordLine1: { $regex: searchText, $options: 'si'}}
            const cursor = wordsCollention.find(query).sort( {_id: -1});
            const result =await cursor.toArray();
            res.send(result);
        });
        app.post("/word2JungUrlSearch", async (req,res) => {
            const searchText = req.body.searchText2;
            const query = {wordLine2: { $regex: searchText, $options: 'si'}}; //{wordLine1: { $regex: searchText, $options: 'si'}}
            const cursor = wordsCollention.find(query).sort( {_id: -1});
            const result =await cursor.toArray();
            res.send(result);
        });
        app.post("/userJungUrlSearch", async (req,res) => {
            const searchUser = req.body.searchUser;
            const query = {username:{ $regex: searchUser, $options: 'si'}};
            const cursor = wordsCollention.find(query).sort( {_id: -1});
            const result =await cursor.toArray();
            res.send(result);
        });

        // PUT API
        app.put("/updateWordInfo/:id", async (req,res) => {
            const id = req.params.id;
            const updateWordInfo = req.body; 
            const filter = {_id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: updateWordInfo
              };
            const result = await wordsCollention.updateOne(filter, updateDoc, options);
            res.send(result);
        });
        // DELETE API
        app.delete("/wordDelete/:id",async (req,res) => {
            const id = req.params.id;
            console.log(id)
            const query = {_id:ObjectId(id)};
            const result = await wordsCollention.deleteOne(query);
            res.send(result);
        });
         // Words Collection end

        /*==================================
        *       Users Collection start 
        *==================================*/
          const usersCollention = database.collection("users");

        //   POST API
          app.post("/addUser", async (req,res) => {
            const userInfo = req.body.userInfo;
            const {firstName,lastName,country,email,password} = userInfo;

            const isUserExist = await usersCollention.findOne({email});
            if(isUserExist){
                return res.status(400).send({
                    message: 'User Already Exist!'
                 });
            }else{
                const hashPassword = await bcrypt.hash(password,10);
                const saveUserInfo ={
                    firstName,lastName,country,email,password:hashPassword
                }
                const result = await usersCollention.insertOne(saveUserInfo);
                res.send(result);
            }
            
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