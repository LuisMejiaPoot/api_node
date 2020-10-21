const mongoose = require("mongoose");
require('dotenv').config()
const connectDB = async () => {
  const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.fifgo.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority
`;
  const option = { useNewUrlParser: true, useUnifiedTopology: true };
  mongoose
    .connect(uri, option)
    .then(() => console.log("Base de datos conectada"))
    .catch((e) => console.log("error db:", e));
};

module.exports =connectDB;
