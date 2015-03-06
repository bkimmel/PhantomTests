//PhantomJS ver: 1.9+
//http://phantomjs.org/download.html
//Call With: phantomjs --ssl-protocol=any fixture.js "C:\*moduledirectory*"
//*Important: leaving out ssl-protocol=any will cause the phantom page not to navigate to https (the cart) 
var page = require('webpage').create();
var starttime = Date.now();
var fs = require('fs');
var system = require('system');

function changewd(_args) {
	//console.log(JSON.stringify(_args));
	var modpath = Array.prototype.slice.call(_args);
	if( !fs.isDirectory(modpath.slice(-1)) ) {
		console.error('Invalid Directory.  Usage: phantomjs --options *thisfile*.js *moduledirectory*');
		phantom.exit();
	}
	fs.changeWorkingDirectory( modpath.slice(-1) );
}
//console.log( fs.workingDirectory ); //=> phantomdir
changewd(phantom.args || require('system').args);

function gettestmodule() {
	if( !fs.exists('./test.js') ) {
		console.error('Test fixture expects "test.js" in module directory.');
		phantom.exit();
	}
	var absmod = fs.absolute( './test.js' );
	var testmod = require( absmod );
	if(!testmod) {
		console.error('Test module must export from "test.js".');
		phantom.exit();
	}
	if(!testmod.expects || typeof testmod.expects != 'function' ) {
		console.error('Test module must export "expects" as a function.');
		phantom.exit();
	}
	if(!testmod.startsAt || typeof testmod.startsAt != 'string') {
		console.error('Test module must export "startsAt" as a url string.');
		phantom.exit();
	}
	if( !Array.prototype.isPrototypeOf(testmod.pageSteps) ) {
		console.error('Test module must export "pageSteps" as an array.');
		phantom.exit();
	}
	if(testmod.pageSteps.filter(function(v){ return typeof v == 'function'; }).length != testmod.pageSteps.length) {
		console.error('Every member of the pageSteps array must be a function.');
		phantom.exit();
	}
	
	return testmod;
}


//Read the test module:
var testmodule = gettestmodule();
var steps = testmodule.pageSteps;
var startsat = testmodule.startsAt;
var expects = testmodule.expects;
var setviewport = testmodule.viewport;

var stdres = {starturl: startsat};

function done() {
	console.log('DONE:');
	system.stdout.write(JSON.stringify(stdres));
	console.log('EXPECTS:');
	
	var results = expects(stdres);
	results.push( {time: Date.now().toString()} );
	results.push( {date: (new Date()).toString() } );
	console.log( JSON.stringify(results, null, 2) );
	fs.write('result.json', JSON.stringify(results, null, 2), 'w');
	//system.stdout.write(JSON.stringify(expects(stdres)));
    phantom.exit();
}

function processurl(status) {
	console.log('PROCESS:');
	if(status !== 'success') {
		stdres = {error: 'Page failed to load (status other than "success")'};
		done();
	}
	
	var timo;
	
	page.onNavigationRequested = function(url, type, willNavigate, main) {
		console.log('Trying to navigate to: ' + url);
		console.log('Caused by: ' + type);
		console.log('Will actually navigate: ' + willNavigate);
		console.log("Sent from the page's main frame: " + main);
		
		if(!!main) {
			if(!!timo) {
				clearTimeout(timo);
				timo = null;
			}
			timo = setTimeout(function() {
				console.log('NAV TIMER:');
				nextstep();
			}, 10000);
		}
	};
	
	// page.onUrlChanged = function(targetUrl) {
	  // console.log('NAV TO: ' + targetUrl);
	  // // if(!!timo) {
			// // clearTimeout(timo);
			// // timo = null;
		// // }
		// // timo = setTimeout(function() {
			// // console.log('NAV TIMER:');
			// // nextstep();
		// // }, 10000);
	  
	// };
	
	//console.log(typeof steps[0]);
	setTimeout(function(){
		page.evaluateAsync(steps[0]);
		steps.shift();
		setTimeout(done, 60000);
	}, 0)
}

function nextstep() {
    console.log('NEXT:');
	var nxt = steps[0];
	steps.shift();
	if (typeof nxt == 'function') {
		var res = page.evaluateAsync(nxt);
	}
	if (!!steps.length) {
	  setTimeout(done, 5000);
	}
}

page.onCallback = function(data) {
	console.log('CALLBACK:' + data);
	if (data == 'next') {
		setTimeout(nextstep, 1000);
		return true;
	}
	if (data == 'done') {
		setTimeout(done, 1000);
		return true;
	}
	if (typeof data == 'string' && data.match(/screenshot/gi) ) {
		page.render(data + '.jpg');
		return true;
	}
	if (typeof data == 'object' && data.navto) {
		console.log('NAVTO:' + data.navto);
		page.open(data.navto, function() {
			setTimeout(nextstep, 10000);
		});
		return true;
	}
	if (typeof data == 'object') {
		Object.keys(data).forEach(function(v){ stdres[v] = data[v]; });
		console.log(JSON.stringify(stdres));
		return true;
	}
};

function openpage() {
  page.open(startsat, processurl);
}

phantom.clearCookies();
page.viewportSize = !!setviewport ? setviewport : {width: 1280, height: 720};
openpage();