import {validationResult} from "express-validator/check";
let getLoginRegister = (req, res) => {
  return res.render("auth/master")
};

let postRegister = (req, res) => {
  let errorArr = [];

  let vadidationErrors=validationResult(req)
  if(!vadidationErrors.isEmpty()){
    let errors = Object.values(validationResult(req).mapped());
    errors.forEach(item=>{
      errorArr.push(item.msg)
    });

    console.log(errorArr);
    return;
  } 
  console.log(req.body)
}
module.exports = {
  getLoginRegister: getLoginRegister,
  postRegister: postRegister
};