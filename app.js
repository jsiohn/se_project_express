const express = require("express");
const mongoose = require("mongoose");
const mainRouter = require("./routes/index");

const app = express();
const { PORT = 3001 } = process.env;

app.use(express.json());
app.use((req, res, next) => {
  req.user = {
    _id: "67014711f67f1052251402ad",
  };
  next();
});
app.use("/", mainRouter);

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to Database");
  })
  .catch(console.error);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
