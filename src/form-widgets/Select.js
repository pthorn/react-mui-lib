import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MuiSelect from '@material-ui/core/Select';
import MenuItem from "@material-ui/core/MenuItem";
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


class Select extends React.Component {
    render() {
        const c = this;
        const {
            path,
            options,
            label,
            showEmptyOption = true,
            emptyOptionLabel = "",
            classes  // injected by withStyles()
        } = c.props;
        const { controller } = c.context;
        const model = controller.getModel(path);

        if (model.is('hidden')) {
            return null;
        }

        const editable = controller.isEditable() && !model.is('readonly');
        const valid = model.isValid() || (!model.isDirty() && !controller.state.submitted);

        // TODO
        // - generate id, InputLabel htmlFor="id", Input id="name-error"
        // - <FormHelperText/> not just for errors
        return <FormControl disabled={!editable}
                            error={!valid}
                            fullWidth={false}
                            margin="normal"
                            className={classes.mediumWidth}>
            <InputLabel htmlFor="name-error">
                {label}
            </InputLabel>
            <MuiSelect displayEmpty={showEmptyOption}
                       value={model.getViewValue()}
                       onChange={c.onChange.bind(c)}>
                { showEmptyOption &&
                    <MenuItem key="" value="">
                        {emptyOptionLabel}
                    </MenuItem>
                }
                { options.map(option =>
                    <MenuItem key={option.val}
                              value={option.val}>
                        {option.label}
                    </MenuItem>
                )}
            </MuiSelect>
            {valid ? null : errors(model)}
        </FormControl>
    }

    onChange(e) {
        const c = this;
        const { path } = c.props;
        const { controller } = c.context;

        controller.valueChanged(path, e.target.value);
    }
}

Select.propTypes = {
    path: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    label: PropTypes.string,
    showEmptyOption: PropTypes.bool,
    emptyOptionLabel: PropTypes.string
};

Select.contextTypes = {
    controller: PropTypes.object
};

export default withStyles(styles)(Select);
