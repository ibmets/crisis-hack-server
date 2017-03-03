$(document).ready(function() {
	socket = io.connect();
	socket.on('connect', function(data) {
	  console.log('socket.io connected to websocket server')

	});

	/*
	var mymap = L.map('mapid').setView([8.4480594, -12.908401], 13);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(mymap);

	var marker = L.marker([8.4480594, -12.908401]).addTo(mymap);

	var circle = L.circle([8.4480594, -12.908401], {
	    color: 'red',
	    fillColor: '#f03',
	    fillOpacity: 0.5,
	    radius: 500
	}).addTo(mymap);




	var options = {
	  uri: 'http://nr-crisishack.eu-gb.mybluemix.net/ce-to-geojson?concept=community%20care%20centre',
	  json: true
	};

	var p = new Promise(function(resolve, reject) {
	  var xhr = new XMLHttpRequest();


		if ("withCredentials" in xhr) {

			// Check if the XMLHttpRequest object has a "withCredentials" property.
			// "withCredentials" only exists on XMLHTTPRequest2 objects.
		  xhr.open('GET', options.uri);

		} else if (typeof XDomainRequest != "undefined") {

			// Otherwise, check if XDomainRequest.
			// XDomainRequest only exists in IE, and is IE's way of making CORS requests.
			xhr = new XDomainRequest();
			xhr.open('GET', options.uri);

		} else {

			// Otherwise, CORS is not supported by the browser.
			xhr = null;

		}

	  xhr.onload = function() {
	    if (xhr.status == 200) {
	      resolve(xhr.response);
	    }
	    else {
	      reject(Error(xhr.statusText));
	    }
	  };
	  // Handle network errors
	  xhr.onerror = function() {
	    reject(Error("Network Error"));
	  };

	  // Make the request
	  xhr.send();
	});

	p.then(function(response) {

		var heatmapArray = [];
		console.log(response);

		var heat = L.heatLayer([
		    [8.4480594, -12.908401, 0.8], // lat, lng, intensity
		], {radius: 25}).addTo(mymap);

	});
	*/

});
