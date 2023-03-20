require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const DB = require("./model/database");
const cors = require("cors");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

app.use("/api/v1", require("./routes/auth"));
app.use("/api/v1", require("./routes/users.route"));


app.listen(process.env.PORT, () => {
    console.log("App is listening on Port " + process.env.PORT);
});

