import express from 'express';
import { home, auth } from './../controllers/index';
import { authValid } from './../validation/index'
let router = express.Router();

let initRouters = (app) => {

  router.get("/", home.getHome);
  router.get("/login-register", auth.getLoginRegister);
  router.post("/register", authValid.register, auth.postRegister);
  // router.get("/logout", auth.getLogout);

  return app.use("/", router);
};

module.exports = initRouters;