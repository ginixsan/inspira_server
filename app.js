const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose=require('mongoose');
const index = require('./routes/index');
const cors = require('cors');
const app = express();
app.engine('.html', require('ejs').__express);

// view engine setup
//[path.join(__dirname, 'frontend'), path.join(__dirname, 'frontend/locked'), path.join(__dirname, 'frontend/template'), path.join(__dirname, 'frontend/public')]
app.set('views', [path.join(__dirname, 'views'),path.join(__dirname, 'views/sala'),path.join(__dirname, 'views/profe'),path.join(__dirname, 'views/estudiante')]);
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'html');

app.use(cors());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});
const MONGODB_URL = process.env.MONGODB_URL
mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connnection successful!'));
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
   console.log(err.message);
  // render the error page
  res.status(err.status || 500);
  res.render('error',{error:err});
});

module.exports = app;
