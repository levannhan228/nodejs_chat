import express from 'express';
require('dotenv').config()
import connectDB from './config/connectDB';
import configViewEngine from './config/viewEngine'
import initRoutes from './routes/web'
//Create app
let app = express();

//Connect Database
connectDB();

//Config view engine

configViewEngine(app);

//add route
initRoutes(app);

app.listen(process.env.APP_PORT, process.env.APP_HOST, () => {
  console.log(`hello nhan, i'm running at ${process.env.APP_HOST}:${process.env.APP_PORT}`)
});
