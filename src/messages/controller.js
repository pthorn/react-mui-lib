import EventEmitter from 'eventemitter3';

import MessageReducer from './reducer';
import BaseController from "../controller/base-controller";


class MessageController extends BaseController {
    constructor(options) {
        const opts = Object.assign({
            state_prefix: 'messages',
            Reducer: MessageReducer
        }, options);

        super('messages', opts.state_prefix, opts.Reducer);

        EventEmitter.call(this);
    }

    //
    // actions
    //

    show(message) {
        const new_message = Object.assign({
            // title,
            text: null,
            type:'info',
            exception: null,
            key: new Date().getTime()
        }, message);

        new_message.queue = new_message.type === 'info' ? 'snackbar' : 'dialog';

        this.dispatch({
            type: 'SHOW',
            new_message
        });

        if (new_message.queue === 'snackbar') {
            this.emit('snackbar-new-message');
        }
    }

    showInfo(title, text) {
        this.show({
            title,
            text
        });
    }

    showException(title, exception) {
        this.show({
            title,
            type: 'error',
            exception
        });
    }

    remove(message) {
        this.dispatch({
            type: 'REMOVE',
            message
        });
    }

    getNextSnackbarMessage() {
        const queue = this.state.snackbar_messages;

        if (queue.length === 0) return null;

        return queue[0];
    }
}

Object.assign(MessageController.prototype, EventEmitter.prototype);

export default MessageController;
