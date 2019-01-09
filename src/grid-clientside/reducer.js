import _ from 'lodash';

import BaseReducer from 'react-mui-lib/controller/base-reducer';
import modes from './modes';


class ClientsideGridReducer extends BaseReducer {
    INITIAL() {
        const options = this.controller.options;

        return {
            mode: modes.EMPTY,
            rows: [],
            page: [],
            total_rows: 0,
            current_page: 1,
            rows_per_page: options.rows_per_page,
            order_col: options.default_order_col,
            order_dir: options.default_order_dir,
            filters: {},
            static_filters: {},
            search: ''
        };
    }

    // TODO ?
    NEEDS_REFRESH(state, action) {
        return _.assign({}, state, {
            mode: modes.DATA_OLD
        });
    }

    //
    // load from server
    //

    LOADING(state, action) {
        return _.assign({}, state, {
            mode: modes.LOADING,
            rows: [],
            page: [],
            total_rows: 0
        });
    }

    LOAD_SUCCESS(state, action) {
        return this._process(_.assign(state, {
            mode: modes.DATA,
            rows: action.data.data,
            total_rows: action.data.count
        }));
    }

    LOAD_FAILED(state, action) {
        return _.assign({}, state, {
            mode: modes.LOAD_ERROR,
            error: action.error,
            rows: [],
            page: [],
            total_rows: 0
        });
    }

    //
    // x
    //

    SET_PAGE(state, action) {
        // TODO!
        state.current_page = action.page_n;
        return this._process(state);
    }

    SET_ORDER(state, action) {
        state.order_col = action.column;
        state.order_dir = action.direction;
        return this._process(state);
    }

    SET_FILTER(state, action) {
        const filter = _.isUndefined(action.operation) ?
                action.value :
                [action.value, action.operation];

        return _.merge({}, state, {
            [action.static ? 'static_filters' : 'filters']: {
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

    //
    //
    //

    VALUE_CHANGED(state, action) {
        state.rows[action.index][action.key] = action.value;

        return _.assign({}, state, {
            rows: state.rows
        }); 
    }

    UPDATE_STATE(state, action) {
        //state.rows[action.index][action.key] = action.value;

        return this._process(action.update_fn(state));

        // return _.assign({}, state, {
        //     rows: state.rows
        // }); 
    }

    //
    //
    //

    _process(state) {
        const rows = state.rows;

        //state.rows.sort((a, b) => a[state.order_col] - b[state.order_col]);
        rows.sort((a, b) => {
            const a_val = '' + _.get(a, state.order_col);
            const b_val = '' + _.get(b, state.order_col);

            const first_val = state.order_dir === 'asc' ? a_val : b_val;
            const second_val = state.order_dir === 'asc' ? b_val : a_val;

            return first_val.localeCompare(second_val);
        });

        for (var i = 0; i < rows.length; ++i) {
            rows[i]._index = i;
        }

        const page = state.rows.slice(
            (state.current_page - 1) * state.rows_per_page,
            state.current_page * state.rows_per_page
        );

        return _.assign({}, state, {
            rows,
            page
        })
    }
}

export default ClientsideGridReducer;
