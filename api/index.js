const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });
const fs = require("fs");

const Post = require("./models/Post");
const User = require("./models/User");

const app = express();

const salt = bcrypt.genSaltSync(10);
const secret = "asdfe45we45w345wegw345werjktjwertkj";
const JAVA_JWT =
  "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJmb28iLCJiYXIiOiJiYXoifQ.1MOXGiwGTFLU7-YMvOe2_q2ZRUHAMCVS7pbnOkRKCFV1HIvY8odBaqWVCQRuT2RUbKtGgA2elFRsuka4K1KP7A";
app.use(express.json());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));
mongoose.connect(
  "mongodb+srv://mishrasujal64:nWwrG6URLjGuPecP@cluster0.bxre8zs.mongodb.net/?retryWrites=true&w=majority"
);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userdoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userdoc);
  } catch (e) {
    res.status(400).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // logged in
    jwt.sign({ username, id: userDoc._id }, JAVA_JWT, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token).json({
        id: userDoc._id,
        username,
      });
    });
  } else {
    // not logged in
    res.status(400).json("bad credentials");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, JAVA_JWT, {}, (err, info) => {
    if (err)
      return res.json({
        success: false,
        message: "Failed to authenticate token.",
      });
    res.json(info);
  });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split(".");
  const ext = parts[parts.length - 1];
  const newPath = path + "." + ext;
  fs.renameSync(path, newPath);
  const { token } = req.cookies;
  jwt.verify(token, JAVA_JWT, {}, async (err, info) => {
    if (err)
      return res.json({
        success: false,
        message: "Failed to authenticate token.",
      });
    const { title, summary, content } = req.body;
    const post = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
    });
    res.json(post);
  });
});

app.get("/post", async (req, res) => {
  const posts = await Post.find()
    .populate("author", ["username"])
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(posts);
});

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("author", ["username"]);
  res.json(postDoc);
});

app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    newPath = path + "." + ext;
    fs.renameSync(path, newPath);
  }
  const {token}=req.cookies;
  jwt.verify(token, JAVA_JWT, {}, async (err, info) => {
    if (err){
        return res.json({
            success: false,
            message: "Failed to authenticate token.",
          });
    } 
    const {id, title, summary, content } = req.body;
    const PostDoc = await Post.findById(id);
    const isAuthor=JSON.stringify(PostDoc.author)===JSON.stringify(info.id);
    if(!isAuthor){
        return res.status(400).json("Invalid author");
        
    }
    await Post.findByIdAndUpdate(id,{title,summary,content,cover:newPath?newPath:PostDoc.cover})
    // const post = await Post.create({
    //   title,
    //   summary,
    //   content,
    //   cover: newPath,
    //   author: info.id,
    // });
    res.json(PostDoc);
  });
});

app.listen(4000);
// nWwrG6URLjGuPecP
// mongodb+srv://mishrasujal64:nWwrG6URLjGuPecP@cluster0.bxre8zs.mongodb.net/?retryWrites=true&w=majority
// mongodb+srv://mishrasujal64:nWwrG6URLjGuPecP@cluster0.bxre8zs.mongodb.net/?retryWrites=true&w=majority
