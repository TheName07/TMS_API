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
const User = require("./model/students"); 
const Teacher = require("./model/teachers")
// ****************************************************** Student API ******************************************************
// Get All Student
app.get("/api/students",auth ,(req, res) => {
  try{
    User.find({},{_id : 0,password : 0,__v : 0},function(err,Users){
      if(err)
        throw err;
      if(Users){
        res.status(200).json(Users);
      } 
    });
  }catch(err){
    console.log(err)
    res.status(500).send({success : false , msg : "Internal Server Error"})
  }
});

// Register Student
app.post("/api/student/register", async (req, res) => {
     // Our register logic starts here
  try {
    // Get user input
    const { full_name,std,username, password,sub } = req.body;
   
    // Validate user input
    if (!(username && password && full_name && std && sub )) {
      var resq = {
        success : false,
        msg : "All input is required"
      }
      res.status(400).send(resq);
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ username });
    var resq = {
      success : false,
      msg : "User Already Exist, Type Different Username"
    }
    if (oldUser) {
      return res.status(409).send(resq);
    }

    //Encrypt student password
    encryptedPassword = await bcrypt.hash(password, 10);
    
    // Create user in our database
    const user = await User.create({
      full_name,
      std,
      sub,
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
    var resq = {
      success : true,
      msg : "User Created",
      token : token,
      id : user._id
    }
    // return new user
    res.status(201).json(resq);
  } catch (err) {
    console.log(err);
    res.status(500).send({success : false , msg : "Internal Server Error"});
  }
  // Our register logic ends here
});

// Login Student
app.post("/api/student/login",async (req, res) => {

    // Our login logic starts here
    try {
      // Get user input
      const { username, password } = req.body;

      // Validate user input
      if (!(username && password)) {
        var resq = {
          success : true,
          msg : "All input is required"
        }
        res.status(400).send(resq);
      }
      // Validate if user exist in our database
      const user = await User.findOne({ username : username.toLowerCase() });
  
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, username },
          process.env.TOKEN_KEY,
          // {
          //   expiresIn: "2h",
          // }
        );
        // save user token
        user.token = token;
        var resp = {
          success : true,
          msg : "Authenticated",
          token : token,
          id : user._id
        }
        // user
        res.status(200).send(resp);
      } else {

        var resp = {
          success : false,
          msg : "Unauthenticated (Invalid Password)",
        }
        res.status(400).send(resp);
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({success : false , msg : "Internal Server Error"});
    }
    // Our register logic ends here
});

// Update Student
app.put("/api/student/update",auth, async  (req,res) =>{

  try{
    const { user_id,full_name,username,std,sub } = req.body;
    const data = await User.findOne({ _id : user_id});
    if(data){
      const user = await User.findByIdAndUpdate({ _id : user_id },{ $set :{ full_name: full_name, username:username, std: std, sub:sub}});
      var resp = {
        success : true,
        msg : "Updated"
      }
      res.status(200).send(resp);
    } else {
      var resp = {
        success : false,
        msg : "User Id not found!"
      }
      res.status(200).send(resp);
    }
  }catch(err){
    console.log(err);
    res.status(500).send({success : false , msg : "Internal Server Error"});
  }
});

// Reset Password Student
app.put("/api/student/resetpassword",auth, async  (req,res) =>{

  try{
    const { user_id,password,new_password } = req.body;
    const data = await User.findOne({ _id : user_id });

    if (data && ( await bcrypt.compare(password, data.password))) {
      // New Password being encrypted
      const encryptedPassword = await bcrypt.hash(new_password, 10);
      const user = await User.findByIdAndUpdate({ _id : user_id },{ $set :{ password : encryptedPassword }});
      var resp = {
        success : true,
        msg : "Password is Updated"
      }
      res.status(200).send(resp);
    } else {
      var resp = {
        success : false,
        msg : "Old Password is Wrong"
      }
      res.status(200).send(resp);
    }
  }catch{
    console.log(err);
    res.status(500).send({success : false , msg : "Internal Server Error"});
  }
});

// Delete Student
app.delete('/api/student/delete/:id', auth, async (req, res) => {
  try{
    const { user_id} = req.body;
    const data = await User.findOne({ _id : user_id});
    if(data){
      const user = await User.findByIdAndDelete(user_id);
      res.status(200).send({success : true , msg : "Deleted"}); 
    }else{
      var resp = {
        success : false,
        msg : "User Id not found!"
      }
      res.status(200).send(resp);
    }
  }catch(err){
    console.log(err);
    res.status(500).send({success : false , msg : "Internal Server Error"});
  }
 
});

// ****************************************************** Teachers API ******************************************************

