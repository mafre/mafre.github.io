class Subscription {

    constructor(messageType, callback) {

        this.messageType = messageType;
        this.callback = callback;
    }
}

export default Subscription;