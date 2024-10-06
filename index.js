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

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await UserModel.findOne({
    email: email,
    password: password,
  });

  if (user) {
    const token = jwt.sign(
      {
        id: user._id.toString(),
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
  const decodedData = jwt.verify(token, JWT_SECRET);

  if (decodedData) {
    req.userId = decodedData.id;
    next();
  } else {
    res.status(403).json({
      message: "Invalid Credentials",
    });
  }
}

app.post("/todo", auth, async(req, res) => {
  const title = req.body.title;
  const done = req.body.done;

  try {
    const todo = await TodoModel.findOne({
      title: title,
      userId: req.userId,
    });

    if (todo === null) {
      await TodoModel.create({
        userId: req.userId,
        title: title,
        done: done,
      });
      res.json({
        message: "Todo Created",
      });
    } else {
      res.status(403).json({
        message: "Todo Already Exists!",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the todo",
    });
  }
});

app.get("/todos", auth, async(req, res) => {
  const userId = req.userId;
  try{
    const todos = await TodoModel.find({
      userId
    })
  
    res.json({
      todos
    })
  } catch{
    res.json({
      message: "Invalid Token Provided"
    })
  }

});

app.listen(3000);
