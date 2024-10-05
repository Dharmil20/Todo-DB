const express = require("express");
const { UserModel, TodoModel } = require("./db");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "randomdharmillovescoding";
const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  await UserModel.insert({
    email: email,
    password: password,
    name: name,
  });

  res.json({
    message: "You are Signed Up!!",
  });
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = UserModel.findOne({
    email: email,
    password: password,
  });

  if (user) {
    const token = jwt.sign();
  } else {
    res.status(403).json({
      message: "Invalid Credentials",
    });
  }
});

function auth(req, res, next) {
  //code
}

app.post("/todo", auth, (req, res) => {
  //code
});

app.get("/todos", auth, (req, res) => {
  //code
});

app.listen(3000);
