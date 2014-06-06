var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/* var Todo = new Schema({
	user_id: String,
	content: String,
	updated_at: Date
});*/

var Counter = new Schema({
	_id: String,
	seq: Number
});

var Repo = new Schema({
	id: Number,
	owner_name: String,
	repo_name: String
});

var RepoUpdate = new Schema({
	repo_id: Number,
	updated_at: {
		type: Date,
		default: Date.now
	}
});

var RepoBuild = new Schema({
	repo_id: Number,
	build_id: Number
});

var Author = new Schema({
	author_id: Number,
	author_name: String,
	author_email: String
});

var Committer = new Schema({
	committer_id: Number,
	committer_name: String,
	committer_email: String
});

var Commit = new Schema({
	id: Number,
	sha: String,
	branch: String,
	message: String,
	committed_at: Date,
	author_id: Number,
	committer_id: Number,
	comare_url: String,
	pull_request_number: Number
});

var Build = new Schema({
	build_id: {type: Number, unique: true},
	repository_id: Number,
	commit_id: Number,
	number: String,
	pull_request: Boolean,
	pull_request_title: String,
	pull_request_number: Number,
	state: String,
	started_at: Date,
	finished_at: Date,
	duration: Number
});

var BuildJob = new Schema({
	build_id: Number,
	job_id: Number
});

var UserTrackRepo = new Schema({
	user_id: String,
	owner_name: String,
	repo_name: String
});

var UserChat = new Schema({
	name: String,
	message: String,
	date: Date
});

mongoose.model('Counter', Counter);
mongoose.model('Repo', Repo);
mongoose.model('RepoUpdate', RepoUpdate);
mongoose.model('RepoBuild', RepoBuild);
mongoose.model('Author', Author);
mongoose.model('Committer', Committer);
mongoose.model('Commit', Commit);
mongoose.model('Build', Build);
mongoose.model('BuildJob', BuildJob);
mongoose.model('UserTrackRepo', UserTrackRepo);
mongoose.model('UserChat', UserChat);

var Counter = mongoose.model('Counter');

var repo = new Counter({
	_id: 'Repo',
	seq: 0
});
var author = new Counter({
	_id: 'Author',
	seq: 0
});
var committer = new Counter({
	_id: 'Committer',
	seq: 0
});
repo.save();
author.save();
committer.save();
// 
mongoose.connect('mongodb://localhost/reporter');