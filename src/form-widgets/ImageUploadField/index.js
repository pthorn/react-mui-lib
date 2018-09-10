import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import { parse_image_id, image_url } from './utils';
import { errors } from '../errors';

import './ImageUploadField.css';


class FileInput extends React.Component {
    render() {
        const c = this;
        const { multiple } = c.props;

        return <input type="file"
            accept="image/*"
            multiple={multiple}
            ref="fileInput"
            onChange={c.onChange.bind(c)} />;
    }

    onChange(e) {
        const { onFileSelected } = this.props;

        const files = [...e.target.files];
        e.target.value = null;  // reset input
        onFileSelected(files);
    }

    // API
    triggerFileSelect() {
        console.log('triggerFileSelect()');
        this.refs.fileInput.click();
    }
}


class Empty extends React.Component {
    render() {
        const c = this;
        const { config, onClick } = c.props;

        return <div className="empty"
                    style={{width: config.thumb_size[0], height: config.thumb_size[1]}}
                    onClick={onClick}>
            <p>Загрузить изображение</p>
        </div>;
    }
}


class Image extends React.Component {
    render() {
        const c = this;
        const { parsed_id, config, onClick } = c.props;

        const src = image_url(parsed_id, config.prefix, config.thumb_variant);

        return <img src={src}
                    width={config.thumb_size[0]}
                    height={config.thumb_size[1]}
                    alt=""
                    onClick={onClick} />
    }
}


class ImageField extends React.Component {
    constructor() {
        super();

        this.state = {
            image_data: null
        };
    }

    render() {
        const c = this;
        const { path, label } = c.props;
        const { controller } = c.context;

        const model = controller.getModel(path);

        if (model.is('hidden')) {
            return null;
        }

        const editable = controller.isEditable() && !model.is('readonly');
        const valid = model.isValid() || (!model.isDirty() && !controller.state.submitted);

        const image = () => {
            let parsed_id = null;
            if (model.getViewValue()) {
                try {
                    parsed_id = parse_image_id(model.getViewValue());
                } catch (e) {
                    // TODO
                }
            }

            if (parsed_id) {
                return <Image parsed_id={parsed_id}
                              config={c.config}
                              onClick={() => c.refs.file_input.triggerFileSelect()}/>;
            } else {
                return <Empty config={c.config}
                              onClick={() => c.refs.file_input.triggerFileSelect()}/>;
            }
        };

        return <FormControl disabled={!editable}
                            error={!valid}>
            <FormLabel>{label}</FormLabel>
                <div className="image-field">
                    {c.state.image_data && <img src={c.state.image_data}
                                                width={c.config.thumb_size[0]}
                                                height={c.config.thumb_size[1]}
                                                alt=""/>}
                    {!c.state.image_data && image()}
                    {valid ? null : errors(model)}
                    <FileInput ref="file_input"
                               multiple={false}
                               onFileSelected={c.onFileSelected.bind(c)} />
                </div>
        </FormControl>;
    }

    onFileSelected(files) {
        const c = this;
        const { path } = c.props;
        const { controller } = c.context;

        if (files.length !== 1) {
            throw new Error('files.length !== 1');
        }
        // _.each(files, file => {...});

        const file = files[0];
        console.log('onFileSelected:', file);

        // preview the image

        const reader = new FileReader();

        reader.onload = function (e) {
            console.log('onload', e);
            c.setState({
                image_data: reader.result
            });

            controller.valueChanged(path, 'PENDING');

            controller.addFileToUpload({
                file,
                upload_url: c.config.category ?
                    `${c.config.prefix}/${c.config.category}` :
                    c.config.prefix,
                id_model_path: path
            });
        };

        reader.onerror = function (e) {
            console.log('onerror', e, reader.readyState);
        };

        reader.onabort = function (e) {
            console.log('onabort', e, reader.readyState);
        };

        reader.readAsDataURL(file);
    }

    init(props) {
        const { config } = props;

        this.config = _.extend({
            prefix:         '/store',
            category:       'images',
            thumb_size:     [125, 125],
            thumb_variant:  '125x125',
            large_variant:  undefined,

            upload_params:  {},
            file_param:     'file',

            enable_delete:  true
        }, config);
    }

    componentWillMount() {
        this.init(this.props);
    }

    componentWillReceiveProps(props) {
        // TODO if cnanged?
        this.init(props);
    }
}

ImageField.propTypes = {
    path: PropTypes.string.isRequired,
    label: PropTypes.string
};

ImageField.contextTypes = {
    controller: PropTypes.object
};

export default ImageField;
