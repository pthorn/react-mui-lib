import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import withStyles from '@material-ui/core/styles/withStyles';

import { errors } from './errors';


const styles = {
    mediumWidth: {
        width: '250px'
    },
    fullWidth: {
        width: '100%'
    }
};


class TextField extends React.Component {
    render() {
        const c = this;
        const {
            path,
            type,
            label,
            width = 'full',
            multiLine = false,
            classes,  // injected by withStyles()
            ...rest
        } = c.props;
        const controller = c.context.controller;
        const model = controller.getModel(path);

        if (model.is('hidden')) {
            return null;
        }

        // TODO const id = path

        const editable = controller.isEditable() && !model.is('readonly');
        const valid = model.isValid() || (!model.isDirty() && !controller.state.submitted);

        // TODO
        // - generate id, InputLabel htmlFor="id", Input id="name-error"
        // - <FormHelperText/> not just for errors
        return <FormControl error={!valid}
                            disabled={!editable}
                            margin="normal"
                            className={classNames({
                                [classes.fullWidth]: width === 'full',
                                [classes.mediumWidth]: width === 'medium'
                            })} >
            <InputLabel htmlFor="name-error">
                {label}
                </InputLabel>
            <Input type={type}
                   fullWidth={width === 'full'}
                   multiline={multiLine}
                   value={model.getViewValue()}
                   onChange={c.onChange.bind(c)}
                   {...rest} />
            {valid ? null : errors(model)}
        </FormControl>
    }

    onChange(e) {
        const c = this;
        const { path } = c.props;

        c.context.controller.valueChanged(path, e.target.value);
    }
}

TextField.propTypes = {
    path: PropTypes.string.isRequired,
    type: PropTypes.string,
    label: PropTypes.string,
    width: PropTypes.oneOf(['medium', 'full']),
    multiLine: PropTypes.bool
};

TextField.contextTypes = {
    controller: PropTypes.object
};

export default withStyles(styles)(TextField);
