var sergioDependencies = {
	jquery: {
		src: 'https://cdn.jsdelivr.net/jquery/3.1.1/jquery.min.js'
	},
	vue: {
		src: 'https://cdn.jsdelivr.net/vue/2.0.3/vue.min.js'
	},
	lodash:  {
		src: 'https://cdn.jsdelivr.net/lodash/4.16.6/lodash.min.js'
	},
	bluebird:  {
		src: 'https://cdn.jsdelivr.net/bluebird/3.4.6/bluebird.min.js'
	}
};
var sergioDepsToLoad = [];

function sergioLoadDependency(dep) {
	let headTag = document.getElementsByTagName("head")[0];
	let jqTag = document.createElement('script');
	jqTag.type = 'text/javascript';
	jqTag.src = sergioDependencies[dep].src;
	jqTag.onload = function() {
		sergioDepsToLoad = sergioDepsToLoad.filter(function(elm) {
			return elm !== dep;
		});
		if(sergioDepsToLoad.length === 0) {
			Sergio.init();
		}
	};
	headTag.appendChild(jqTag);
}

document.addEventListener("DOMContentLoaded", function(event) {

	// Load dependencies

	if(typeof jQuery == 'undefined') {
		sergioDepsToLoad.push('jquery');
	}
	if(typeof Vue == 'undefined') {
		sergioDepsToLoad.push('vue');
	}
	if(typeof _ == 'undefined') {
		sergioDepsToLoad.push('lodash');
	}
	if(typeof Promise == 'undefined' || typeof Promise.OperationalError == 'undefined') {
		sergioDepsToLoad.push('bluebird');
	}

	if(sergioDepsToLoad.length > 0) {
		sergioDepsToLoad.forEach(function(elm) {
			sergioLoadDependency(elm);
		});
	} else {
		Sergio.init();
	}

});
