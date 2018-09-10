import _ from 'lodash';

import registry from '../registry';
import BaseController from '../controller/base-controller';
import ListReducer from './reducer';


class ListController extends BaseController {
    constructor(options) {
        const opts = _.extend({}, options, {
            //entity_name
            //state_prefix,
            Reducer: ListReducer,
            filters: {}, // key: value or key: [value, operation]
            order_col: 'id',
            order_dir: 'asc'
        }, options);

        super(opts.entity_name, opts.state_prefix, opts.Reducer);

        this.options = opts;
    }

    //
    // helpers
    //

    //
    // actions
    //

    load() {
        this.dispatch({
            type: 'LOADING'
        });

        registry.get('rest_client').getList(
            this.options.entity_name, {
                filters: this.options.filters,
                order: {
                    col: this.options.order_col,
                    dir: this.options.order_dir
                }
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

            registry.get('message_controller').showException(
                'Ошибка загрузки', error
            );
        });
    }

    needsRefresh() {
        this.dispatch({
            type: 'REFRESH_REQUIRED',
        });
    }

    loadIfNeeded() {
        if (this.state.refresh_required) {
            this.load();
        }
    }

    setOrderColumn() {
        // TODO
    }

    hasPagination() {
        return false;
    }
}

export default ListController;
