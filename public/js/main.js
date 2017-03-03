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

	displayCrisisTypes(function() {
		var ebolaDrag = false;
		$(".crisis").on('dragstart', function(e) {
			console.log('drag');
			ebolaDrag = true;
		});

		mymap.on('mouseup', function(e) {
			console.log(ebolaDrag)
			//if ebola crisis has been dragged
			if (ebolaDrag) {
				ebolaDrag = false;
				// console.log(e.latlng); // e is an event object (MouseEvent in this case)
				addChat(mymap);
				addPeopleToMap(e.latlng.lat, e.latlng.lng, 1000);
			}

		});
	});



	$("#back-button").click(function(e) {
		e.preventDefault();
		hideChat(mymap, group);
	})
	$('.send_message').click(function (e) {
	    return chatFunctions.sendToAll(chatFunctions.getMessageText());
	});
	$('.message_input').keyup(function (e) {
	    if (e.which === 13) {
	        return chatFunctions.sendMessage(chatFunctions.getMessageText());
	    }
	});
	/*
	$('input')[0].addEventListener('keydown', function(e) {
			if (e.keyCode == 13) {
					chatFunctions.getConversationFromCE($('input')[0].value.replace('.', '_'));
			}
	});
	*/

	setupWebPageDragDrop();
	var currentCircleNumbers = [];

	function addPeopleToMap(latitude, longitude, radius) {
		group.clearLayers();
		$.get('/geo/peopleNearLocation/'+latitude+'/'+longitude+'/'+radius, function(people) {
			for (var i=0; i<people.length; i++) {
				//add marker to map
				var lat = people[i].geometry.coordinates[1];
				var lng = people[i].geometry.coordinates[0];

				L.marker([lat,lng]).addTo(group);
				if (people[i].doc.properties.property_values["is real"]) {
					currentCircleNumbers.push({
						name: people[i].doc.properties.name,
						telephone_number: people[i].doc.properties.property_values["telephone number"][0]
					})
				}


			}


			//console.log(currentCircleNumbers);

			$.get('http://ce-crisishack.eu-gb.mybluemix.net/ce-store/queries/conversation%20including%20person/execute?style=normalised', function(response) {

				var ceresults = response.results;
				var conversations = [];
				var testPeople = ['person.1', 'person.2', 'person.3', 'person.4'];
				for (x in ceresults) {
					var ceresult = ceresults[x];

					for (y in testPeople) {
						var currentCircleNumber = testPeople[y];
						if (ceresult[0] === currentCircleNumber) {
							conversations.push({id: ceresult[1], number: '0123456789'});
						}
					}
				}

				for (c in conversations) {
					var conv = conversations[c];
					chatFunctions.getConversationFromCE(conv.id.replace('.', '_'));
				}
			})


			//Add marker at center of circle with ebola icon
			var ebolaIcon = L.icon({
			    iconUrl: 'https://raw.githubusercontent.com/ce-store/crisishack/master/src/main/webapp/icons/crisis_ebola.png',
			    iconAnchor: new L.Point(16, 18),
			    iconSize: new L.Point(32, 37),
			});

			var center = L.marker([latitude, longitude], {icon: ebolaIcon});
			center.addTo(group);

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
		$("#mapCol").removeClass("col-sm-10");
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
				$("#mapCol").addClass("col-sm-10");
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
        console.log(url)
        if (url && url.length > 0) {
        	$.post("/corsproxy",{url: url}, function(geoJSON) {
        		console.log(geoJSON);
        		try {
        			// var geoJSON = JSON.parse(result);

        			var data = geoJSON.features.slice(0,10);
        			console.log(data);
        			delete geoJSON.features;
        			for (var i=0; i<data.length; i++) {
        				//add marker to map
        				var lat = data[i].geometry.coordinates[1];
        				var lng = data[i].geometry.coordinates[0];
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
        this.text = arg.text;
        this.message_side = arg.message_side;
        this.conversation = arg.conversation;
        this.timestamp = arg.timestamp;
        this.text += ' (at ' + chatFunctions.convertTimestamp(arg.timestamp) + ')';
        this.targetNumber = arg.targetNumber ? null : arg.targetNumber;

        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                var selector = '#' + this.conversation + ' .messages';
                $(selector).append($message);

                if (this.targetNumber) {
                	// send message to number
                	//send request to server to actually send the message.
                	//sendMessage
                	console.log(this.targetNumber);
                	$.get('/sendMessage?to="'+this.targetNumber+'"&body='+message.text, function(result) {
                		console.log(result);
                	})
                }

                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };
    var Conversation;
    Conversation = function (arg) {
        this.messages = arg.messages;
        this.id = arg.id;
		this.name = arg.name;
        this.lat = arg.lat;
        this.lon = arg.lon;
        this.phone = arg.phone;

        this.draw = function(_this) {
            return function () {
                var $conversation;
                $conversation = $($('.conversation_template').clone().html());
                $('.conversations').append($conversation);
                return setTimeout(function () {
                    $conversation.attr('id', _this.id);
                    $conversation.attr('rel', JSON.stringify({lat: _this.lat, lon: _this.lon, phone: _this.phone, name: _this.name}));
					$('#' + _this.id + ' .name').html(_this.name);
					chatFunctions.selectConversation(_this.id);
                    return;
                }, 0);
            };
        }(this);
        return this;
    };
    var Tab;
    Tab = function (arg) {
        this.conversation = arg.conversation;
        this.draw = function(_this) {
            return function () {
                var $tab;
                $tab = $($('.tab_template').clone().html());
                $('.tabs').append($tab);
                return setTimeout(function () {
                    $tab.addClass(_this.conversation);
                    $tab[0].addEventListener('click', function() {
                        chatFunctions.selectConversation(_this.conversation);
                    });
                    return;
                }, 0);
            };
        }(this);
        return this;
    };

    var chatFunctions = {


        getMessageText: function () {
            var $message_input;
            $message_input = $('.message_input');
            return $message_input.val();
        },
        sendMessage: function (text, phone) {
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');
            message_side = 'right';
            $conversation = $('.conversation.active');
            var convoId = $conversation.attr('id');

            var currentCircleNumbersLength = currentCircleNumbers.length;
            var convoNumber = convoId.split("person_")[1].split("-SafariCom")[0];

            message = new Message({
                text: text,
                message_side: message_side,
                conversation: convoId,
                timestamp: Math.floor(Date.now() / 1000)
            });
            /*
            if (convoNumber <= currentCircleNumbersLength) {
            	message.targetNumber = currentCircleNumbers[convoNumber].telephone_number;
            }
            */
            if (phone) {
                message.targetNumber = phone;
            }
            message.draw();
            return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
        },
        getMessageFromCE: function(name, conversation, expected, messageObjects) {
            var $messages;
            var p = new Promise(function(resolve, reject) {
              var req = new XMLHttpRequest();
              var url = 'http://ce-crisishack.eu-gb.mybluemix.net/ce-store/';
              if (name) {
                  url += 'instances/' + name;
              }
              else {
                  url += 'concepts/message/instances';
              }
              url += '?style=normalised';

              req.open('GET', url);
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
                var parsedResponse;
                if (name) {
                    parsedResponse = JSON.parse(response);
                }
                $messages = $('.messages');
                message_side = parsedResponse['is to'] === 'SafariCom' ? 'left' : 'right';
                message = new Message({
                    text: parsedResponse['message text'],
                    message_side: message_side,
                    conversation: conversation,
                    timestamp: parsedResponse['timestamp']
                });
                messageObjects.push(message);
                if (messageObjects.length === expected) {
                    messageObjects.sort(function(x, y){
                        return x.timestamp - y.timestamp;
                    })
                    for (m in messageObjects) {
                        messageObjects[m].draw();
                        $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
                    }
                }
            });
            return;
        },
        getConversationFromCE: function(id) {
            var $conversations, conversation;
            var $existingConversation = $('#' + id.toString().replace('.', '_'));
            if ($existingConversation.length === 0) {
                var p = new Promise(function(resolve, reject) {
                  var req = new XMLHttpRequest();
                  req.open('GET', 'http://ce-crisishack.eu-gb.mybluemix.net/ce-store/concepts/conversation/instances?style=normalised');
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
                    var parsedResponse;
                    var foundId = false;
                    var index = 0;
                    while (!foundId && index < JSON.parse(response).length) {
                        if (JSON.parse(response)[index]['_id'].replace('.', '_') === id) {
                            foundId = true;
                            parsedResponse = JSON.parse(response)[index];
                        }
                        else {
                            index += 1;
                        }
                    }
                    if (parsedResponse) {
                        $conversations = $('.conversations');
                        var messages = [];
                        var name;
                        var phoneNumber = null;
                        if (typeof parsedResponse['message'] === 'string') {
                            messages.push(parsedResponse['message']);
                        }
                        else {
                            messages = parsedResponse['message'];
                        }
                        id = id.replace('.', '_');
                        for (i in parsedResponse.includes) {
                            if (parsedResponse.includes[i] !== 'SafariCom') {
                                name = parsedResponse.includes[i];
                                phoneNumber = '07956749536';
                            }
                        }
                        conversation = new Conversation({
                            messages: messages,
                            id: id,
							name: name,
                            lat: parsedResponse['latitude'],
                            lon: parsedResponse['longitude']
                        });
                        if (phoneNumber) {
                            conversation.phone = phoneNumber;
                        }
                        tab = new Tab({conversation: id});
                        tab.draw();
                        conversation.draw();
						chatFunctions.selectConversation(conversation.id);
                        var messages = conversation.messages;
                        var expectedNumber = messages.length;
                        var messageObjects = [];
                        for (m in messages) {
                            var messageName = messages[m];
                            chatFunctions.getMessageFromCE(messageName, conversation['id'], expectedNumber, messageObjects);
                        }
                    }
                    else {
                        console.log('There is no conversation with that id!');
                    }

                });
            }
            else {
                chatFunctions.selectConversation(id);
            }
            return;
        },

        turnOffActiveConvo: function() {
            var activeConvo = $('.conversation.active');
            var activeTab = $('.tab.active');
            activeConvo.removeClass('active');
            activeTab.removeClass('active');
        },
        selectConversation: function(id) {
            var $conversation = $('#' + id.replace('.', '_'));
            var $tab = $('.tab.' + id.replace('.', '_'));
            chatFunctions.turnOffActiveConvo();
            $conversation.addClass('active');
            $tab.addClass('active');
            var lat, lon;
            if ($conversation.attr('rel')) {
                lat = JSON.parse($conversation.attr('rel')).lat;
                lon = JSON.parse($conversation.attr('rel')).lon;
            }
            if (lat && lon) {
                mymap.panTo(new L.LatLng(lat, lon))
            }
        },
        convertTimestamp: function(timestamp) {
            var newDate = new Date();
            newDate.setTime(timestamp * 1000);
            return newDate.toUTCString();
        },
        sendToAll: function(text) {
            for (i = 1; i < 5; i++) {
                var selector = '#person_' + i + '-SafariCom';
                console.log(JSON.parse($(selector).attr('rel')).lat);
            }
        }

    }

    function displayCrisisTypes(cb) {
    	//make a call to CE store and get crisis types
    	$.get('http://ce-crisishack.eu-gb.mybluemix.net/ce-store/concepts/crisis%20type/instances?style=normalised', function(result) {
    		for (var i=0; i<result.length; i++) {
    			var name = result[i]._id;
    			var htmlString = "<li><div class='crisis' draggable='true'><p>"+name+"</p><img src='"+result[i]["icon file name"]+"'</div></li>";

    			$("#crisis-list").append(htmlString);
    		}
    		cb();
    	});
    }
});
