/**
 * Module dependencies.
 */

// mongoose setup
require('./db');

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  user = require('./routes/user'),
  http = require('http'),
  path = require('path'),
  engine = require('ejs-locals');

var passport = require('passport'),
  GoogleStrategy = require('passport-google').Strategy,
  util = require('util');


// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing. However, since this example does not
// have a database of user records, the complete Google profile is serialized
// and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the GoogleStrategy within Passport.
// Strategies in passport require a `validate` function, which accept
// credentials (in this case, an OpenID identifier and profile), and invoke a
// callback with a user object.
passport.use(new GoogleStrategy({
    returnURL: 'http://140.115.205.194:8080/auth/google/return',
    realm: 'http://140.115.205.194:8080/'
  },
  function(identifier, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function() {

      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user. In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));


// Simple route middleware to ensure user is authenticated.
// Use this route middleware on any resource that needs to be protected. If
// the request is authenticated (typically via a persistent login session),
// the request will proceed. Otherwise, the user will be redirected to the
// login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login')
}



var app = express();
var server = http.createServer(app);

app.configure(function() {
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.engine('ejs', engine);
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  //
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'keyboard cat'
  }));
  // Initialize Passport! Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  //
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});


// GET /auth/google
// Use passport.authenticate() as route middleware to authenticate the
// request. The first step in Google authentication will involve redirecting
// the user to google.com. After authenticating, Google will redirect the
// user back to this application at /auth/google/return
app.get('/auth/google',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    res.redirect('/');
  });

// GET /auth/google/return
// Use passport.authenticate() as route middleware to authenticate the
// request. If authentication fails, the user will be redirected back to the
// login page. Otherwise, the primary route function function will be called,
// which, in this example, will redirect the user to the home page.
app.get('/auth/google/return',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// app.get('/', routes.index);

app.get('/', routes.index);
app.get('/index', routes.index);
app.get('/search', routes.search);
app.get('/job/:id', routes.job);
app.get('/repo', routes.repoHome);
app.get('/repo/:owner/:repo', routes.repoPage);
app.get('/srepo', routes.searchRepo);
app.get('/people/:id', routes.people);
app.get('/login', routes.login);
app.get('/create', routes.create);

app.get('/json/stats/e/:owner/:repo', api.stats);
app.get('/json/timeline/repo', api.repoTimeline);

server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});

// chat setting

var io = require('socket.io').listen(server);

// Chatroom

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

io.on('connection', function(socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function(data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function(username) {
    console.log('add usersssssssssssssss');
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function() {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function() {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function() {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});