var express = require("express");
var app=express();
var hostname="localhost";
var port=3000;
app.get("/helloworld",(req,res)=>{
    res.send("<h1>xin chao</h1>");
});

app.listen(port,hostname,()=>{
    console.log(`hello nhan, i'm running at ${hostname}:${port}`)
});