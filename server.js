require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const connectMongo = require("./model/mongo.config");
const cors = require("cors");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

app.use("/api/v1", require("./routes/auth"));
app.use("/api/v1", require("./routes/users.route"));
app.use("/api/v1", require("./routes/posts.route"));
app.use("/api/v1", require("./routes/comments.route"));

app.listen(process.env.PORT, async () => {
    await connectMongo();
    console.log("App is listening on Port " + process.env.PORT);
});

