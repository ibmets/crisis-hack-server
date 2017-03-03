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
	$('.send_message').click(function (e) {
	    return chatFunctions.sendMessage(chatFunctions.getMessageText());
	});
	$('.message_input').keyup(function (e) {
	    if (e.which === 13) {
	        return chatFunctions.sendMessage(chatFunctions.getMessageText());
	    }
	});

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

        var url = files.getData("text/plain");
        if (url && url.length > 0) {
        	$.get(url, function(result) {
        		try {
        			var geoJSON = JSON.parse(result);
        			for (var i=0; i<geoJSON.length; i++) {
        				//add marker to map
        				var lat = geoJSON[i].geometry.coordinates[1];
        				var lng = geoJSON[i].geometry.coordinates[0];
        				L.marker([lat,lng]).addTo(group);
        			}
        			
        			mymap.fitBounds(group.getBounds());
        		} catch(err) {
        			console.log(err);
        		}
        	});
        }
    }

    function handleDragOver(evt) {
    	// console.log(evt);
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'link';
        evt.dataTransfer.effectAllowed = 'link'; // Explicitly show this is a copy.
    }

    var getMessageText, message_side, sendMessage;
    message_side = 'right';

    var Message;
    Message = function (arg) {
        this.text = arg.text, this.message_side = arg.message_side;
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                $('.messages').append($message);
                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };
    
    var chatFunctions = {

    	getMessageText: function () {
    	    var $message_input;
    	    // TODO Separate this out into two message types
    	    $message_input = $('.message_input');
    	    return $message_input.val();
    	},
    	sendMessage: function (text) {
    	    var $messages, message;
    	    if (text.trim() === '') {
    	        return;
    	    }
    	    $('.message_input').val('');
    	    $messages = $('.messages');
    	    message_side = 'right';
    	    message = new Message({
    	        text: text,
    	        message_side: message_side
    	    });
    	    message.draw();
    	    return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
    	},
    	getMessageFromCE: function(index) {
    	    var $messages;
    	    var p = new Promise(function(resolve, reject) {
    	      var req = new XMLHttpRequest();
    	      req.open('GET', 'http://ce-crisishack.eu-gb.mybluemix.net/ce-store/concepts/message/instances?style=normalised');
    	      req.onload = function() {
    	        if (req.status == 200) {
    	          resolve(req.response);
    	        }
    	        else {
    	          reject(Error(req.statusText));
    	        }
    	      };
    	      req.onerror = function() {
    	        reject(Error("Network Error"));
    	      };
    	      req.send();
    	    });

    	    p.then(function(response) {
    	        var parsedResponse = JSON.parse(response)[index];
    	        $messages = $('.messages');
    	        message_side = parsedResponse['is to'] === 'SafariCom' ? 'left' : 'right';
    	        message = new Message({
    	            text: parsedResponse['message text'],
    	            message_side: message_side
    	        });
    	        message.draw();
    	        $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
    	    });
    	    return;
    	}
    }

});

