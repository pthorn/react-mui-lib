import React from 'react';
import PropTypes from 'prop-types';

import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

import { errors } from './errors';


class RadioList extends React.Component {
    render() {
        const c = this;
        const { path, options, label } = c.props;
        const { controller } = c.context;
        const model = controller.getModel(path);

        if (model.is('hidden')) {
            return null;
        }

        const editable = controller.isEditable() && !model.is('readonly');
        const valid = model.isValid() || (!model.isDirty() && !controller.state.submitted);

        const options_html = options.map((option, n) => {
            const disabled = !!option.disabled || !editable;

            return <FormControlLabel key={n}
                                     control={<Radio />}
                                     value={option.val}
                                     label={option.label}
                                     disabled={disabled}/>;
        });

        return <FormControl component="fieldset"
                            className={'classes.formControl'}
                            disabled={!editable}
                            error={!valid}>
            <FormLabel component="legend">
                {label}
            </FormLabel>
            <RadioGroup name={'TODO'}
                        className={'classes.group'}
                        value={model.getViewValue()}
                        onChange={c.onCheck.bind(c)}>
                {options_html}
            </RadioGroup>
            {valid ? null : errors(model)}
        </FormControl>;
    }

    onCheck(e) {
        const c = this;
        const { path } = c.props;
        const { controller } = c.context;

        controller.valueChanged(path, e.target.value);
    }
}

RadioList.propTypes = {
    path: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    label: PropTypes.string
};

RadioList.contextTypes = {
    controller: PropTypes.object
};


export default RadioList;
