var testvars = {
	lang: "*"
}
exports.name = 'Basic Homepage Loading Test';
exports.startsAt = 'http://www.rosettastone.com/';
exports.pageSteps = [function() {
	setTimeout(function(){
		window.callPhantom({'loaded': !!window.document});
		window.callPhantom('done');
	}, 2000);
}];

exports.expects = function(results) {
	var res = [];
	res.push({
		'Name': exports.name
	});
	res.push({
		'Page Loaded': results.loaded  
	});
	return res;
}