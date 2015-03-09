var testvars = {
	lang: "German",
	level: /Level[s]*\s*[1-]*5/i,
	delivery: /Download/i,
	lp: "sbs"
}
exports.name = 'sbs_' + testvars.lang + '_s5_cd';
exports.startsAt = 'http://www.rosettastone.com/lp/sbs/sitewide/';
exports.pageSteps = [function() {

    jQuery('#deu').trigger('click');
	window.callPhantom({"triggeredclick": "#deu"});
	setTimeout(function(){
		var price = parseInt( jQuery('.lineitem.DOWNLOAD_S5').find('.finalprice').text().match(/\d+/), 10 );
		window.callPhantom({'lpprice': price});
		//window.callPhantom('screenshot_precart');
		var navto = jQuery('.lineitem.DOWNLOAD_S5').parents('.pricing').find('.basketbutton').attr('href');
		window.callPhantom({"carturl": navto});
		window.location = navto;
	}, 2000);
	
}, function() {
	function evalurl() {
	  window.callPhantom('screenshot_cart');
	  window.callPhantom({pathname: window.location.pathname});
	  var cartprice = parseInt( jQuery('.cart-price:eq(0) p:eq(1)').html().match(/\d+/), 10);
	  window.callPhantom({"cartprice": cartprice});
	  window.callPhantom({"prodname": jQuery('p.prodname').text()});
	  window.callPhantom({"delivery": jQuery('p.prodname').text()});
	  window.callPhantom({"endurl": window.location.href});
	  window.callPhantom('done');
	}
	setTimeout(evalurl, 3000);
}];

exports.expects = function(results) {
	var res = [];
	res.push({
		'Has the right location (us_en_store_view/checkout/cart)': results.pathname && !!( results.pathname.match(/\/us_en_store_view\/checkout\/cart/gi))  
	});
	res.push({
		'Landing page price matches cart price': !!(results.lpprice === results.cartprice)
	});
	res.push({
		'Cart shows correct language': !!results.prodname.match(new RegExp(testvars.lang,"i"))
	});
	res.push({
		'Cart shows correct level': !!results.prodname.match(testvars.level)
	});
	res.push({
		'Cart shows correct delivery': !!results.prodname.match(testvars.delivery)
	});
	res.push({
		'Price': results.cartprice
	});
	return res;
}