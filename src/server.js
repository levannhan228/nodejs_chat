import express from 'express';
require('dotenv').config();
import connectDB from './config/connectDB';
import configViewEngine from './config/viewEngine'
import initRoutes from './routes/web';
import bodyParser from 'body-parser';
import connectFlash from 'connect-flash';
import configSession from './config/session';
import passport from 'passport';

import pem from 'pem';
import https from 'https';

//cấu hình http ảo
pem.config({
  pathOpenSSL:'C:\\Program Files\\OpenSSL-Win64\\bin\\openssl'
})
pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
  if (err) {
    throw err;
  }
  //Create app
  let app = express();

  //Connect Database
  connectDB();

  //Config session
  configSession(app);

  //Config view engine
  configViewEngine(app);

  //Config bodyParser
  app.use(bodyParser.urlencoded({ extended: true }));

  //enable connectFlash
  app.use(connectFlash());

  // Config passport
  app.use(passport.initialize());
  app.use(passport.session());
  //add route
  initRoutes(app);
  https.createServer({ key: keys.serviceKey, cert: keys.certificate }, app).listen(process.env.APP_PORT, process.env.APP_HOST, () => {
    console.log(`hello nhan, i'm running at ${process.env.APP_HOST}:${process.env.APP_PORT}`)
  });
  
})
// //Create app
// let app = express();

// //Connect Database
// connectDB();

// //Config session
// configSession(app);

// //Config view engine
// configViewEngine(app);

// //Config bodyParser
// app.use(bodyParser.urlencoded({ extended: true }));

// //enable connectFlash
// app.use(connectFlash());

// // Config passport
// app.use(passport.initialize());
// app.use(passport.session());
// //add route
// initRoutes(app);

// app.listen(process.env.APP_PORT, process.env.APP_HOST, () => {
//   console.log(`hello nhan, i'm running at ${process.env.APP_HOST}:${process.env.APP_PORT}`)
// });
