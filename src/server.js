import express from 'express';
require('dotenv').config()
import connectDB from './config/connectDB';
import configViewEngine from './config/viewEngine'
import initRoutes from './routes/web';
import bodyParser from 'body-parser';
import connectFlash from 'connect-flash';
import configSession from './config/session';
//Create app
let app = express();

//Connect Database
connectDB();

//config session
configSession(app);

//Config view engine
configViewEngine(app);

//
app.use(bodyParser.urlencoded({extended: true}));

//enable connectFlash
app.use(connectFlash());

//add route
initRoutes(app);

app.listen(process.env.APP_PORT, process.env.APP_HOST, () => {
  console.log(`hello nhan, i'm running at ${process.env.APP_HOST}:${process.env.APP_PORT}`)
});
