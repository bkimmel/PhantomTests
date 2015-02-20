exports.name = 'newlang_german_s5_cd';

exports.startsAt = 'http://www.stg.rosettastone.com/lp/newlang/sitewide/';

exports.pageSteps = [function() {

    jQuery('#select-language-button').trigger('click');
	setTimeout(function() {
		jQuery('#deu').trigger('click');
	}, 1000);
	
	setTimeout(function(){
		var price = parseInt( jQuery('.regular:eq(0)').html().match(/\d+/), 10 );
		window.callPhantom({'lpprice': price});
		jQuery('a.cart-button:eq(0)').trigger('click');
	}, 2000);
	
	setTimeout(function(){
		var tgtto = jQuery('#proceed-button').attr('href');
		window.callPhantom('screenshot_button');
		window.callPhantom({ "carturl": typeof jQuery('#proceed-button').attr == 'function' && jQuery('#proceed-button').attr('href') });
		window.location = $('#proceed-button').attr('href');
	}, 3000);
	
}, function() {

	function evalurl() {
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