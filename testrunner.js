//Test Runner
//Usage: node *this* *directory_to_process*
	
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var async = require('async');

var sep = path.sep;	
var args = Array.prototype.slice.call(process.argv);
var argpath = ( (args.length > 2) && args.pop() ) || process.cwd();
var opts = ['--ssl-protocol=any', 'fixture.js'];
var testprocess = spawn.bind(this, 'phantomjs');

function testrun(cb) {
	var pth = this.pth;
	function crossPlatformKill(cp, cb) {
		var isWin = /^win/.test(process.platform);
		if(isWin) {
			var pid = cp.pid;
			var cp = require('child_process');
			cp.exec('taskkill /PID ' + pid + ' /T /F', function (error, stdout, stderr) {
				cb();
			});            
		}
		else {
			cp.kill('SIGINT');
			cb();
		}
	}
	
	console.log('TEST RUNNER STARTING TEST: ' + pth);
	var testing = testprocess(opts.slice(0).concat(pth));
	testing.stdout.on('data', function(d){
		console.log(d.toString());
	});
	testing.on('exit', function(code){
		console.log('PHANTOM EXITS');
		clearTimeout(t);
		crossPlatformKill(testing, cb);
	});
	testing.on('error', function(err){
		console.log('PHANTOM ERROR: ' + err);
		clearTimeout(t);
		crossPlatformKill(testing, cb);
	});
	//Give the Phantom test 60 seconds to run
	var t = setTimeout(function() {
		console.log('TIMEOUT: TEST RUNNER ABORTING TEST');
		crossPlatformKill(testing, cb);
	}, 60000);
}

function runtests(argpath) {	
	//traverse directory & find test.js => *teststorun
	var teststorun = (function gettemplates(pth) {
		var _templates = [];
		var _files = fs.readdirSync(pth);
		var _toprocess = _.groupBy(_files, function(v){
			if(v == 'test.js') {
				return 'test';
			}
			return fs.statSync(pth + sep + v).isDirectory() ? 'dir' : 'other';
		});
		!!_toprocess.test && _templates.push(pth);
		var _toconcat = !!_toprocess.dir && (function(){
			return _.reduce(_toprocess.dir, function(c,v){
				//Array.prototype.concat.apply( c, gettemplates(pth + sep + v) );
				return c.concat( gettemplates(pth + sep + v) );
			},[])
		})();
		_toconcat = _toconcat || [];
		//console.log(_toconcat);
		//return Array.prototype.concat.apply(_templates, _toconcat);
		return _templates.concat(_toconcat);
	})(argpath);
	
	var asynctests = _.map(teststorun, function(v){
		return testrun.bind({"pth": v});
	});
	
	async.series(asynctests, function(res){
		//re-run minutes
		setTimeout(function(){ console.log('TEST LOOP COMPLETE...RESTARTING...'); runtests(argpath); }, 60000 * 1);
	});
	
}

runtests(argpath);

