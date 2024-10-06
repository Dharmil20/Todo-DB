const express = require("express");
const { UserModel, TodoModel } = require("./db");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const JWT_SECRET = "randomdharmillovescoding";
const app = express();

mongoose.connect(
  "mongodb+srv://dharmiltrivedi5:4BTC5fjyuZX1zCjj@cluster0.nqozu.mongodb.net/todo-app-database"
);
app.use(express.json());

app.post("/signup", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  try {
    await UserModel.create({
      email: email,
      password: password,
      name: name,
    });

    res.json({
      message: "You are Signed Up!!",
    });
  } catch {
    res.json({
      message: "User Already signed up",
    });
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = UserModel.findOne({
    email: email,
    password: password,
  });

  if (user) {
    const token = jwt.sign(
      {
        id: user._id.toString()
      },
      JWT_SECRET
    );
    res.json({
      token: token,
    });
  } else {
    res.status(403).json({
      message: "Invalid Credentials",
    });
  }
});

function auth(req, res, next) {
  const token = req.headers.token;
  const decodedData = jwt.verify(token,JWT_SECRET);

  console.log(decodedData);
  next();
}

app.post("/todo", auth, (req, res) => {
  res.json({
    message: "Your todos"
  })
});

app.get("/todos", auth, (req, res) => {
  //
});

app.listen(3000);
