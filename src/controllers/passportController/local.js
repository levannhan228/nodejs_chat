import passport from 'passport';
import passportLocal from 'passport-local';
import UserModel from './../../models/userModel';
import ChatGroupModel from './../../models/chatGroupModel';
import { transErrors, transSuccess } from './../../../lang/vi';

let LocalStrategy = passportLocal.Strategy;

let initPassportLocal = () => {
  passport.use(new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
  }, async (req, email, password, done) => {
    try {
      let user = await UserModel.findByEmail(email);
      if (!user) {
        return done(null, false, req.flash("errors", transErrors.login_failed));
      }
      if (!user.local.isActive) {
        return done(null, false, req.flash("errors", transErrors.account_not_active));
      }

      let checkPassword = await user.comparePassword(password);
      if (!checkPassword) {
        return done(null, false, req.flash('errors', transErrors.login_failed))
      }
      return done(null, user, req.flash("success", transSuccess.loginSuccess(user.username)));
    } catch (error) {
      console.log(error);
      return done(null, false, req.flash("errors", transErrors.server_error))
    }
  }));

  // lưu id tài khoản vào session
  passport.serializeUser((user, done) => {
    done(null, user._id)
  });

  passport.deserializeUser(async (id, done) => {
    try {
      let user = await UserModel.findUserByIdForSessionToUse(id);
      let getChatGroupIds = await ChatGroupModel.getChatGroupIdsByUser(user._id);

      user = user.toObject();
      user.chatGroupIds = getChatGroupIds;
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  });
};

module.exports = initPassportLocal;