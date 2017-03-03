(function () {
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
    $(function () {
        var getMessageText, message_side, sendMessage;
        message_side = 'right';
        getMessageText = function () {
            var $message_input;
            // TODO Separate this out into two message types
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
            message = new Message({
                text: text,
                message_side: message_side
            });
            message.draw();
            return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
        };
        getMessageFromCE = function(index) {
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
        };
        $('.send_message').click(function (e) {
            return sendMessage(getMessageText());
        });
        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                return sendMessage(getMessageText());
            }
        });
        // getMessageFromCE(0);
        // setTimeout(function () {
        //     return getMessageFromCE(1);
        // }, 1000);
    });
}.call(this));
