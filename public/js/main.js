$(document).ready(function() {
	socket = io.connect();
	socket.on('connect', function(data) {
	  console.log('socket.io connected to websocket server')

	});

	
	var mymap = L.map('mapid').setView([8.4562, -13.2277], 13);
	var group = new L.featureGroup();
	mymap.addLayer(group);
	var tileURL = "https://api.mapbox.com/styles/v1/dancunnington/ciztrtban00vh2sqjn5hci14f/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGFuY3VubmluZ3RvbiIsImEiOiI1M2RiZTJlNTFkYWZiNjczNWRjODEwOGNlNzkzMTBlZiJ9.eAfl4KKi9ZRASZgxL8KcYw";
	L.tileLayer(tileURL, {
		// L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 20,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(mymap);

	var ebolaDrag = false;
	$("#ebola").on('dragstart', function(e) {
		ebolaDrag = true;
	});

	mymap.on('mouseup', function(e) {
		//if ebola crisis has been dragged
		if (ebolaDrag) {
			ebolaDrag = false;
			addPeopleToMap(e.latlng.lat, e.latlng.lng, 1000);
		}
	});

	function addPeopleToMap(latitude, longitude, radius) {
		group.clearLayers();
		$.get('/geo/peopleNearLocation/'+latitude+'/'+longitude+'/'+radius, function(people) {
			for (var i=0; i<people.length; i++) {
				//add marker to map
				var lat = people[i].geometry.coordinates[1];
				var lng = people[i].geometry.coordinates[0];

				L.marker([lat,lng]).addTo(group);

			}
			var circle = L.circle([latitude, longitude], {
			    color: 'red',
			    fillColor: '#f03',
			    fillOpacity: 0.5,
			    radius: radius
			}).addTo(group);
			mymap.fitBounds(group.getBounds());
		});
	}
	

});