app.get("/api/teachers",auth ,(req, res) => {
  try{
    Teacher.find({},{_id : 0,password : 0,__v : 0},function(err,Teachers){
      if(err)
        throw err;
      if(Teachers){
        res.status(200).json(Teachers);
      } 
    });
  }catch(err){
    console.log(err)
    res.status(500).send({success : false , msg : "Internal Server Error"})
  }
});

// Register Student
app.post("/api/teacher/register", async (req, res) => {
     // Our register logic starts here
  try {
    // Get user input
    const { tc_name, full_name, email ,password,sub,std } = req.body;
   
    // Validate user input
    if (!(tc_name && full_name && email && password && std && sub )) {
      var resq = {
        success : false,
        msg : "All input is required"
      }
      res.status(400).send(resq);
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await Teacher.findOne({ email });
    var resq = {
      success : false,
      msg : "User Already Exist, Type Different email"
    }
    if (oldUser) {
      return res.status(409).send(resq);
    }

    //Encrypt student password
    encryptedPassword = await bcrypt.hash(password, 10);
    
    // Create user in our database
    const user = await Teacher.create({
      tc_name,
      full_name,
      email : email.toLowerCase(),
      password: encryptedPassword,
      std,
      sub
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;
    var resq = {
      success : true,
      msg : "User Created",
      token : token,
      id : user._id
    }
    // return new user
    res.status(201).json(resq);
  } catch (err) {
    console.log(err);
    res.status(500).send({success : false , msg : "Internal Server Error"});
  }
  // Our register logic ends here
});

// Login Teacher
app.post("/api/teacher/login",async (req, res) => {

    // Our login logic starts here
    try {
      // Get user input
      const { email, password } = req.body;

      // Validate user input
      if (!(email && password)) {
        var resq = {
          success : true,
          msg : "All input is required"
        }
        res.status(400).send(resq);
      }
      // Validate if user exist in our database
      const user = await Teacher.findOne({ email : email.toLowerCase() });
  
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY,
          // {
          //   expiresIn: "2h",
          // }
        );
        // save user token
        user.token = token;
        var resp = {
          success : true,
          msg : "Authenticated",
          token : token,
          id : user._id
        }
        // user
        res.status(200).send(resp);
      } else {
        var resp = {
          success : false,
          msg : "Unauthenticated(Invalid Password)",
        }
        res.status(400).send(resp);
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({success : false , msg : "Internal Server Error"});
    }
    // Our register logic ends here
});

// Update Teacher
app.put("/api/teacher/update",auth, async  (req,res) =>{

  try{
    const { user_id, tc_name, full_name, email, sub, std } = req.body;
    const data = await Teacher.findOne({ _id : user_id});
    if(data){
      const user = await Teacher.findByIdAndUpdate({ _id : user_id },{ $set :{ tc_name: tc_name, full_name:full_name, email:email, std: std, sub:sub}});
      var resp = {
        success : true,
        msg : "Updated"
      }
      res.status(200).send(resp);
    } else {
      var resp = {
        success : false,
        msg : "User Id not found!"
      }
      res.status(200).send(resp);
    }
  }catch(err){
    console.log(err);
    res.status(500).send({success : false , msg : "Internal Server Error"});
  }
});

// Reset Password Student
app.put("/api/teacher/resetpassword",auth, async  (req,res) =>{

  try{
    const { user_id,password,new_password } = req.body;
    const data = await Teacher.findOne({ _id : user_id });

    if (data && ( await bcrypt.compare(password, data.password))) {
      // New Password being encrypted
      const encryptedPassword = await bcrypt.hash(new_password, 10);
      const user = await Teacher.findByIdAndUpdate({ _id : user_id },{ $set :{ password : encryptedPassword }});
      var resp = {
        success : true,
        msg : "Password is Updated"
      }
      res.status(200).send(resp);
    } else {
      var resp = {
        success : false,
        msg : "Old Password is Wrong"
      }
      res.status(200).send(resp);
    }
  }catch{
    console.log(err);
    res.status(500).send({success : false , msg : "Internal Server Error"});
  }
});

// Delete Student
app.delete('/api/teacher/delete', auth, async (req, res) => {
  try{
    const { user_id } = req.body;
    const data = await Teacher.findOne({ _id : user_id});
    if(data){
      const user = await Teacher.findByIdAndDelete(user_id);
      res.status(200).send({success : true , msg : "Deleted"}); 
    }else{
      var resp = {
        success : false,
        msg : "User Id not found!"
      }
      res.status(200).send(resp);
    }
  }catch(err){
    console.log(err);
    res.status(500).send({success : false , msg : "Internal Server Error"});
  }
 
});
