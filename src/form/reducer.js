import _ from 'lodash';

import { Model } from 'persistent-models';

import BaseReducer from '../controller/base-reducer';
import modes from './modes';


class FormReducer extends BaseReducer {
    EDIT_NEW(state, action) {
        let new_state = this.INITIAL();
        new_state.mode = modes.EDITING;

        if (action.initial_data) {
            new_state.data = this.controller.getModel(new_state.data, "").reduce(api =>
                api.setModelValue(action.initial_data));
        }

        return new_state;
    }

    LOADING(state, action) {
        return Object.assign({}, state, {
            mode: modes.LOADING,
            entity_id: action.entity_id//,
            // TODO data: null
        });
    }

    LOAD_SUCCESS(state, action) {
        return {
            mode: modes.EDITING,
            entity_id: action.entity_id,
            dirty: false,
            submitted: false,
            data: this.controller.getModel(state.data, "").reduce(api => {
                api.setModelValue(action.data);

                const reduceAfterLoaded = this.controller.options.reduceAfterLoaded;
                if (reduceAfterLoaded) {
                    reduceAfterLoaded.call(this.controller, api, action);
                }
            }),
            files_to_upload: {}
        };
    }

    LOAD_FAILED(state, action) {
        return Object.assign({}, state, {
            mode: modes.LOAD_ERROR,
            error: action.error
        });
    }

    SUBMIT_REQUESTED(state, action) {
        return Object.assign({}, state, {
            submitted: true
        });
    }

    SUBMITTING(state, action) {
        return Object.assign({}, state, {
            mode: modes.SAVING
        });
    }

    SUBMIT_SUCCESS(state, action) {
        return Object.assign({}, state, {
            mode: modes.EDITING
        });
    }

    SUBMIT_FAILED(state, action) {
        return Object.assign({}, state, {
            mode: modes.EDITING
        });
    }

    VALUE_CHANGED(state, action) {
        return Object.assign({}, state, {
            dirty: true,
            data: this.controller.getModel(state.data, action.path).reduce(api => {
                api.setViewValue(action.new_view_val);

                const reduceAfterValueChanged = this.controller.options.reduceAfterValueChanged;
                if (reduceAfterValueChanged) {
                    reduceAfterValueChanged.call(this.controller, api, action);
                }
            })
        });
    }

    LIST_ITEM_ADDED(state, action) {
        const model = this.controller.getModel(state.data, action.path);
        const new_data = model.reduce(api => {
            api.add();
            api.forChild(`${api.size()-1}`).setViewValue(action.new_view_val);

            const reduceAfterValueChanged = this.controller.options.reduceAfterValueChanged;
            if (reduceAfterValueChanged) {
                reduceAfterValueChanged.call(this.controller, api, action);
            }
        });

        return Object.assign({}, state, {
            dirty: true,
            data: new_data
        });
    }

    LIST_ITEM_REMOVED(state, action) {
        const model = this.controller.getModel(state.data, action.path);
        const new_data = model.reduce(api => {
            api.filter(subapi => subapi.forChild('id').getViewValue() !== action.val_to_remove);

            const reduceAfterValueChanged = this.controller.options.reduceAfterValueChanged;
            if (reduceAfterValueChanged) {
                reduceAfterValueChanged.call(this.controller, api, action);
            }
        });

        return Object.assign({}, state, {
            dirty: true,
            data: new_data
        });
    }

    ADD_FILE_TO_UPLOAD(state, action) {
        return _.merge({}, state, {
            files_to_upload: {
                [action.path]: action.file_spec
            }
        });
    }

    REMOVE_FILE_TO_UPLOAD(state, action) {
        return Object.assign({}, state, {
            files_to_upload: _.omit(state.files_to_upload, action.path)
        });
    }

    FILE_UPLOADED(state, action) {
        let new_state = this.REMOVE_FILE_TO_UPLOAD(state, {
            path: action.path
        });

        new_state = this.VALUE_CHANGED(new_state, {
            path: action.path,
            new_view_val: action.id
        });

        return new_state;
    }

    INITIAL() {
        return {
            mode: modes.OFF,
            entity_id: null,
            submitted: false,
            data: this.controller.model().createData(),
            files_to_upload: {}  // widget_path: file_spec
        };
    }
}

export default FormReducer;
