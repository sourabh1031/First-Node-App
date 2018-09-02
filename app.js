const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');
mongoose.connect(config.database);
const db = mongoose.connection;

//connection message
db.once('open',function(){
  console.log('connected to database successfully');
});

//mongo db connection errors
db.on('error',function(err){
  console.log(err);
});

// init app
const app = express();

app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// static resources access
app.use(express.static(path.join(__dirname,'public')));

// importing the article from db
let Article = require('./models/article');

// express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}))

//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//configuration using passport
require('./config/passport')(passport);
// passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*',function(req,res,next){
  res.locals.user = req.user || null;
  next();
})

// define home route
app.get('/',function(req,res){
  // let articles = [
  //   {
  //     title: "This is the first article",
  //     name: "John Doe",
  //   },
  //   {
  //     title: "This is the second article",
  //     name: "Michael Jordan",
  //   },
  //   {
  //     title: "This is the third article",
  //     name: "Jane Doe",
  //   },
  //   {
  //     title: "This is the fourth article",
  //     name: "Ada Lovelace",
  //   }
  // ];
  Article.find({},function(err,articles){
    if(err){
      console.log(err);
    }
    else{
      res.render('index',{
        title: 'Articles will come here',
        articles: articles
      });
    }
  })
});

let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles',articles);
app.use('/users',users);

// start server
app.listen(3000,function(){
  console.log('Server started at port 3000');
});
