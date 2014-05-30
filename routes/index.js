/*
 * GET home page.
 */
var Travis = require('travis-ci');

// database
var mongoose = require('mongoose');

var Counter = mongoose.model('Counter'),
	Repo = mongoose.model('Repo'),
	RepoUpdate = mongoose.model('RepoUpdate'),
	RepoBuild = mongoose.model('RepoBuild'),
	Author = mongoose.model('Author'),
	Committer = mongoose.model('Committer'),
	Commit = mongoose.model('Commit'),
	Build = mongoose.model('Build'),
	BuildJob = mongoose.model('BuildJob');

// router
exports.repoHome = function(req, res) {
	res.render('repo/index', {
		title: 'Repo',
		user: req.user
	});
};

exports.repoPage = function(req, res) {
	var ownerName = req.params.owner;
	var repoName = req.params.repo;
	Repo.findOne({
		owner_name: ownerName,
		repo_name: repoName
	}, function(err, repo) {
		if (!repo) return;
		RepoBuild.find({
			repo_id: repo.id
		}, function(err, repobuild) {
			var cond = [];
			var or_cond = {
				$or: cond
			};
			for (var i in repobuild) {
				cond.push({
					build_id: repobuild[i].build_id
				});
			}
			Build.find(or_cond).sort({
				finished_at: -1
			}).
			exec(function(err, builds) {
				var states = {
					'passed': 0,
					'failed': 0,
					'canceled': 0
				};
				for (var i in builds) {
					states[builds[i].state]++;
				}
				res.render('repo/repo', {
					title: 'Repo',
					ownerName: req.params.owner,
					repoName: req.params.repo,
					user: req.user,
					build_table: builds,
					build_state: states
				});
			});
		});
	});
};

exports.people = function(req, res) {
	res.render('people/index', {
		title: req.params.id,
		id: req.params.id,
		user: req.user
	});
};

exports.login = function(req, res) {
	res.render('login/login', {
		title: req.params.id,
		user: req.user
	});
};

exports.create = function(req, res) {
	res.render('login/create-account', {
		title: 'Create Account',
		user: req.user
	});
};

exports.index = function(req, res) {
	res.render('index', {
		title: 'Home',
		user: req.user
	});
};

exports.searchRepo = function(req, res) {
	res.render('repo/search/index', {
		title: 'Home',
		user: req.user
	});
};

// datebase process
// var func3 = function(req, res, callback) {
// 	for (var i in res.builds) {
// 		for (var j in res.builds[i].job_ids) {
// 			console.log(res.builds[i].job_ids[j]);
// 			travis.jobs({
// 				id: res.builds[i].job_ids[j]
// 			}, function(err, res) {
// 				console.log(res);
// 			});
// 		}
// 	}
// }

function updateJob(build) {
	var jobs = build.job_ids;
	for (var i in jobs) {
		var jobid = jobs[i];
		var buildjob = new BuildJob({
			build_id: build.id,
			job_id: jobid
		});
		buildjob.save();
	}
}

function insertBuild(repo_id, repoupdate, builds) {
	var date = new Date(repoupdate.updated_at);
	if (date.getTime() + 1000 * 60 * 60 < Date.now()) { // 1 hours update.
		RepoBuild.remove({ // increase
			repo_id: repo_id
		}).exec(function() {
			var repobuild = new RepoBuild({
				repo_id: repo_id,
				update_at: Date.now
			});
			repobuild.save();
		});
		for (var i in builds) {
			var b = builds[i];
			if (b.finished_at <= date)
				continue;
			var elem = new Build({
				id: b.id,
				repository_id: b.repository_id,
				commit_id: b.commit_id,
				number: b.number,
				pull_request: b.pull_request,
				pull_request_title: b.pull_request_title,
				pull_request_number: b.pull_request_number,
				state: b.state,
				started_at: new Date(b.started_at),
				finished_at: new Date(b.finished_at),
				duration: b.duration
			});
			elem.save(function(err, build, numberAffected) {
				var repobuild = new RepoBuild({
					repo_id: repo_id,
					build_id: b.id
				});
				repobuild.save(function() {
					updateJob(b);
				});
			});
		}
	}
}
/*
 * if this repo not found, add new row in repo
 */
function preInsertBuilds(repo_id, builds) {
	RepoUpdate.findOne({
		repo_id: repo_id
	}, function(err, repoupdate) {
		if (repoupdate) {
			insertBuild(repo_id, repoupdate, builds);
		}
	});
}
/*
 * if this repo not found, add new row in repo
 */
function updateBuilds(owner_name, repo_name, builds) {
	console.log("enter updateBuilds");
	Repo.count({
		owner_name: owner_name,
		repo_name: repo_name
	}, function(err, C) {
		console.log("count " + C);
		if (err) { // NOT FOUND
			console.log("NOT FOUND " + err);
			return;
		} else if (C == 0) {
			Counter.findOne({
				_id: 'Repo'
			}, function(err, cnt) {
				var repoid = cnt.seq + 1;

				Counter.remove({ // increase
					_id: 'Repo'
				}).exec(function() {
					var cnt = new Counter({
						_id: 'Repo',
						seq: repoid
					});
					cnt.save();
				});

				var repo = new Repo({
					id: repoid,
					owner_name: owner_name,
					repo_name: repo_name
				});
				repo.save(function() {
					var repoupdate = new RepoUpdate({
						repo_id: repoid,
						updated_at: new Date(0)
					});
					repoupdate.save(function() {
						preInsertBuilds(repoid, builds);
					});
				}); // add a new repo.
			});
		} else {
			Repo.findOne({
				owner_name: owner_name,
				repo_name: repo_name
			}, function(err, repo) {
				preInsertBuilds(repo.id, builds);
			});
		}
	});
}

exports.search = function(req, response) {
	var travis = new Travis({
		version: '2.0.0'
	});
	travis.repos.builds({
		owner_name: 'mozilla-b2g',
		name: 'gaia'
	}, function(err, res) {
		updateBuilds('mozilla-b2g', 'gaia', res.builds);
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
		console.log(res);
		response.render('job/index', {
			title: 'Search Page',
			table_title: 'mozilla-b2g/gaia',
			log_txt: res
		});
	});
	// res.redirect( '/' );
};