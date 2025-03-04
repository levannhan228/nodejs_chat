import { validationResult } from "express-validator/check";
import { auth } from './../services/index';
import { transSuccess } from './../../lang/vi'
let getLoginRegister = async (req, res) => {
  return res.render("auth/master", {
    errors: req.flash("errors"),
    success: req.flash("success")
  })
};

let postRegister = async (req, res) => {
  let errorArr = [];
  let successArr = [];
  let vadidationErrors = validationResult(req)
  if (!vadidationErrors.isEmpty()) {
    let errors = Object.values(validationResult(req).mapped());
    errors.forEach(item => {
      errorArr.push(item.msg)
    });
    req.flash("errors", errorArr);
    return res.redirect("/login-register");
  }
  try {
    let createUserSuccsess = await auth.register(req.body.email, req.body.gender, req.body.password, req.protocol, req.get("host"));

    successArr.push(createUserSuccsess);
    req.flash("success", successArr);
    return res.redirect("/login-register");
  }
  catch (error) {
    errorArr.push(error);
    req.flash("errors", errorArr);
    return res.redirect("/login-register");
  }
};

let verifyAccount = async (req, res) => {
  let errorArr = [];
  let successArr = [];
  try {
    let verifyStatus = await auth.verifyAccount(req.params.token);
    successArr.push(verifyStatus);
    req.flash("success", successArr);
    return res.redirect("/login-register");
  } catch (error) {
    errorArr.push(error);
    req.flash("errors", errorArr);
    return res.redirect("/login-register");
  }
};

let getLogout = (req, res) => {
  req.logout();//delete session
  req.flash("success", transSuccess.logout_success);
  return res.redirect("/login-register");
}

let checkLoggedIn = (req, res, next) => {
  if(!req.isAuthenticated()){
    return res.redirect("/login-register");
  }
  next();
};

let checkLoggedOut = (req, res, next) => {
  if(req.isAuthenticated()){
    return res.redirect("/");
  }
  next();
};
module.exports = {
  getLoginRegister: getLoginRegister,
  postRegister: postRegister,
  verifyAccount: verifyAccount,
  getLogout: getLogout,
  checkLoggedIn: checkLoggedIn,
  checkLoggedOut: checkLoggedOut
};