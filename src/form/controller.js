import _ from 'lodash';
import { getModel } from 'persistent-models';

import registry from '../registry';
import BaseController from '../controller/base-controller';

import FormReducer from './reducer';
import FormDelegate from './delegate';
import modes from './modes';


class FormController extends BaseController {
    constructor(options) {
        const opts = _.extend({}, options, {
            //schema
            //entity_name
            //state_prefix,
            //reduceAfterLoaded,
            //reduceAfterValueChanged,
            Reducer: FormReducer,
            Delegate: FormDelegate
        }, options);

        super(opts.entity_name, opts.state_prefix, opts.Reducer);

        this.options = opts;
        this.model = getModel(opts.schema);
        this.entity_name = opts.entity_name;
        this._delegate = new opts.Delegate(this);
    }

    get delegate() {
        return this._delegate;
    }

    getModel(data, path) {
        if (arguments.length === 0) {
            return this.model(this.state.data);
        } else if (arguments.length === 1) {
            return this.model(this.state.data, arguments[0]);
        } else if (arguments.length === 2) {
            return this.model(data, path);
        } else {
            throw new Error('FormController.getModel(): expected 0, 1 or 2 arguments');
        }
    }

    //
    // state queries
    //

    isEditable() {
        return this.state.mode === modes.EDITING;
    }

    //
    // initialize form
    //

    editNew(initial_data) {
        this.dispatch({
            type: 'EDIT_NEW',
            initial_data
        });
    }

    editExisting(entity_id) {
        this.dispatch({
            type: 'LOADING',
            entity_id
        });

        registry.get('rest_client').getEntityById(
            this.entity_name,
            entity_id
        ).then(json => {
            this.dispatch({
                type: 'LOAD_SUCCESS',
                entity_id,
                data: json.data
            });
        }, error => {
            this.dispatch({
                type: 'LOAD_FAILED',
                error
            });

            registry.get('message_controller').showException('Ошибка загрузки', error);
        });
    }

    //
    // submit form
    //

    submit(action) {
        const c = this;
        const message_controller = registry.get('message_controller');
        const model = this.getModel();

        this.dispatch({
            type: 'SUBMIT_REQUESTED'
        });

        if (!model.isValid()) {
            console.log('Form is invalid:', model.getErrors());
            return;
        }

        return this._uploadFiles().then(
            () => c._submitForm(action),
            error => {
                console.log('file upload failed: ', error);
                message_controller.showException('Ошибка загрузки файлов', error);
            }
        );
    }

    _uploadFiles() {
        const c = this;
        const rest_client = registry.get('rest_client');

        // lodash.map() can iterate over objects, not just arrays
        return Promise.all(_.map(c.state.files_to_upload, file_spec => {
            console.log('uploading file', file_spec.file.name,
                'for path', file_spec.id_model_path);

            return rest_client.request({
                send_as: 'formdata',
                method: 'POST',
                url: file_spec.upload_url,
                data: {
                    file: file_spec.file
                }
            }).then(json => {
                console.log('file uploaded for path', file_spec.id_model_path,
                    'id:', json.data.id);

                c.dispatch({
                    type: 'FILE_UPLOADED',
                    path: file_spec.id_model_path,
                    id: json.data.id
                });
            });
        }));
    }

    _submitForm(action) {
        const c = this;
        const model = this.getModel();
        const rest_client = registry.get('rest_client');
        const message_controller = registry.get('message_controller');

        c.dispatch({
            type: 'SUBMITTING'
        });

        const promise = c.state.entity_id ?
            rest_client.updateEntityForId(
                c.entity_name,
                c.state.entity_id,
                model.getNetworkValue()
            ) :
            rest_client.createEntity(
                c.entity_name,
                model.getNetworkValue()
            );

        return promise.then(
            json => {
                this.dispatch({
                    type: 'SUBMIT_SUCCESS',
                    data: json
                });

                message_controller.showInfo('Изменения сохранены');
                c.delegate.didSubmit(json, action);
                return json;
            },
            error => {
                this.dispatch({
                    type: 'SUBMIT_FAILED',
                    error
                });

                message_controller.showException('Ошибка сохранения', error);
                // TODO c.delegate.submitFailed(error);
            }
        );
    }

    //
    // widget actions
    //

    valueChanged(path, new_view_val) {
        this.dispatch({
            type: 'VALUE_CHANGED',
            path,
            new_view_val
        });
    }

    listItemAdded(path, new_view_val) {
        this.dispatch({
            type: 'LIST_ITEM_ADDED',
            path,
            new_view_val
        });
    }

    listItemRemoved(path, val_to_remove) {
        this.dispatch({
            type: 'LIST_ITEM_REMOVED',
            path,
            val_to_remove
        });
    }

    //
    // file upload actions
    //

    /**
     * file_spec: {
     *     file: File object,
     *     upload_url: '/store/category',
     *     'id_model_path': 'xxx.yyy.zzz'
     * }
     */
    addFileToUpload(file_spec) {
        this.dispatch({
            type: 'ADD_FILE_TO_UPLOAD',
            path: file_spec.id_model_path,
            file_spec
        });
    }

    removeFileToUpload(id_model_path) {
        this.dispatch({
            type: 'REMOVE_FILE_TO_UPLOAD',
            path: id_model_path
        });
    }
}


export default FormController;
