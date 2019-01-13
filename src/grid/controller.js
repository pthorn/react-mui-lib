import BaseController from "../controller/base-controller";
import registry from '../registry';
import GridReducer from './reducer';
import modes from "./modes";


class GridController extends BaseController {
    constructor(options) {
        const opts = Object.assign({}, options, {
            //entity_name
            //state_prefix,
            Reducer: GridReducer,
            default_order_col: 'id',
            default_order_dir: 'asc'
        }, options);

        super(opts.entity_name, opts.state_prefix, opts.Reducer);

        this.options = opts;
    }

    //
    // API for widgets
    //

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
        return this.state.rows;
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

        this._request();
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
            operation
        });

        this._request();
    }

    clearFilter(key) {
        this.dispatch({
            type: 'CLEAR_FILTER',
            key
        });

        this._request();
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

        this._request();
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

        this._request();
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

    _request() {
        const state = this.state;

        this.dispatch({
            type: 'LOADING'
        });

        registry.get('rest_client').getList(
            this.name,
            {
                start: (state.current_page - 1) * state.rows_per_page,
                limit: state.rows_per_page,
                order: {
                    col: state.order_col,
                    dir: state.order_dir
                },
                filters: state.filters,
                search: state.search
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

export default GridController;
