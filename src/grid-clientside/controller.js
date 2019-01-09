import BaseController from "react-mui-lib/controller/base-controller";
import registry from 'react-mui-lib/registry';
import ClientsideGridReducer from './reducer';
import modes from "./modes";


class ClientsideGridController extends BaseController {
    constructor(options) {
        const opts = Object.assign({}, options, {
            //entity_name
            //state_prefix,
            Reducer: ClientsideGridReducer,
            rows_per_page: 25,
            default_order_col: 'id',
            default_order_dir: 'asc'
        }, options);

        super(opts.entity_name, opts.state_prefix, opts.Reducer);

        this.options = opts;
    }

    hasData() {
        return this.state.mode === modes.DATA || this.state.mode === modes.DATA_OLD;
    }

    isLoading() {
        return this.state.mode === modes.LOADING;
    }

    hasError() {
        return this.state.mode === modes.LOAD_ERROR;
    }

    getRowsForDisplay() {
        return this.state.page;
    }

    //
    // pagination
    //

    hasPagination() {
        return true;
    }

    getTotalRows() {
        return this.state.total_rows;
    }

    getCurrentPageNumber() {
        return this.state.current_page;
    }

    getNumberOfPages() {
        return (this.state.total_rows | 0) / (this.state.rows_per_page | 0) + 1 ;
    }

    loadPage(page_n) {
        this.dispatch({
            type: 'SET_PAGE',
            page_n
        });
    }

    //
    // rows per page
    //

    getRowsPerPage() {
        return this.state.rows_per_page;
    }

    setRowsPerPage(rows_per_page) {
        this.loadPage();
    }

    //
    // refresh
    //

    load() {
        this._request();
    }

    needsRefresh() {
        this.dispatch({
            type: 'NEEDS_REFRESH'
        });
    }

    loadIfNeeded() {
        const state = this.state;

        if (state.mode === modes.EMPTY || state.mode === modes.DATA_OLD) {
            this._request();
        }
    }

    //
    // filters
    //

    /**
     * @return filter value or undefined if filter is not set
     */
    getFilter(name) {
        return this.state.filters[name];
    }

    setFilter(key, value, operation) {
        this.dispatch({
            type: 'SET_FILTER',
            key,
            value,
            operation,
            static: false
        });
    }

    setStaticFilter(key, value, operation) {
        this.dispatch({
            type: 'SET_FILTER',
            key,
            value,
            operation,
            static: true
        });
    }

    clearFilter(key) {
        this.dispatch({
            type: 'CLEAR_FILTER',
            key
        });
    }

    //
    // search
    //

    getSearch() {
        return this.state.search;
    }

    setSearch(value) {
        this.dispatch({
            type: 'SET_SEARCH',
            value
        });
    }

    //
    // order
    //

    setOrder(column, direction) {
        this.dispatch({
            type: 'SET_ORDER',
            column,
            direction
        });
    }

    setOrderColumn(column) {
        const state = this.state;

        if (column === state.order_col) {
            this.setOrder(column, state.order_dir === 'asc' ? 'desc' : 'asc');
        } else {
            this.setOrder(column, 'asc');
        }
    }

    //
    //
    //

    valueChanged(index, key, value) {
        const state = this.state;

        this.dispatch({
            type: 'VALUE_CHANGED',
            index: index + (state.current_page - 1) * state.rows_per_page,
            key,
            value
        });
    }

    updateState(update_fn) {
        this.dispatch({
            type: 'UPDATE_STATE',
            update_fn
        });
    }

    //
    //
    //

    _request() {
        const state = this.state;

        this.dispatch({
            type: 'LOADING'
        });

        registry.get('rest_client').getList(
            this.name,
            {
            //     start: (state.current_page - 1) * state.rows_per_page,
            //     limit: state.rows_per_page,
            //     order: {
            //         col: state.order_col,
            //         dir: state.order_dir
            //     },
                 filters: state.static_filters
            //     search: state.search
            }
        ).then(json => {
            this.dispatch({
                type: 'LOAD_SUCCESS',
                data: json
            });
        }, error => {
            this.dispatch({
                type: 'LOAD_FAILED',
                error
            });

            registry.get('message_controller').showException('Ошибка загрузки', error);
        });
    }
}

export default ClientsideGridController;
