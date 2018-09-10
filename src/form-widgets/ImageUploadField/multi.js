import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import {
    parse_image_id, image_url, upload_url
} from './utils';
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


/** <Image data={}/> or <Image parsed_id={}/> */
class Image extends React.Component {
    render() {
        const c = this;
        const { parsed_id, data, config, onClick, isSelected } = c.props;

        const src = parsed_id ?
            image_url(parsed_id, config.prefix, config.thumb_variant) :
            data;

        return <img src={src}
                    width={config.thumb_size[0]}
                    height={config.thumb_size[1]}
                    alt=""
                    className={cx({selected: isSelected})}
                    onClick={onClick} />;
    }
}


class MultiImageField extends React.Component {
    constructor() {
        super();

        this.state = {
            previews: [],
            selected: null
        };
    }

    render() {
        const c = this;
        const { path } = c.props;
        const { controller } = c.context;

        const model_value = controller.getModel(path).getViewValue();  // list
        //console.log('model_value', model_value);

        const parsed_ids = model_value.map(el => {
            const id = el[c.config.image_id_field];
            if (id === 'PENDING') {
                return undefined;
            } else {
                return parse_image_id(id);
            }
        });

        const images = parsed_ids.map((id, n) => {
            if (id === undefined) {
                return <Image key={n}
                              data={c.state.previews[n] === undefined ? null : c.state.previews[n].data}
                              config={c.config}
                              isSelected={c.state.selected === n}
                              onClick={c.onImageClicked.bind(c, n)}/>;
            } else {
                return <Image key={n}
                              parsed_id={id}
                              config={c.config}
                              isSelected={c.state.selected === n}
                              onClick={c.onImageClicked.bind(c, n)}/>;
            }
        });

        return <div className="image-field">
            {images}
            <Empty config={c.config}
                   onClick={() => c.refs.file_input.triggerFileSelect()}/>
            <FileInput ref="file_input"
                       multiple={true}
                       onFileSelected={c.onFileSelected.bind(c)}/>
        </div>;
    }

    onFileSelected(files) {
        const c = this;
        const { path } = c.props;
        const { controller } = c.context;

        _.each(files, file => {
            console.log('onFileSelected:', file);

            // preview the image

            const reader = new FileReader();

            reader.onload = function (e) {
                console.log('onload', e);

                controller.listItemAdded(path, {
                    [c.config.image_id_field]: 'PENDING'
                });

                const n = controller.getModel(path).size() - 1;

                c.state.previews[n] = {
                    file,
                    data: reader.result
                };
                c.setState({
                    previews: c.state.previews
                });

                controller.addFileToUpload({
                    file,
                    upload_url: upload_url(c.config),
                    id_model_path: `${path}.${n}.${c.config.image_id_field}`
                });
            };

            reader.onerror = function (e) {
                console.log('onerror', e, reader.readyState);  // TODO
            };

            reader.onabort = function (e) {
                console.log('onabort', e, reader.readyState);  // TODO
            };

            reader.readAsDataURL(file);
        });
    }

    onImageClicked(n) {
        const c = this;
        const { onImageSelected } = c.props;

        c.setState({
            selected: n
        });

        onImageSelected && onImageSelected(n);
    }

    init(props) {
        const { config } = props;

        this.config = _.extend({
            prefix:         '/store',
            category:       'images',
            image_id_field: 'id',

            thumb_size:     [125, 125],
            thumb_variant:  undefined,
            large_variant:  undefined,

            upload_params:  {},
            file_param:     'file',

            enable_delete:  true
        }, config);

        if (this.config.thumb_variant === undefined) {
            const size = this.config.thumb_size;
            this.config.thumb_variant = `${size[0]}x${size[1]}`;
        }
    }

    componentWillMount() {
        this.init(this.props);
    }

    componentWillReceiveProps(props) {
        // TODO if cnanged?
        this.init(props);
    }
}

MultiImageField.propTypes = {
    path: PropTypes.string.isRequired,
    config: PropTypes.object,
    onImageSelected: PropTypes.func
};

MultiImageField.contextTypes = {
    controller: PropTypes.object
};

export default MultiImageField;
