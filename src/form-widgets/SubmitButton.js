import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';


class SubmitButton extends React.Component {
    render() {
        const c = this;
        const {
            action = '',  // remove from etc
            label = '',
            createLabel = 'Создать',
            updateLabel = 'Сохранить',
            ...etc
        } = c.props;
        const { controller } = c.context;

        const l = label ? label :
            (controller.state.entity_id ? updateLabel : createLabel);

        return <Button variant="contained"
                       color="primary"
                       disabled={!controller.isEditable()}
                       onClick={c.onClick.bind(c)}
                       {...etc}>
            {l}
        </Button>;
    }

    onClick(e) {
        const c = this;
        const {
            action = ''
        } = c.props;

        e.preventDefault();
        c.context.controller.submit(action);
    }
}

SubmitButton.propTypes = {
    action: PropTypes.string,  // passed to submit handler
    label: PropTypes.string,
    createLabel: PropTypes.string,
    updateLabel: PropTypes.string
};

SubmitButton.contextTypes = {
    controller: PropTypes.object
};

export default SubmitButton;
