(function () {
    var Message;
    Message = function (arg) {
        this.text = arg.text;
        this.message_side = arg.message_side;
        this.conversation = arg.conversation;
        this.timestamp = arg.timestamp;
        this.text += ' (at ' + convertTimestamp(arg.timestamp) + ')'
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                var selector = '#' + this.conversation + ' .messages';
                $(selector).append($message);
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
        this.draw = function(_this) {
            return function () {
                var $conversation;
                $conversation = $($('.conversation_template').clone().html());
                $('.conversations').append($conversation);
                return setTimeout(function () {
                    $conversation.addClass('active');
                    $conversation.attr('id', _this.id);
                    return;
                }, 0);
            };
        }(this);
        return this;
    }
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
                    $tab.addClass('active');
                    $tab[0].addEventListener('click', function() {
                        selectConversation(_this.conversation);
                        //var $conversation = $('#' + _this.conversation);
                        //turnOffActiveConvo();
                        //$conversation.addClass('active');
                        //$tab.addClass('active');
                    });
                    return;
                }, 0);
            };
        }(this);
        return this;
    }
    $(function () {
        var getMessageText, message_side, sendMessage;
        message_side = 'right';
        getMessageText = function () {
            var $message_input;
            $message_input = $('.message_input');
            return $message_input.val();
        };
        sendMessage = function (text) {
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');
            message_side = 'right';
            $conversation = $('.conversation.active');
            var convoId = $conversation.attr('id');
            message = new Message({
                text: text,
                message_side: message_side,
                conversation: convoId,
                timestamp: Math.floor(Date.now() / 1000)
            });
            message.draw();
            return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
        };
        getMessageFromCE = function(name, conversation, expected, messageObjects) {
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
        };
        getConversationFromCE = function(id) {
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
                        if (typeof parsedResponse['message'] === 'string') {
                            messages.push(parsedResponse['message']);
                        }
                        else {
                            messages = parsedResponse['message'];
                        }
                        id = id.replace('.', '_');
                        conversation = new Conversation({
                            messages: messages,
                            id: id
                        });
                        turnOffActiveConvo();
                        tab = new Tab({conversation: id});
                        tab.draw();
                        conversation.draw();
                        var messages = conversation.messages;
                        var expectedNumber = messages.length;
                        var messageObjects = [];
                        for (m in messages) {
                            var messageName = messages[m];
                            getMessageFromCE(messageName, conversation['id'], expectedNumber, messageObjects);
                        }
                    }
                    else {
                        console.log('There is no conversation with that id!');
                    }

                });
            }
            else {
                selectConversation(id);
            }
            return;
        };
        $('.send_message').click(function (e) {
            return sendMessage(getMessageText());
        });
        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                return sendMessage(getMessageText());
            }
        });
        turnOffActiveConvo = function() {
            var activeConvo = $('.conversation.active');
            var activeTab = $('.tab.active');
            activeConvo.removeClass('active');
            activeTab.removeClass('active');
        };
        selectConversation = function(id) {
            var $conversation = $('#' + id.replace('.', '_'));
            var $tab = $('.tab.' + id.replace('.', '_'));
            turnOffActiveConvo();
            $conversation.addClass('active');
            $tab.addClass('active');
        }
        convertTimestamp = function(timestamp) {
            var newDate = new Date();
            newDate.setTime(timestamp * 1000);
            return newDate.toUTCString();
        };
        getConversationFromCE('person_1-SafariCom');
        $('input')[0].addEventListener('keydown', function(e) {
            if (e.keyCode == 13) {
                getConversationFromCE($('input')[0].value.replace('.', '_'));
            }
        });
        /*
        setTimeout(function () {
            return getMessageFromCE(1);
        }, 1000);
        */
    });
}.call(this));
