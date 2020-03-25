import passportSocketIo from 'passport.socketio';

let configSocketIo = (io, cookieParser, sessionStore) => {
  io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: process.env.SESSION_KEY,
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    success: (data, accept) => {
      if (!data.user.logged_in) {
        return accept("Không tồn tại người dùng", false);
      }
      return accept(null, true);
    },
    fail: (data, message, error, accept) => {
      if (error) {
        console.log("Không thể kết nối", message);
        return accept(new Error(message), false)
      }
    }
  }));
};

module.exports = configSocketIo;