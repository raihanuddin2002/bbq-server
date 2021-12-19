const express = require('express');
const app = express();
const { MongoClient } = require("mongodb");
const env = require('dotenv').config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// DATABASE
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.svqjf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        /*==================================
          *       Words Collection start
          *==================================*/
        await client.connect();
        const database = client.db("bbq");
        const wordsCollention = database.collection("wordCollection");

        // GET API
        app.get("/wordInfo", async (req, res) => {
            const cursor = wordsCollention.find({}).sort({ _id: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });
        app.get("/wordInfo/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await wordsCollention.findOne(query);
            res.send(result);
        });
        app.get("/wordInfoLimit", async (req, res) => {
            const query = { page: "home" };
            const cursor = wordsCollention.find(query).limit(60).sort({ _id: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });
        app.get("/wordJungUrl", async (req, res) => {
            const cursor = wordsCollention.find({}).sort({ _id: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });

        // POST API
        app.post("/addword", async (req, res) => {
            const wordInfo = req.body;
            const result = await wordsCollention.insertOne(wordInfo);
            res.send(result);
        });

        app.post("/wordJungUrlSearch", async (req, res) => {
            const searchText = req.body.searchText;
            const query = { wordLine1: { $regex: searchText, $options: 'si' } }; //{wordLine1: { $regex: searchText, $options: 'si'}}
            const cursor = wordsCollention.find(query).sort({ _id: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });
        app.post("/word2JungUrlSearch", async (req, res) => {
            const searchText = req.body.searchText2;
            const query = { wordLine2: { $regex: searchText, $options: 'si' } }; //{wordLine1: { $regex: searchText, $options: 'si'}}
            const cursor = wordsCollention.find(query).sort({ _id: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });
        app.post("/userJungUrlSearch", async (req, res) => {
            const searchUser = req.body.searchUser;
            const query = { username: { $regex: searchUser, $options: 'si' } };
            const cursor = wordsCollention.find(query).sort({ _id: -1 });
            const result = await cursor.toArray();
            res.send(result);
        });

        // PUT API
        app.put("/updateWordInfo/:id", async (req, res) => {
            const id = req.params.id;
            const updateWordInfo = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: updateWordInfo
            };
            const result = await wordsCollention.updateOne(filter, updateDoc, options);
            res.send(result);
        });
        // DELETE API
        app.delete("/wordDelete/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            const result = await wordsCollention.deleteOne(query);
            res.send(result);
        });
        // Words Collection end

        /*==================================
        *       Users Collection start
        *==================================*/
        const usersCollention = database.collection("users");

        // GET API
        let userData;
        app.get("/verifyEmail", async (req, res) => {
            try {
                let count = 1;
                const { firstName, lastName, country, email, password } = userData;
                const token = await req.query.token;


                if (token === email && count === 1) {
                    count = count + 1;

                    const hashPassword = await bcrypt.hash(password, 10);
                    const saveUserInfo = {
                        firstName, lastName, country, email, password: hashPassword, isVerified: true, token: ""
                    }

                    const result = await usersCollention.insertOne(saveUserInfo);

                    res.redirect("https://bbqq-e532b.web.app/verifyEmail?emailstatus=verified");
                    // res.send("Email Verified Successfully!");


                }
            } catch (err) {
                res.status(400).json({
                    message: 'Invalid Token!!'
                });
            }
        });


        //   POST API
        app.post("/addUser", async (req, res) => {
            const userInfo = req.body.userInfo;
            const { firstName, lastName, country, email, password, isVerified, token } = userInfo;

            const isUserExist = await usersCollention.findOne({ email });
            if (isUserExist) {
                return res.status(400).json({
                    message: 'User Already Exist!'
                });
            } else {
                // Mail send
                const senderInfo = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: "jungurl2021@gmail.com",
                        pass: "Jung1820@"
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                })
                // Send Email to user
                const mailOptions = {
                    from: `Verify Your Email <jungurl2021@gmail.com>`,
                    to: email,
                    subject: "Verified Email check",
                    html: `<h2>Thank you for registering our website Jungurl</h2><h4>Hello ${firstName}</h4> <h4>Please Verify Your Email...</h4> <a href="https://bbq-server.herokuapp.com/verifyEmail?token=${email}">Click Here to verify</a>`
                }

                // Sending Mail
                senderInfo.sendMail(mailOptions, function (err, info) {
                    if (err) {
                        return res.status(400).json({
                            message: 'Try Again Something went Wrong!!'
                        });
                    } else {
                        userData = { firstName, lastName, country, email, password, isVerified, token };
                        res.send("Check your Gmail inbox or spam for varification...");
                    }
                })
            }
        });
        // Login
        app.post("/loginUser", async function (req, res) {
            try {
                const loginInfo = req.body.loginInfo;
                const result = await usersCollention.findOne({ email: loginInfo.email });
                const isMatch = await bcrypt.compare(loginInfo.password, result.password);

                if (!isMatch) {
                    res.status(400).json({
                        message: "Email or Password is Incorrect!"
                    })
                } else {
                    let token = await jwt.sign({ _id: result._id }, process.env.JWT_SECRET_KEY);

                    const filter = { email: loginInfo.email };
                    const options = { upsert: true };
                    const updateDoc = {
                        $set: { token },
                    };

                    const updateToken = await usersCollention.updateOne(filter, updateDoc, options);

                    res.send(token);
                }
            } catch (err) {
                res.status(400).json({
                    message: "Email or Password is Incorrect!!"
                })
            }
        });

        // Check admin
        app.post("/isAdmin", async (req, res) => {
            const token = req.body.getCookie;
            const result = await usersCollention.findOne({ token });

            res.send(result.role);
        });

    } finally {

    }

}
run().catch(console.dir());


// Basic
app.get("/", (req, res) => {
    res.send("JungUrl server Server Running...");
});

app.listen(port, () => {
    console.log("JungUrl server Running on port:", port);
});
