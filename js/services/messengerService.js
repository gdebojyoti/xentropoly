class MessengerService {
    constructor() {
        this.receivers = {};
        this.inbox = [];
    }

    update() {
        for (var index = 0; index < this.inbox.length; index++) {
            var inboxData = this.inbox[index],
                messageType = inboxData.messageType,
                messageData = inboxData.messageData;

            if (messageType && this.receivers[messageType]) {
                for (var i in this.receivers[messageType]) {
                    var callback = this.receivers[messageType][i];
                    callback(messageData);
                }
            }
        }
        this.inbox = [];
    }

    observe(messageType, callback) {
        this.receivers[messageType] = this.receivers[messageType] || [];
        this.receivers[messageType].push(callback);
    }

    send(messageType, data) {
        var messageData = Object.assign({}, data);

        var inboxData = {
            messageType: messageType,
            messageData: messageData
        };
        this.inbox.push(inboxData);
    }
}

export default MessengerService;