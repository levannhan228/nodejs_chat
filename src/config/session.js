import session from 'express-session';
import connectMongo from 'connect-mongo';

let MongoStore = connectMongo(session);

//biến lưu trữ section trong mongodb thay vì lưu tron RAM
let sessionStore = new MongoStore({
  url: `${process.env.DB_CONNECTION}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  autoReconnect: true
  // autoRemote: "native" mặc định của connectMongo tự động xóa session nếu cookie hết hạn
});

let config = (app) => {
  app.use(session({
    key: process.env.SESSION_KEY,
    secret:  process.env.SESSION_SECRET,
    store: sessionStore,
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 //1 ngày seconds
    }
  }));
};

module.exports = {
  config: config,
  sessionStore: sessionStore
};