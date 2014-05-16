/**
 * Module dependencies.
 */

// mongoose setup
require('./db');

var express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  http = require('http'),
  path = require('path'),
  engine = require('ejs-locals'),
  Travis = require('travis-ci');

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  // app.set('view engine', 'jade');
  app.engine('ejs', engine);
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

// app.get('/', routes.index);
app.get('/', routes.index);
app.get('/index', routes.index);
app.post('/search', routes.search);
app.get('/job/:id', routes.job);
app.get('/repo/:id', routes.repo);
app.get('/people/:id', routes.people);
app.get('/login', routes.login);
app.get('/create', routes.create);

app.get('/users', user.list);
/*
app.post('/create', routes.create);
app.get('/destroy/:id', routes.destroy);
app.get('/edit/:id', routes.edit);
app.post('/update/:id', routes.update);*/

http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});