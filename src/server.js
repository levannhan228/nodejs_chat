import express from 'express';
require('dotenv').config()
import connectDB from './config/connectDB';
import configViewEngine from './config/viewEngine'

//Create app
let app = express();

//Connect Database
connectDB();

//Config view engine

configViewEngine(app)
app.get("/", (req, res) => {
  return res.render("main/master")
});

app.get("/login-register", (req, res) => {
  return res.render("auth/loginRegister")
});

app.listen(process.env.APP_PORT, process.env.APP_HOST, () => {
  console.log(`hello nhan, i'm running at ${process.env.APP_HOST}:${process.env.APP_PORT}`)
});
