//PhantomJS ver: 1.9+
//http://phantomjs.org/download.html
//Call With: phamtomjs --ssl-protocol=any visor.js *url* *evalmodule* 
var page = require('webpage').create();
var starttime = Date.now();
var fs = require('fs');
var system = require('system');


//Read the test module:
var testmodule = require('./mymod.js');
var steps = testmodule.pageSteps;
var startsat = testmodule.startsAt;
var expects = testmodule.expects;

var stdres = {starturl: startsat};

function done() {
	console.log('DONE:');
	system.stdout.write(JSON.stringify(stdres));
	console.log('EXPECTS:');
	console.log( expects(stdres) );
	system.stdout.write(JSON.stringify(expects(stdres)));
    phantom.exit();
}

function processurl(status) {
	console.log('PROCESS:');
	if(status !== 'success') {
		stdres = {error: 'Page failed to load (status other than "success")'};
		return done();
	}
	
	var timo;
	page.onUrlChanged = function(targetUrl) {
	  console.log('NAV TO: ' + targetUrl);
	  if(!!timo) {
		clearTimeout(timo);
		timo = null;
	  }
	  timo = setTimeout(function() {
		console.log('NAV TIMER:');
		nextstep();
	  }, 5000);
	};
	
	//console.log(typeof steps[0]);
	page.evaluateAsync(steps[0]);
	steps.shift();
	
	setTimeout(done, 30000);
}

function nextstep() {
    console.log('NEXT:');
	var nxt = steps[0];
	steps.shift();
	if (typeof nxt == 'function') {
		var res = page.evaluateAsync(nxt);
	}
	if (!!steps.length) {
	  setTimeout(done, 10000);
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
page.viewportSize = {width: 1280, height: 720};
openpage();

// page.onUrlChanged = function(targetUrl) {
  // console.log('New URL: ' + targetUrl);
// };

// page.onLoadFinished = function(status) {
  // console.log('Status: ' + status);
  // console.log('URL: ' + page.url);
// };


// function _processurl(status){
	// if(status !== 'success') {
		// console.log('Failed to load');
	// }
	// else {
		// /*
		// //2day
		// page.evaluate(function(){
			// jQuery('#thecart .shoplinks .linkone a').click();
			// jQuery('#coupon_code').attr('value', 'FREE2DAY');
			// jQuery('#discountsubmit').click();
		// });
		// */
		
		// /*
		// //books
		// page.open('https://secure.rosettastone.com/us_en_store_view/checkout/cart/add/sku/40261/category_id/ESP/?pc=espbook');
		// */
		
		// //tenoff
		// var wasprice = page.evaluate(function(){
			// return parseInt(jQuery('.cart-price p:eq(1)').text().match(/\d+/));
		// });
		
		// page.evaluate(function(){
			// jQuery('#thecart .shoplinks .linkone a').click();
			// jQuery('#coupon_code').attr('value', 'extra10');
			// jQuery('#discountsubmit').click();
			
		// });
		
		// console.log('Loaded in: ' + ( Date.now() - starttime ) + 'ms');
		// //phantom.exit();
		// setTimeout(function(){
				
			// /*
			// //2day
			// var goodload = page.evaluate(function(){
				// //return !!jQuery('#address-payment-summary.freeshipping strong:eq(1)').text().match(/2.day/gi);
			// });
			// */
			
			// /*
			// //books
			// var goodload = page.evaluate(function(){
				// return !!jQuery('.prodname').filter(function(i, v){ return v.innerHTML.match(/Spanish Phrase and Grammar/gi) }).length;
			// });
			// */
			
			// //tenoff
			// var isprice = page.evaluate(function(){
				// return parseInt(jQuery('.cart-price p:eq(1)').text().match(/\d+/));
			// });
			
			// console.log('PRICES:\n\t');
			// console.log(wasprice);
			// console.log(isprice);
			// var goodload = ( wasprice - isprice === 10 );

			// var folderset = Date.now().toString();
			// folderset = !goodload ? '_error_' + folderset : folderset;
			// console.log('folderset:\n\t' + folderset);
			// fs.makeDirectory('results' + fs.separator + folderset);
			// page.render('results' + fs.separator + folderset + fs.separator + 'screenshot.jpg');
			// fs.write('results' + fs.separator + folderset + fs.separator + 'cookies.txt', JSON.stringify(page.cookies), 'w');
			// fs.write('results' + fs.separator + folderset + fs.separator + 'resources.txt', JSON.stringify(reqLog), 'w');
			
			// console.log('page processed...');
			// if(_count >= 0) {
				// _count--;
				// phantom.clearCookies();
				// reqLog = {};
				// setTimeout(openpage, 15000);
			// }
			// else {
				// console.log('exiting');
				// phantom.exit();
			// }
		// },19000);
	// }
// }

// function openpage() {
  // starttime = Date.now();
  // //page.open('https://secure.rosettastone.com/us_en_store_view/checkout/cart/add/sku/27875/category_id/esp/?pc=bestoffer_S5', _processurl);
  // //https://secure.rosettastone.com/us_en_store_view/checkout/cart/add/sku/97337/category_id/esp
  // page.open('https://secure.rosettastone.com/us_en_store_view/checkout/cart/add/sku/97337/category_id/esp', _processurl);
// }

//openpage();