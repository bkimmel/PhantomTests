//Test Module Generator:
//setup: npm install
//usage: node *this* *pages.json path* [*directory_to_process*]
console.log('Test Generator Started...');

var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var sep = path.sep; 
var args = Array.prototype.slice.call(process.argv);
var argpath = ( (args.length > 3) && args.pop() ) || process.cwd();
//console.log(argpath);
//argpath: the directory we want to process

var pagespath = args.pop();

console.log('PAGESPATH: ' + pagespath);
console.log('STARTPATH: ' + argpath);

//traverse directory & find template.txt => *templates
var templates = (function gettemplates(pth) {
	var _templates = [];
	var _files = fs.readdirSync(pth);
	var _toprocess = _.groupBy(_files, function(v){
		if(v == 'template.txt') {
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

//console.log('TEMPLATES:');
//console.log(templates);

//get active RSI store => *rsistore
var rsistore = (function getrsistore(pth) {
	var rsijson = fs.readFileSync(pth);
	try {
		rsijson = JSON.parse(rsijson);
	}
	catch(e) {
		rsijson = {};
	}
	return rsijson;
})(pagespath);

//get active RSIs => *rsis
var rsis = (function getrsis(rsiobj) {
	return _.map(rsiobj, function(v,k){
		//add 'name' to the rsi object
		v['name'] = k;
		return v;
	});
})(rsistore);

//console.log( rsis );
//rsis: an array of all the rsi objects read, (with "name" added)

var operateon = _(rsis).map(function(v){
	//console.log('MAP: ' + v);
	return _.map(templates, function(vt){
		return [vt, v];
	});
})
.flatten()
.map(function(v){
	//v: [templatepath, rsiobject]
	//console.log(v[0] + '#' + v[1].name);
	var basepath = v[0].split(path.sep);
	basepath.pop();
	basepath = basepath.join(path.sep);
	return [basepath + sep + v[1].name + sep, _.template(fs.readFileSync(v[0],'utf-8'))(v[1])];
})
.value();

//console.log(operateon[2]);
//operateon: array with [path where the rendered file is to be written, rendered contents of file]

_.each(operateon, function(v){
	//v: [destination, contents]
	try {
		fs.mkdirSync(v[0]);
	}
	catch(e) {
		
	}
	fs.writeFileSync(v[0] + 'test.js', v[1]);
});
		