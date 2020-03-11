import express from 'express';
require('dotenv').config()
import connectDB from './config/connectDB';
import ContactModel from './models/contact.model';
let app = express();

//Connect Database
connectDB();

app.get("/test-database", async (req, res) => {
  try {
    let item = {
      userId: "2323122132",
      contacId: "2312321",
    };
    let contact = await ContactModel.createNew(item)
    res.send(contact);
  } catch (err) {
    console.log(err)
  }
});

app.listen(process.env.APP_PORT, process.env.APP_HOST, () => {
  console.log(`hello nhan, i'm running at ${process.env.APP_HOST}:${process.env.APP_PORT}`)
});
