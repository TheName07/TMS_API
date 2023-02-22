require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const auth = require("./middleware/auth");

app.use(express.json());

module.exports = app;

// importing user context
const User = require("./model/user");

// Home
app.get("/api/students", (req, res) => {
  User.find({},{_id : 0,password : 0,__v : 0},function(err,Users){
    if(err)
      throw err;
    if(Users){
      res.status(200).json(Users);
    } 
  });
  
});

// Register
app.post("/api/student/register", async (req, res) => {
     // Our register logic starts here
  try {
    // Get user input
    const { first_name, last_name,std,username, password } = req.body;
   
    // Validate user input
    if (!(username && password && first_name && last_name && std)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ username });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);
    
    // Create user in our database
    const user = await User.create({
      first_name,
      last_name,
      std,
      username: username.toLowerCase(), // sanitize: convert username to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, username },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

// Login
app.post("/api/student/login", auth,async (req, res) => {

    // Our login logic starts here
    try {
      // Get user input
      const { username, password } = req.body;

      // Validate user input
      if (!(username && password)) {
        res.status(400).send("All input is required");
      }
      // Validate if user exist in our database
      const user = await User.findOne({ username : username.toLowerCase() });
  
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, username },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
  
        // save user token
        user.token = token;
  
        // user
        res.status(200).send("Login Successfully");
      }
      res.status(400).send("Invalid Credentials");
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
});

// Update
app.put("/api/student/:id", async  (req,res) =>{

})