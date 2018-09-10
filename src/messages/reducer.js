import _ from 'lodash';
import BaseReducer from '../controller/base-reducer';


class MessageReducer extends BaseReducer {
    INITIAL() {
        return {
            snackbar_messages: [],
            dialog_messages: []
        };
    }

    SHOW(state, action) {
        console.log('---- SHOW', action);

        if (action.new_message.queue === 'snackbar') {
            return _.assign({}, state, {
                snackbar_messages: state.snackbar_messages.concat([action.new_message])
            });
        } else {
            return _.assign({}, state, {
                dialog_messages: state.dialog_messages.concat([action.new_message])
            });
        }
    }

    REMOVE(state, action) {
        console.log('---- REMOVE', action);

        if (action.message.queue === 'snackbar') {
            return _.assign({}, state, {
                snackbar_messages: _.filter(state.snackbar_messages, el => el !== action.message)
            });
        } else {
            return _.assign({}, state, {
                dialog_messages: _.filter(state.dialog_messages, el => el !== action.message)
            });
        }
    }
}

export default MessageReducer;
