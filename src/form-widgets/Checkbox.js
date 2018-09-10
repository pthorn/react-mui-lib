import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import { errors } from './errors';


class Checkbox extends React.Component {

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

        const switch_obj = <Switch checked={model.getViewValue()}
                                   onChange={c.onCheck.bind(c)}/>;

        return <FormControl disabled={!editable}
                            error={!valid}
                            margin="normal">
            <FormControlLabel control={switch_obj}
                              label={label}/>
            {valid ? null : errors(model)}
        </FormControl>;
    }

    onCheck(e) {
        const c = this;
        const { path } = c.props;

        c.context.controller.valueChanged(path, e.target.checked);
    }
}

Checkbox.propTypes = {
    path: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
};

Checkbox.contextTypes = {
    controller: PropTypes.object
};

export default Checkbox;
