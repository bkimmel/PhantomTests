exports.name = 'catalog_german_s5_cd';

exports.startsAt = 'http://www.rosettastone.com/learn-german/';

exports.pageSteps = [function() {

	var price = parseInt( $('#downloadList .product-item:eq(0) .list-price').text().match(/\d+/), 10);
    window.callPhantom({'lpprice': price});
	window.callPhantom('screenshot_precart');
	
	setTimeout(function() {
		$('#downloadButton').click();
	}, 2000);
	
}, function() {

	function evalurl() {
	  window.callPhantom('screenshot_cart');
	  window.callPhantom({pathname: window.location.pathname});
	  var cartprice = parseInt( jQuery('.cart-price:eq(0) p:eq(1)').html().match(/\d+/), 10);
	  window.callPhantom({"cartprice": cartprice});
	  window.callPhantom({"endurl": window.location.href});
	  window.callPhantom('done');
	}
	setTimeout(evalurl, 3000);
	
}];

exports.expects = function(results) {
	var res = [];
	res.push({
		'Has the right location (us_en_store_view/checkout/cart)': !!( results.pathname.match(/\/us_en_store_view\/checkout\/cart/gi))  
	});
	res.push({
		'Landing page price matches cart price': !!(results.lpprice === results.cartprice)
	});
	res.push({
		'Price': results.cartprice
	});
	return res;
}