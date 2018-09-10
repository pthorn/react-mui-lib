import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import { errors } from './errors';


class CheckboxList extends React.Component {
    render() {
        const c = this;
        const { path, options, label } = c.props;
        const { controller } = c.context;
        const model = controller.getModel(path);

        if (model.is('hidden')) {
            return null;
        }

        const selected_option_ids = model.map(subval => subval.id.viewValue);
        const editable = controller.isEditable() && !model.is('readonly');
        const valid = model.isValid() || (!model.isDirty() && !controller.state.submitted);

        const options_html = options.map(function (option, n) {
            const disabled = option.disabled;

            const checkbox = <Checkbox
                checked={_.indexOf(selected_option_ids, option.val) !== -1}
                onChange={c.onCheck.bind(c, option.val)}
                disabled={disabled}
                value={option.val}/>;  // TODO what does the value prop do?

            return <FormControlLabel key={n}
                                     control={checkbox}
                                     label={option.label}/>;
        });

        return <FormControl component="fieldset"
                            margin="normal"
                            disabled={!editable}
                            error={!valid}>
            <FormLabel component="legend">
                {label}
            </FormLabel>
            <FormGroup>
                {options_html}
            </FormGroup>
            {valid ? null : errors(model)}
        </FormControl>;
    }

    onCheck(val, e) {
        const c = this;
        const { path } = c.props;
        const { controller } = c.context;

        if (e.target.checked) {
            controller.listItemAdded(path, {id: val});
        } else {
            controller.listItemRemoved(path, val);
        }
    }
}

CheckboxList.propTypes = {
    path: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    label: PropTypes.string
};

CheckboxList.contextTypes = {
    controller: PropTypes.object
};


export default CheckboxList;
