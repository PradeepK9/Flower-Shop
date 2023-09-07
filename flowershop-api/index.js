const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const createError = require("http-errors");

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const flowersRouter = require("./routes/flowers");

const port = 3002;

const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/flowers", flowersRouter.router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
});

app.listen(port, () => {
    console.log(`Flower Shop app listening at http://localhost:${port}`);
});