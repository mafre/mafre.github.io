class Subscription {

    constructor(messageType, callback) {

        this.messageType = messageType;
        this.callback = callback;
    }
}

class Bus {

    constructor() {

        this.subscriptions = [];
    }

    subscribe = (messageType, callback) => {

        const subscription = new Subscription(messageType, callback);

        this.subscriptions.push(subscription);

        return subscription;
    }

    unsubscribe = (messageType, callback) => {

        const subscription = this.subscriptions.find(aSubscription => {

            return aSubscription.messageType === messageType &&
                aSubscription.callback === callback;
        });

        if (!subscription) {

            return;
        }

        this.remove(subscription);
    }

    remove = subscription => {

        const index = this.subscriptions.indexOf(subscription);

        this.subscriptions.splice(index, 1);
    }

    clear = messageType => {

        const subscriptions = this.subscriptions.filter(aSubscription => {

            return aSubscription.messageType === messageType;
        });

        for (let aSubscription in subscriptions) {

            this.remove(aSubscription);
        }
    }

    dispatch = (messageType, props = {}) => {

        const subs = this.subscriptions.filter(subscription => {

            return subscription.messageType === messageType;
        });

        for (let subscription of subs) {

            subscription.callback(props);
        }
    }
}

const bus = new Bus();

export default bus;