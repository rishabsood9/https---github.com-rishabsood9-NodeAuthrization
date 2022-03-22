require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const users = [];

app.set("view-engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  try {
    res.render("welcome.ejs");
  } catch (e) {
    console.log(e);
  }
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/welcome", authenticateToken, (req, res) => {
  const data = users.filter(
    (user) => user.email == req.user.email && user.password == req.user.password
  );
  console.log(data);
  if (data.length > 1) {
    res.render("index.ejs", { name: "Rishab" });
  } else {
    return res.sendStatus(401);
  }
});

app.post("/register", (req, res) => {
  try {
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    res.redirect("/login");
  } catch (e) {
    console.log(e);
    res.redirect("/register");
  }
});

app.post("/login", (req, res) => {
  //const data = users.find((user) => user.email == req.body.email);

  const user = {
    email: req.body.email,
    password: req.body.password,
  };
  console.log(user);
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  //res.json({ accessToken: accessToken });
  //res.setHeader("authorization", "Bearer " + accessToken);

  // req.headers.authorization = `Bearer ${accessToken}`;
  // const authHeader = req.headers["authorization"];
  // console.log(authHeader);
  req.locals = "Bearer " + accessToken;
  // if (data) {
  //   if (data.password == req.body.password) {
  //     const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET);
  //     res.json({ accessToken: accessToken });
  res.redirect("/welcome");
  //   }
  // }
});

function authenticateToken(req, res, next) {
  //const authHeader = req.headers["authorization"];
  const authHeader = req.locals;
  console.log(authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.listen(4000);
