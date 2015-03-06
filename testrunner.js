//get test.js files => *tests
//for *tests => *testfile
	//run fixture(*testfile)
	
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
	
var args = Array.prototype.slice.call(process.argv);
var argpath = ( (args.length > 2) && args.pop() ) || process.cwd();

function runtests(argpath) {	
	//traverse directory & find test.js => *teststorun
	var teststorun = (function gettemplates(pth) {
		var _templates = [];
		var _files = fs.readdirSync(pth);
		var _toprocess = _.groupBy(_files, function(v){
			if(v == 'test.js') {
				return 'template';
			}
			return fs.statSync(pth + sep + v).isDirectory() ? 'dir' : 'file';
		});
		!!_toprocess.template && _templates.push(pth + sep + _toprocess.template[0]);
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
}

runtests(argpath);

