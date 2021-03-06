$(document).ready(function() {
	socket = io.connect();
	socket.on('connect', function(data) {
	  console.log('socket.io connected to websocket server')

	});
	const DEFAULT_LOCATION = [8.4562, -13.2277];
	const DEFAULT_ZOOM = 13;

    var tabsLoaded = 0;

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
				addPeopleToMap(e.latlng.lat, e.latlng.lng, 2000);
			}

		});
	});



	$("#back-button").click(function(e) {
		e.preventDefault();
		hideChat(mymap, group);
	})

    var currentCircleNumbers = [];

    $('.send_message').click(function (e) {
        var id = $(".conversation.active").attr('id');
        var phone = JSON.parse($(".conversation.active").attr('rel')).phone;
        var timestamp = + new Date();
        var text = chatFunctions.getMessageText();
        var url = "http://ce-crisishack.eu-gb.mybluemix.net/ce-store/sentences";
        var sentence = "there is an sms message named 'sms_{uid}' that is from the number '" + phone + "' and is to the number ' 441403540126' and has '" + timestamp + "' as timestamp and has '" + text + "' as message text.";
        var req = new XMLHttpRequest();

        url += '?ceText=';
        url += escape(sentence);
        url += '&action=save'

        // TODO: Make this post to ce store
        req.open('POST', url, true);
        req.send();
        return chatFunctions.sendMessage(text, id, phone);
    });
    $('.message_input').keyup(function (e) {
        if (e.which === 13) {
            var id = $(".conversation.active").attr('id');
            var phone = JSON.parse($(".conversation.active").attr('rel')).phone;
            var timestamp = + new Date();
            var text = chatFunctions.getMessageText();
            var url = "http://ce-crisishack.eu-gb.mybluemix.net/ce-store/sentences";
            var sentence = "there is an sms message named 'sms_{uid}' that is from the number '" + phone + "' and is to the number ' 441403540126' and has '" + timestamp + "' as timestamp and has '" + text + "' as message text.";
            var req = new XMLHttpRequest();

            url += '?ceText=';
            url += escape(sentence);
            url += '&action=save'

            // TODO: Make this post to ce store
            req.open('POST', url, true);
            req.send();
            return chatFunctions.sendMessage(text, id, phone);
        }
    });

    var $sendToAll = $($('.tab_template').clone().html());
    $('.tabs').append($sendToAll);
    setTimeout(function () {
        $sendToAll.addClass('send-to-all');
        $sendToAll[0].addEventListener('click', function() {
            chatFunctions.selectConversation('send-to-all');
        });
    }, 0);
    $('.send-to-all').keyup(function (e) {
        if (e.which === 13) {
            return chatFunctions.sendToAll(chatFunctions.getMessageText());
        }
    });

    var $sentToAllConv = $($('.conversation_template').clone().html());
    $('.conversations').append($sentToAllConv);
    setTimeout(function () {
        $sentToAllConv.attr('id', 'send-to-all');
        $('#send-to-all .name').html('Send a message to all active chats');
    });

	setupWebPageDragDrop();


	function addPeopleToMap(latitude, longitude, radius) {
		group.clearLayers();
		$.get('/geo/peopleNearLocation/'+latitude+'/'+longitude+'/'+radius, function(people) {

            for (var i=0; i<people.length; i++) {
				//add marker to map
				var lat = people[i].geometry.coordinates[1];
				var lng = people[i].geometry.coordinates[0];
                var phoneIcon;
                if (people[i].doc.properties.property_values["is real"]) {
                    phoneIcon = L.icon({
                        iconUrl: 'marker-icon-ourphone.png',
                        iconSize: [25,41],
                        iconAnchor: [12.5, 41]
                    })
                } else {
                    phoneIcon = L.icon({
                        iconUrl: 'marker-icon-phone.png',
                        iconSize: [25,41],
                        iconAnchor: [12.5, 41]
                    })
                }



				L.marker([lat,lng], {icon: phoneIcon}).addTo(group);
				if (people[i].doc.properties.property_values["is real"]) {
					currentCircleNumbers.push({
						name: people[i].doc.properties.name,
						telephone_number: people[i].doc.properties.property_values["telephone number"][0]
					})
				}

			}

			$.get('http://ce-crisishack.eu-gb.mybluemix.net/ce-store/queries/conversation%20including%20person/execute?returnInstances=true&style=normalised', function(response) {

				var ceresults = response.results;
				var conversations = [];
				var testPeople = ['Perry', 'Dave', 'Adrian', 'Dan', 'Richard', 'Rosie', 'Sanaz'];
				for (x in ceresults) {
					var ceresult = ceresults[x];
                    for (y in testPeople) {
                        var person = testPeople[y];
                        if (ceresult[0] === person) {
                            var inst = response.instances[ceresult[0]];
                            var phone = inst['telephone number'];
                            var lat = inst['latitude'];
                            var lon = inst['longitude'];
        					conversations.push({'id': ceresult[1], 'phone': phone, 'lat': lat, 'lon': lon});
                        }
                    }

				}
                console.log(conversations.length);
				for (c in conversations) {
					var conv = conversations[c];
					chatFunctions.getConversationFromCE(conv.id.replace('.', '_'), conv.phone, conv.lat, conv.lon);
				}
			})


			//Add marker at center of circle with ebola icon
			var ebolaIcon = L.icon({
			    iconUrl: 'https://raw.githubusercontent.com/ce-store/crisishack/master/src/main/webapp/icons/crisis_ebola.png',
			    iconAnchor: [16,37],
			    iconSize: [32,37],
			});

			var center = L.marker([latitude, longitude], {icon: ebolaIcon});
            center.setZIndexOffset(999999);
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
	}

	function handleGeocode(evt) {
		// console.log(evt);
        evt.stopPropagation();
        evt.preventDefault();
        var files = evt.dataTransfer; // FileList object.

        var url = files.getData("text/plain");
        if (url && url.length > 0) {
        	$.post("/corsproxy",{url: url}, function(geoJSON) {
        		try {
        			// var geoJSON = JSON.parse(result);

        			var data = geoJSON.features.slice(0,10);
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
        this.targetNumber = arg.targetNumber ? arg.targetNumber : null;

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
                	$.get('/sendMessage?to="'+this.targetNumber+'"&body='+_this.text, function(result) {
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
        sendMessage: function (text, id, phone) {
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');
            message_side = 'right';
            $conversation = $('#' + id);
            var convoId = $conversation.attr('id');

            message = new Message({
                text: text,
                message_side: message_side,
                conversation: id,
                timestamp: Math.floor(Date.now() / 1000),
                targetNumber: phone
            });

            message.draw();
            return $messages.animate({ scrollTop: '0px' }, 300);
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
				var phone = parsedResponse['telephone number'];
                //console.log(parsedResponse);
				if (phone) {
					message.phone = phone;
                    //console.log(phone);
				}
                messageObjects.push(message);
                if (messageObjects.length === expected) {
                    messageObjects.sort(function(x, y){
                        return x.timestamp - y.timestamp;
                    })
                    for (m in messageObjects) {
                        messageObjects[m].draw();
                        $messages.animate({ scrollTop: '0px' }, 540);
                    }
                }
            });
            return;
        },
        getConversationFromCE: function(id, phone, lat, lon) {
            var $conversations, conversation;
            var $existingConversation = $('#' + id.toString().replace('.', '_'));

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

            if ($existingConversation.length === 0) {

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
                        var phoneNumber;
                        //console.log(parsedResponse);
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

                            }
                        }

                        conversation = new Conversation({
                            messages: messages,
                            id: id,
							name: name,
                            lat: parsedResponse['latitude'],
                            lon: parsedResponse['longitude'],
                            phone: phone
                        });

                        var inCircle = false;
                        for (var i=0; i<currentCircleNumbers.length; i++) {
                            if (currentCircleNumbers[i].name === name) {
                                inCircle = true;
                                break;
                            }
                        }
                        if (inCircle) {
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

                    }
                    else {
                        console.log('There is no conversation with that id!');
                    }

                });
            }
            else {
                var displayedMessageCount = $existingConversation[0].children[1].children.length;
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

                    var messages = [];
                    if (typeof parsedResponse['message'] === 'string') {
                        messages.push(parsedResponse['message']);
                    }
                    else {
                        messages = parsedResponse['message'];
                    }

                    var diff = messages.length - displayedMessageCount;

                    if (diff > 0) {
                        var messageObjects = [];

                        for (m in messages) {
                            if (m >= displayedMessageCount) {
                                var message = messages[m];
                                chatFunctions.getMessageFromCE(message, id, diff, messageObjects);
                            }
                        }
                    }
                    else if (diff < 0) {
                        console.log('Message from UI has not been sent to ce store!')
                    }
                    else {
                        console.log('Nothing to report!');
                    }
                });
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
                if (tabsLoaded < 4) {
                    tabsLoaded +=1
                } else {
                    mymap.panTo(new L.LatLng(lat, lon))
                }
            }
        },
        convertTimestamp: function(timestamp) {
            var newDate = new Date();
            newDate.setTime(timestamp * 1000);
            return newDate.toUTCString();
        },
        sendToAll: function(text) {
            for (i = 1; i < $('.conversation').length - 1; i++) {
                var $conv = $($('.conversation')[i]);
                var id = $conv.attr('id');
                var phone = JSON.parse($conv.attr('rel')).phone;
                //chatFunctions.sendMessage(text, id, phone);
            }
        },
        getIdOfActiveConvo: function() {
            var $activeConvo = $('.conversation.active');
            var output = null;
            if ($activeConvo) {
                output = $activeConvo.attr('id');
            }
            return output;
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


    setTimeout(function () {
        //chatFunctions.sendToAll('Is anyone you know unwell?');
        var newProm = new Promise(function(resolve, reject) {
          var req = new XMLHttpRequest();
          req.open('GET', 'http://ce-crisishack.eu-gb.mybluemix.net/ce-store/concepts/detected%20thing/children?style=summary');
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

        newProm.then(function(response) {
            var parsedResponse = JSON.parse(response);
            for (p in parsedResponse) {
                var concept = parsedResponse[p];
                var $concept = $($('.concept_template').clone().html());
                $('#concepts').append($concept);
                $concept.text(concept['_id']);
            }
        });

    }, 1000);

    window.setInterval(function(){
        var activeConvoId = chatFunctions.getIdOfActiveConvo();
        if (activeConvoId && activeConvoId !== 'send-to-all') {
            chatFunctions.getConversationFromCE(activeConvoId);
        }
        return;
    }, 1000)

});
