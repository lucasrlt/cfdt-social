require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var fileupload = require("express-fileupload");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users.routes");
var postsRouter = require("./routes/posts.routes");
var chatRouter = require("./routes/chat.routes");
const { default: mongo_connect } = require("./mongo");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileupload());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/chats", chatRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  if (err.renderable) {
    // console.error(err.message);
    res.status(err.status || 400).send(err.message);
  } else {
    if (err.status !== 404) console.error(err);
    res.status(err.status || 500).send("Oups! Il y a eu une erreur");
  }
  // res.render("error");
});

mongo_connect();

module.exports = app;
