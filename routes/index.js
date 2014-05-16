/*
 * GET home page.
 */
var Travis = require('travis-ci');
var mongoose = require('mongoose');
var Todo = mongoose.model('Todo');
/*
exports.create = function(req, res) {
	new Todo({
		content: req.body.content,
		updated_at: Date.now()
	}).save(function(err, todo, count) {
		res.redirect('/');
	});
};

exports.destroy = function(req, res) {
	Todo.findById(req.params.id, function(err, todo) {
		todo.remove(function(err, todo) {
			res.redirect('/');
		});
	});
};

exports.update = function ( req, res ){
  Todo.findById( req.params.id, function ( err, todo ){
    todo.content    = req.body.content;
    todo.updated_at = Date.now();
    todo.save( function ( err, todo, count ){
      res.redirect( '/' );
    });
  });
};

exports.edit = function ( req, res ){
  Todo.
    find().
    sort( '-updated_at' ).
    exec( function ( err, todos ){
      res.render( 'edit', {
          title   : 'Express Todo Example',
          todos   : todos,
          current : req.params.id
      });
    });
};*/

exports.repo = function ( req, res ){
	res.render('repo/index', {
		title: req.params.id,
		id: req.params.id,
		login: false,
	});
};

exports.people = function ( req, res ){
	res.render('people/index', {
		title: req.params.id,
		id: req.params.id,
		login: false,
	});
};

exports.login = function ( req, res ){
	res.render('login/login', {
		title: req.params.id,
		id: req.params.id,
		login: false,
	});
};

exports.create = function ( req, res ){
	res.render('login/create-account', {
		title: req.params.id,
		id: req.params.id,
		login: false,
	});
};

exports.index = function ( req, res ){
  Todo.
    find().
    sort( '-updated_at' ).
    exec( function ( err, todos ){
      res.render( 'index', {
          title : 'Home',
          login: false,
          todos : todos
      });
    });
};

var func3 = function(req, res, callback) {
	for (var i in res.builds) {
		for (var j in res.builds[i].job_ids) {
			console.log(res.builds[i].job_ids[j]);
			travis.jobs({
				id: res.builds[i].job_ids[j]
			}, function(err, res) {
				console.log(res);
			});
		}
	}
}

exports.search = function(req, response) {
	var travis = new Travis({
		version: '2.0.0'
	});
	travis.repos.builds({
		owner_name: 'mozilla-b2g',
		name: 'gaia'
	}, function(err, res) {
		console.log(res);
		response.render('search/index', {
			title: 'Search Page',
			table_title: 'mozilla-b2g/gaia',
			builds: res.builds
		});
	});
	// res.redirect( '/' );
};

exports.job = function(req, response) {
	var travis = new Travis({
		version: '2.0.0'
	});
	console.log(req.params.id);
	travis.jobs.log({
		job_id: req.params.id
	}, function(err, res) {
		response.render('job/index', {
			title: 'Search Page',
			table_title: 'mozilla-b2g/gaia',
			log_txt: res
		});
	});
	// res.redirect( '/' );
};