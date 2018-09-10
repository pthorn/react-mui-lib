import _ from 'lodash';

//import registry from '../..';
import BaseReducer from '../controller/base-reducer';


class ListReducer extends BaseReducer {
    INITIAL() {
        return {
            rows: [],
            refresh_required: true
        }
    }

    REFRESH_REQUIRED(state, action) {
        return _.assign({}, state, {
            refresh_required: true
        });
    }

    LOADING(state, action) {
        return _.assign({}, state, {
            refresh_required: false
        });
    }

    LOAD_SUCCESS(state, action) {
        return _.assign({}, state, {
            rows: action.data.data,
            refresh_required: false
        });
    }

    LOAD_FAILED(state, action) {
        return _.assign({}, state, {
            rows: [],
            refresh_required: true
        });
    }
}

export default ListReducer;
