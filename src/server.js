import express from 'express';
require('dotenv').config();
import connectDB from './config/connectDB';
import configViewEngine from './config/viewEngine'
import initRoutes from './routes/web';
import bodyParser from 'body-parser';
import connectFlash from 'connect-flash';
import session from './config/session';
import passport from 'passport';
import http from "http";
import socketio from "socket.io";
import initSockets from './sockets/index';
import cookieParser from 'cookie-parser';
import configSocketIo from './config/socketio';
import events from 'events';
import * as configApp from './config/app'
import pem from 'pem';
import https from 'https';

//cấu hình http ảo
// pem.config({
//   pathOpenSSL:'C:\\Program Files\\OpenSSL-Win64\\bin\\openssl'
// })
// pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
//   if (err) {
//     throw err;
//   }
//   //Create app
//   let app = express();

//   //Connect Database
//   connectDB();

//   //Config session
//   configSession(app);

//   //Config view engine
//   configViewEngine(app);

//   //Config bodyParser
//   app.use(bodyParser.urlencoded({ extended: true }));

//   //enable connectFlash
//   app.use(connectFlash());

//   // Config passport
//   app.use(passport.initialize());
//   app.use(passport.session());
//   //add route
//   initRoutes(app);
//   https.createServer({ key: keys.serviceKey, cert: keys.certificate }, app).listen(process.env.APP_PORT, process.env.APP_HOST, () => {
//     console.log(`hello nhan, i'm running at ${process.env.APP_HOST}:${process.env.APP_PORT}`)
//   });

// })


//Create app
let app = express();
// tăng giới hạn lắng nghe của event 11 là nó báo lỗi nên tăng lên
events.EventEmitter.defaultMaxListeners = configApp.app.max_event;
// kết hợp socket.io và express
let server = http.createServer(app);
let io = socketio(server);

//Connect Database
connectDB();

//Config session
session.config(app);

//Config view engine
configViewEngine(app);

//Config bodyParser
app.use(bodyParser.urlencoded({ extended: true }));

//enable connectFlash
app.use(connectFlash());

// User Cookie Parser xài sockets yêu cầu có thằng này
app.use(cookieParser())

// Config passport
app.use(passport.initialize());
app.use(passport.session());

//add route
initRoutes(app);

//config soket.io
configSocketIo(io, cookieParser, session.sessionStore);

//add all sockets
initSockets(io);

server.listen(process.env.APP_PORT, process.env.APP_HOST, () => {
  console.log(`hello nhan, i'm running at ${process.env.APP_HOST}:${process.env.APP_PORT}`)
});
