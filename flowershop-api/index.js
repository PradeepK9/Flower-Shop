const express = require("express");
const cors = require("cors");
const logger = require("morgan");

const port = 3002;

const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.listen(port, () => {
    console.log(`Flower Shop app listening at http://localhost:${port}`);
});