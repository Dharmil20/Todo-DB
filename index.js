const bcrypt = require("bcrypt");
const express = require("express");
const { UserModel, TodoModel } = require("./db");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const JWT_SECRET = "randomdharmillovescoding";
const { z } = require("zod");

const app = express();

mongoose.connect(
  "mongodb+srv://dharmiltrivedi5:4BTC5fjyuZX1zCjj@cluster0.nqozu.mongodb.net/todo-app-database"
);
app.use(express.json());

app.post("/signup", async (req, res) => {
  const requiredBody = z.object({
    email: z.string().min(3).max(100).email(),
    name: z.string().min(3).max(100),
    password: z
      .string()
      .min(8)
      .max(30)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
  });

  const parsedDataWithSuccess = requiredBody.safeParse(req.body);

  if (!parsedDataWithSuccess.success) {
    res.json({
      message: "Incorrect Format",
      error: parsedDataWithSuccess.error,
    });
    return;
  }

  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  const hashedPassword = await bcrypt.hash(password, 5);
  //We use the Promisified approach so we dont need to add the callback function as a 3rd argument
  try {
    await UserModel.create({
      email: email,
      password: hashedPassword,
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
  });

  if (!user) {
    res.status(403).json({
      message: "User Not Found",
    });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  // if(promise) is always true
  if (passwordMatch) {
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

app.post("/todo", auth, async (req, res) => {
  const title = req.body.title;
  const done = req.body.done;
  const date = new Date();
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
        createTime: date.toString(),
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

app.get("/todos", auth, async (req, res) => {
  const userId = req.userId;
  try {
    const todos = await TodoModel.find({
      userId,
    });

    res.json({
      todos,
    });
  } catch {
    res.json({
      message: "Invalid Token Provided",
    });
  }
});

app.post("/done", async (req, res) => {
  const todoId = req.body.todoId;
  try {
    const todoFound = await TodoModel.findOne({
      _id: todoId,
    });

    if (todoFound) {
      await TodoModel.updateOne(
        {
          _id: todoId,
        },
        {
          done: true,
        }
      );

      res.json({
        message: "Todo marked as done",
      });
    }
  } catch {
    res.json({
      message: "Todo not Found",
    });
  }
});

app.post("/deleteTodo", async (req, res) => {
  const todoId = req.body.todoId;
  try {
    const todoFound = await TodoModel.findOne({
      _id: todoId,
    });

    if (todoFound) {
      await TodoModel.deleteOne(
        {
          _id: todoId,
        },
      );

      res.json({
        message: "Todo Deleted",
      });
    }
  } catch {
    res.json({
      message: "Todo not Found",
    });
  }
});

app.listen(3000);
