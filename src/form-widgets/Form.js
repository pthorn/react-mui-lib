import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';

import modes from '../form/modes';
import SubmitButton from './SubmitButton';


/**
 * const controller = new FormController();
 * <Form controller={controller} />
 */
class Form extends React.Component {

    render() {
        const c = this;
        const {
            controller,
            title_new, title_edit,
            show_submit_btn = true,
            actions = [],
            actions_new = [],
            actions_edit = []
        } = c.props;
        const { mode, entity_id } = controller.state;

        const title = entity_id ? title_edit : title_new;
        const show_fields = mode === modes.EDITING || mode === modes.SAVING;

        let children = null;
        if (show_fields) {
            children = this.props.children;
        } else if (mode === modes.LOADING) {
            children = "Загрузка..."; // TODO spinner
        } else if (mode === modes.LOAD_ERROR) {
            children = "Ошибка загрузки"; // TODO widget
        }

        const actions_to_display = actions.concat(
            controller.state.entity_id ? actions_edit : actions_new
        );

        return <form className="Form">
            <Card>
                <CardContent>
                    {title &&
                        <Typography variant="headline" component="h2">
                            {title}
                        </Typography>
                    }

                    {children}
                </CardContent>
                { show_fields &&
                    <CardActions>
                        {show_submit_btn &&
                            <SubmitButton/>
                        }
                        {actions_to_display}
                    </CardActions>
                }
            </Card>
        </form>;
    }

    getChildContext() {
        return {
            controller: this.props.controller
        };
    }
}

Form.propTypes = {
    controller: PropTypes.object.isRequired,
    title_new: PropTypes.string,
    title_edit: PropTypes.string,
    actions: PropTypes.array,
    actions_new: PropTypes.array,
    actions_edit: PropTypes.array,
    show_submit_btn: PropTypes.bool
};

Form.childContextTypes = {
    controller: PropTypes.object
};


// TODO!
//export default Form;
export default connect(
    /* mapStateToProps */ state => ({
        state__: state
    }),
    /* mapDispatchToProps */ state => ({
    })
)(Form);
