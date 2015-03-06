console.log('Visor started...');
console.log('in: ' + process.cwd());
console.log('with: ' + process.argv.slice(2));

var async = require('async');
var connect = require('connect');
var _ = require('lodash');
var fs = require('fs');
var events = require('events');
var path = require('path');

var sep = path.sep;
var httpevents = new events.EventEmitter();

//getresults: traverses pth and calls back 'cb' with result.json paths in inarr
//usage:
//getresults(process.cwd(), function(r){ console.log('DONE'); console.log(r); });
function getresults(pth, cb, inarr) {
	inarr = inarr || [];
	//readdir
	fs.readdir(pth, function readdirs(err, files){
	  //console.log('READING FILES IN: ' + pth);
	  //console.log(files);
	  var filechain = _.map(files, function(filename,i){
		var fpath = pth + sep + filename;
		return function filecb(fcb, prev) {
			//console.log('FILECB:');
			//console.log(fcb);
			fs.stat(fpath, function(err,stat){
				if(stat.isDirectory() && filename != 'node_modules') {
					return getresults(fpath, fcb, inarr);
				}
				if(filename == 'result.json') {
					prev.push(fpath);
				}
				return fcb(prev);
			});
		} 
	  });
	  //console.log('FILECHAIN SET:');
	  //filechain.reduce(function(c,v){ c.push( v.bind(this, c.slice(-1)) ); },[cb]);
	  var functionlinkedlist = _.reduce(filechain, function(c,v){
		var chainfunction = v.bind(this, c.slice(-1)[0]);
		c.push(chainfunction);
		return c;
	  }, [cb]);
	  //=> functionlinkedlist is a set of daisychained callbacks triggered from the end.
	  //=> [cb,fa(cb),fb(fa),fc(fb)]
	  //a.slice(-1)([]);
	  
	  functionlinkedlist.slice(-1).pop()(inarr);
	});
}





httpevents.on('request', function(req, res){
	console.log('request');
	console.log(req.url);
	if (req.url == '/') {
		var wfgetfiles = function(acb){ getresults(process.cwd(), function(r){ acb(null, r) }); };
		var wfparsefiles = function(fpaths, acb){
			async.map(fpaths, function(arg, cb){
				//console.log('READING:' + arg);
				fs.readFile(arg, 'utf-8', function(err, readres){
					//console.log('READRESULTS:');
					//console.log(readres);
					try {
						var resarray = JSON.parse(readres);
						resarray.unshift({'TEST': arg});
						cb(null, resarray);
					}
					catch(e) {
						cb('error parsing: ' + arg);
					}
				});
				
			}, function(maperr, mapres){
				//console.log('MAPRESULTS:');
				//console.log(mapres);
				acb(null, mapres);
			});
		};
		
		res.writeHead(200);
		res.write('<h1>TEST RESULTS:</h1>');
		var total = 0;
		var passing = 0;
		
		async.waterfall([wfgetfiles, wfparsefiles], function(wferr, wfres){
			console.log(wfres);
			_.each(wfres, function(testresults,i){
				
				_.each(testresults, function(v){
					var ks = Object.keys(v);
					var fails = !ks.length || !v[ks[0]];
					total++;
					passing += !fails;
					//style="color: ' + !!fails ? 'red' : 'green'  + '"
					res.write('<h3 style="color: ' + ( !!fails ? 'red' : 'green' ) + '">' + (v.TEST ? '' : '--') +  JSON.stringify(v) + '</h3>');
				});
				
				(i == wfres.length - 1) && (function(){
					res.write('<h2>PASSING:</h2>' + '<h3>' + passing + ' of ' + total + '</h3>');
					res.end();
				})(); 
			});
		});
		
	}
	else {
		res.writeHead(400, 'bad request')
		res.end('');
	}
});


var server = connect()
 .use(function(req, res, next) {
	httpevents.emit("request", req, res);
 });
 
server.listen(3000);
console.log('Listening on port 3000.');
