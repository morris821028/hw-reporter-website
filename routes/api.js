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

exports.stats = function(req, res) {
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
				var dayStatsPassed = {};
				var dayStatsFailed = {};
				var dayStatsCancel = {};
				for (var i in builds) {
					var d = new Date(builds[i].finished_at);
					var dd = d.getDate();
					dayStatsPassed[dd] = 0;
					dayStatsFailed[dd] = 0;
					dayStatsCancel[dd] = 0;
				}
				for (var i in builds) {
					var d = new Date(builds[i].finished_at);
					var dd = d.getDate();
					if (builds[i].state == "passed") {
						dayStatsPassed[dd]++;
					} else if (builds[i].state == "failed") {
						dayStatsFailed[dd]++;
					} else if (builds[i].state == "canceled") {
						dayStatsCancel[dd]++;
					}
				}
				var ret = [];
				for (var key in dayStatsPassed) {
					ret.push({
						timediv: key,
						passed: dayStatsPassed[key],
						failed: dayStatsFailed[key],
						canceled: dayStatsCancel[key]
					});
				}
				res.json(ret);
			});
		});
	});
};

exports.repoTimeline = function(req, res) {
	if(!req.user) {
		res.json({});
		return;
	}
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
				var dayStatsPassed = {};
				var dayStatsFailed = {};
				var dayStatsCancel = {};
				for (var i in builds) {
					var d = new Date(builds[i].finished_at);
					var dd = d.getDate();
					dayStatsPassed[dd] = 0;
					dayStatsFailed[dd] = 0;
					dayStatsCancel[dd] = 0;
				}
				for (var i in builds) {
					var d = new Date(builds[i].finished_at);
					var dd = d.getDate();
					if (builds[i].state == "passed") {
						dayStatsPassed[dd]++;
					} else if (builds[i].state == "failed") {
						dayStatsFailed[dd]++;
					} else if (builds[i].state == "canceled") {
						dayStatsCancel[dd]++;
					}
				}
				var ret = [];
				for (var key in dayStatsPassed) {
					ret.push({
						timediv: key,
						passed: dayStatsPassed[key],
						failed: dayStatsFailed[key],
						canceled: dayStatsCancel[key]
					});
				}
				res.json(ret);
			});
		});
	});
};