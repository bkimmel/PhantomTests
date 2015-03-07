//get test.js files => *tests
//for *tests => *testfile
	//run fixture(*testfile)
	
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
	var t = setTimeout(function() {
		console.log('TIMEOUT: TEST RUNNER ABORTING TEST');
		testing.kill();
		cb();
	}, 30000);
	var pth = this.pth;
	console.log('TEST RUNNER STARTING TEST: ' + pth);
	var testing = testprocess(opts.slice(0).concat(pth));
	testing.stdout.on('data', function(d){
		console.log(d.toString());
	});
	testing.on('exit', function(code){
		console.log('PHANTOM EXITS');
		clearTimeout(t);
		cb(null, 'done')
	});
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
		//re-run every five minutes
		setTimeout(function(){ console.log('TEST LOOP COMPLETE...RESTARTING...'); runtests(argpath); }, 60000 * 5);
	});
	
}

runtests(argpath);

