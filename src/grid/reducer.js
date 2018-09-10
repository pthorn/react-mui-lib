import _ from 'lodash';

import BaseReducer from '../controller/base-reducer';
import modes from './modes';


class GridReducer extends BaseReducer {

    SET_PAGE(state, action) {
        return _.assign({}, state, {
            current_page: action.page_n
        });
    }

    NEEDS_REFRESH(state, action) {
        return _.assign({}, state, {
            mode: modes.DATA_OLD
        });
    }

    LOADING(state, action) {
        return state;
        // return {
        //     mode: modes.LOADING
        // }
    }

    LOAD_SUCCESS(state, action) {
        return _.assign({}, state, {
            mode: modes.DATA,
            rows: action.data.data,
            total_rows: action.data.count
        });
    }

    LOAD_FAILED(state, action) {
        return state;
        // return {
        //     mode: modes.LOAD_ERROR,
        //     error: action.error
        // };
    }

    SET_ORDER(state, action) {
        return _.assign({}, state, {
            order_col: action.column,
            order_dir: action.direction
        });
    }

    SET_FILTER(state, action) {
        const filter = _.isUndefined(action.operation) ?
                action.value :
                [action.value, action.operation];

        return _.merge({}, state, {
            filters: {
                [action.key]: filter
            },
            mode: modes.DATA_OLD
        });
    }

    CLEAR_FILTER(state, action) {
        const {[action.key]: deleted, ...new_filters } = state.filters;

        return _.assign({}, state, {
            filters: new_filters,
            mode: modes.DATA_OLD
        });
    }

    SET_SEARCH(state, action) {
        return _.assign({}, state, {
            search: action.value,
            mode: modes.DATA_OLD
        });
    }

    INITIAL() {
        return {
            mode: modes.EMPTY,
            rows: [],
            total_rows: 0,
            current_page: 1,
            rows_per_page: 25,
            order_col: this.controller.options.default_order_col,
            order_dir: this.controller.options.default_order_dir,
            filters: {},
            search: ''
        };
    }
}

export default GridReducer;
