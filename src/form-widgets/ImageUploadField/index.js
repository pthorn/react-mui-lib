import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import Icon from  '@material-ui/core/Icon';
import Tooltip from '@material-ui/core/Tooltip';
import withStyles from '@material-ui/core/styles/withStyles';

import { parse_image_id, image_url } from './utils';
import { errors } from '../errors';

import './ImageUploadField.css';


class FileInput extends React.Component {
    render() {
        const c = this;
        const { config } = c.props;

        // multiple={config.multiple}
        return <input type="file"
            accept={config.accept}
            multiple={false}
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


function Empty({ config, onClick }) {
    return <div className="empty"
                style={{width: config.thumb_size[0], height: config.thumb_size[1]}}
                onClick={onClick}>
        <p>Загрузить файл</p>
    </div>;
}


const ImagePreview = withStyles({
    container: {
        display: 'flex',
        alignItems: 'start'
    },
    img: {
        display: 'inline-block',  // force nonzero size when image is 404
        objectFit: 'contain',
        border: '1px solid #666',
        cursor: 'pointer'
    },
    buttons: {
        width: '48px'
    }
})(function ImagePreview({ parsed_id, data, config, onDisplayLarge, onReplace, onDelete, classes }) {
    let src;
    if (data) {
        // local preview
        src = data;
    } else {
        // remote preview
        src = image_url(parsed_id, config.prefix, config.thumb_variant);
    }

    return <div className={classes.container}>
        <img src={src}
            width={config.thumb_size[0]}
            height={config.thumb_size[1]}
            alt=""
            className={classes.img}
            onClick={onDisplayLarge} />
        <div className={classes.buttons}>
            <Tooltip title="Загрузить другой файл">
                <IconButton onClick={onReplace}>
                    <Icon>edit</Icon>
                </IconButton>
            </Tooltip>
            <Tooltip title="Удалить файл">
                <IconButton onClick={onDelete}>
                    <Icon>delete</Icon>
                </IconButton>
            </Tooltip>
        </div>
    </div>;
});


const AudioPreview = withStyles({
    container: {
        display: 'flex',
        alignItems: 'start'
    },
    buttons: {
    }
})(function AudioPreview({ parsed_id, data, config, onReplace, onDelete, classes }) {
    let src;
    if (data) {
        // local preview
        src = data;
    } else {
        // remote preview
        src = image_url(parsed_id, config.prefix); // TODO , config.thumb_variant);
    }

    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/source
    // <audio> does not update its UI when <source src> is changed!
    //   https://github.com/facebook/react/issues/9447

    return <div className={classes.container}>
        <audio controls
               preload="metadata"
               src={src}
               style={{width: '300px'}}>
            Your browser does not support the audio element.
        </audio>
        <div className={classes.buttons}>
            <Tooltip title="Загрузить другой файл">
                <IconButton onClick={onReplace}>
                    <Icon>edit</Icon>
                </IconButton>
            </Tooltip>
            <Tooltip title="Удалить файл">
                <IconButton onClick={onDelete}>
                    <Icon>delete</Icon>
                </IconButton>
            </Tooltip>
        </div>
    </div>;
});


function Preview({ parsed_id, data, config, onDisplayLarge, onReplace, onDelete }) {
    let PreviewImpl;
    if (config.type === 'audio') {
        PreviewImpl = AudioPreview;
    } else if (config.type === 'image') {
        PreviewImpl = ImagePreview;
    } else {
        // TODO ?
    }

    return <PreviewImpl parsed_id={parsed_id}
                        data={data}
                        config={config}
                        onDisplayLarge={onDisplayLarge}
                        onReplace={onReplace}
                        onDelete={onDelete} />;
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

            if (parsed_id || c.state.image_data) {
                // display either server image (parsed_id) or local image
                // selected for upload (image_data)
                return <Preview parsed_id={parsed_id}
                                data={c.state.image_data}
                                config={c.config}
                                onDisplayLarge={() => null}
                                onReplace={() => c.refs.file_input.triggerFileSelect()}
                                onDelete={() => {
                                    controller.valueChanged(path, '');
                                    controller.removeFileToUpload(path);
                                    c.setState({
                                        image_data: null
                                    });
                                }} />;
            } else {
                return <Empty config={c.config}
                              onClick={() => c.refs.file_input.triggerFileSelect()}/>;
            }
        };

        return <FormControl disabled={!editable}
                            error={!valid}>
            <FormLabel>{label}</FormLabel>
                <div className="image-field">
                    {image()}
                    {valid ? null : errors(model)}
                    <FileInput ref="file_input"
                               config={c.config}
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

        const get_accept = type => {
            if (type === 'image')
                return 'image/*';
            else if (type === 'audio')
                return 'audio/*';
            else
                return '*/*';
        }

        this.config = _.extend({
            type:           'image',  // file, image, audio
        }, config);

        this.config = _.extend({
            accept:          get_accept(this.config.type),

            // upload parameters
            prefix:         '/store',
            category:       'images',
            file_param:     'file',
            upload_params:  {},

            // preview
            thumb_size:     [125, 125],
            thumb_variant:  '125x125',
            large_variant:  undefined,

            enable_delete:  true
        }, this.config);
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
