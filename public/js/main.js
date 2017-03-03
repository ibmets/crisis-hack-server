$(document).ready(function() {
	socket = io.connect();
	socket.on('connect', function(data) {
	  console.log('socket.io connected to websocket server')

	});
	const DEFAULT_LOCATION = [8.4562, -13.2277];
	const DEFAULT_ZOOM = 13;

	var mymap = L.map('mapid').setView(DEFAULT_LOCATION, DEFAULT_ZOOM);
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
		// console.log('drag');
		ebolaDrag = true;
	});

	mymap.on('mouseup', function(e) {
		//if ebola crisis has been dragged
		if (ebolaDrag) {
			ebolaDrag = false;
			// console.log(e.latlng); // e is an event object (MouseEvent in this case)
			addChat(mymap);
			addPeopleToMap(e.latlng.lat, e.latlng.lng, 1000);
		}
	   
	});

	$("#back-button").click(function(e) {
		e.preventDefault();
		hideChat(mymap, group);
	})

	setupWebPageDragDrop();

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
	
	function addChat(map) {
		$("#mapCol").removeClass("col-sm-11");
		$("#mapCol").addClass("col-sm-8");
		$("#crisis-selectorCol").hide();
		$("#chat_container").animate({width:'toggle'},350, function() {
			$(".back-nav").animate({height: "toggle"},350);
		});
		map.invalidateSize();
	}

	function hideChat(map, group) {
		$("#chat_container").animate({width:'toggle'},350, function() {
			$(".back-nav").animate({height: "toggle"},350, function() {
				$("#mapCol").removeClass("col-sm-8");
				$("#mapCol").addClass("col-sm-11");
				$("#crisis-selectorCol").show();
				group.clearLayers();
				window.dispatchEvent(new Event('resize'));
				map.setView(DEFAULT_LOCATION, DEFAULT_ZOOM);
			});
			
		});
	}

	function setupWebPageDragDrop() {
		// Setup the dnd listeners.
		var dropZone = document.getElementById('mapid');
		dropZone.addEventListener('dragover', handleDragOver, false);
		dropZone.addEventListener('drop', handleGeocode, false);
		console.log(dropZone);
	}

	function handleGeocode(evt) {
		// console.log(evt);
        evt.stopPropagation();
        evt.preventDefault();
        var files = evt.dataTransfer; // FileList object.
        console.log(files) ;
        console.log(files.getData("application/x-moz-file"));
        console.log(files.getData("Files"));
        console.log(files.getData("text/x-moz-url"));
        console.log(files.getData("text/uri-list"));
        console.log(files.getData("text/plain"));
        console.log(files.getData("text/html"));
        console.log(evt);
    }

    function handleDragOver(evt) {
    	// console.log(evt);
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'link';
        evt.dataTransfer.effectAllowed = 'link'; // Explicitly show this is a copy.
    }

});

