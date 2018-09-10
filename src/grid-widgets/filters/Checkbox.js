import React from 'react';
import PropTypes from 'prop-types';
import MuiCheckbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';


class Checkbox extends React.Component {
    constructor(props) {
        const { controller, name } = props;
        super(props);
    }

    render() {
        const c = this;
        const { label, classes, controller, name } = c.props;
        const value = controller.getFilter(name);

        console.log('Checkbox render: value %s', value);

        return <div className={classes.root}>
            <MuiCheckbox checked={value === undefined ? false : value}
                         indeterminate={value === undefined}
                         onChange={c.onChange.bind(c)} />
            {label}
        </div>;
    }

    onChange(e, val) {
        const c = this;
        const { controller, name } = c.props;

        const value = e.target.value;

        console.log('Checkbox onChange: value:', value, val);

        const filter_value = controller.getFilter(name);

        if (filter_value === undefined) {
            controller.setFilter(name, true);
        } else if (filter_value === true) {
            controller.setFilter(name, false);
        } else {
            controller.clearFilter(name);
        }
    }
}

Checkbox.propTypes = {
    controller: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    classes: PropTypes.object
};

export default withStyles({
    root: {
        marginRight: '16px'
    }
})(Checkbox);
