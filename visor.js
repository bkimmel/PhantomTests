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

function getresults(pth, cb, inarr) {
	//readdir
	fs.readdir(pth, function readdirs(err, files){
	  console.log('READING FILES IN: ' + pth);
	  console.log(files);
	  var filechain = _.map(files, function(filename,i){
		var fpath = pth + sep + filename;
		return function filecb(fcb, prev) {
			console.log('FILECB:');
			console.log(fcb);
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
	  console.log('FILECHAIN SET:');
	  //filechain.reduce(function(c,v){ c.push( v.bind(this, c.slice(-1)) ); },[cb]);
	  var functionlinkedlist = _.reduce(filechain, function(c,v){
		var chainfunction = v.bind(this, c.slice(-1)[0]);
		c.push(chainfunction);
		return c;
	  }, [cb]);
	  console.log('FUNCTION LL SET:');
	  //=> [cb,fa(cb),fb(fa),fc(fb)]
	  //a.slice(-1)([]);
	  
	  functionlinkedlist.slice(-1).pop()(inarr);
	});
}

getresults(process.cwd(), function(r){ console.log('DONE'); console.log(r); }, []);

// function spitresults(pth, em) {
	// console.log('TOPLEVEL PATH:');
	// console.log(pth);
	// fs.readdir(pth, function readdirs(err, files){
		// em.emit('raise', files.length);
		// _.each(files, function(v, idx, arr) {
			
			// console.log('FILE ENTRY:');
			// console.log(v);
			// //if it's results, parse it and emit.
			// if(v == 'result.json') {
				// console.log('emitting results for' + pth + sep + v);
				// fs.readFile(pth + sep + v, "utf-8", function(err, res){
					// var toemit = {"Error - could not be read.": 0};
					// try {
						// toemit = JSON.parse(res);
					// }
					// catch (e){
						
					// }
					// !!em.emit && em.emit('result', toemit);
				// });
				// return;
			// }
			
			// else {
				// fs.stat(pth + sep + v, function(err, st){
					// if (!!err) {
						// console.log('Error:' + err);
						// console.log(v + '');
						// return;
					// }
					// console.log('stat:' + v);
					// if(st.isDirectory() && v != 'node_modules') {
						// console.log('traversing ' + pth + sep + v);
						// spitresults(pth + sep + v, em);
					// }
				// });
				// em.emit('lower');
			// }
		// });
	// });
// }

// var resultevents = new events.EventEmitter();
// var ct = 0;
// resultevents.on('result', function(res){
	// console.log('RESULT');
	// console.log(res);
	// console.log('lower:');
	// console.log(ct--);
// });
// resultevents.on('raise', function(n){
	// console.log('raise:');
	// console.log(ct += n);
// });
// resultevents.on('lower', function(){
	// console.log('lower:');
	// console.log(ct--);
	// if(ct <= 0) {
		// console.log('DONE');
	// }
// });

// spitresults(process.cwd(), resultevents);

// httpevents.on('request', function(req, res){
	// console.log('request');
	// var resultevents = new events.EventEmitter();
	// resultevents.on('result', function reportresult(jsn){
		// console.log('RESULT');
		// console.log(jsn);
	// });
	
// });


// var server = connect()
 // .use(function(req, res, next) {
	// httpevents.emit("request", req, res);
 // });
 
// server.listen(3000);
// console.log('Listening on port 3000.');


// //the var where the results are stored.
// var results = {};



// //builds a tree, through which the results will be counted and exposed to the web.
// function buildresultstree(_folderpath, cb) {
	// results_sem = true;
	// var openthreads = 0;
	// //push results.txt to results.

	// function done() {
		// openthreads--;
		// if(openthreads == 0) {
			// cb(null);
		// }
	// }
	// //for each folder in directory:
	// fs.readdir(_folderpath, function readdirs(err, files){
		// //openthreads++
		// openthreads++;
		
		// _.each(files, function(v){
			// console.log(v);
			// fs.stat(v, function(err, st){
				// console.log(v);
				// console.log(st.isDirectory());
			// });
			
			
		// });
	// });
	  
	  
// }

//buildresultstree(process.cwd(), function(){});

