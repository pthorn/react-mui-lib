import React from 'react';
import PropTypes from 'prop-types';

import MuiSelect from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';


class Select extends React.Component {
    constructor(props) {
        const { controller, name } = props;

        super(props);

        this.state = {
            value: controller.getFilter(name)
        };
    }

    render() {
        const c = this;
        const { options, label } = c.props;
        let { value } = c.state;

        // controller.getFilter() returns undefined when no filter is set
        value = value === undefined ? '' : value;

        return <MuiSelect displayEmpty={true}
                          value={value}
                          onChange={c.onChange.bind(c)}>
            <MenuItem key="" value="">
                {label}
            </MenuItem>
            { options.map(option =>
                <MenuItem key={option.val}
                          value={option.val}>
                    {option.label}
                </MenuItem>
            )}
        </MuiSelect>;
    }

    onChange(e) {
        const c = this;
        const { controller, name, op } = c.props;

        const value = e.target.value;

        c.setState({value: value});

        if (value) {
            controller.setFilter(name, value, op);
        } else {
            controller.clearFilter(name);
        }
    }
}

Select.propTypes =  {
    controller: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    op: PropTypes.string,
    label: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired
};


export default Select;
