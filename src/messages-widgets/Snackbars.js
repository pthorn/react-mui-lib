import React from 'react';
import PropTypes from 'prop-types';

import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';

import registry from '../../registry';


const styles = theme => ({
    close: {
        width: theme.spacing.unit * 4,
        height: theme.spacing.unit * 4,
    },
});


class Snackbars extends React.Component {
    constructor(props) {
        super(props);

        this.controller = registry.get('message_controller');

        this.state = {
            open: false,
            message: {},
        };
    }

    render() {
        const c = this;
        const { classes } = this.props;
        const { message, open } = this.state;

        return <Snackbar
                    key={message.key}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={open}
                    autoHideDuration={5000}
                    onClose={c.onClose}
                    onExited={c.onExited}
                    message={<span>{message.title}</span>}
                    action={[
                        /*<Button key="undo" color="secondary" size="small" onClick={this.onClose}>
                            UNDO
                        </Button>,*/
                        <IconButton key="close"
                                    color="inherit"
                                    className={classes.close}
                                    onClick={this.onClose}>
                            <CloseIcon/>
                        </IconButton>
                    ]}
        />;
    }

    processQueue = () => {
        const message = this.controller.getNextSnackbarMessage();

        if (message === null) return;

        this.setState({
            open: true,
            message
        });
    };

    onClose = (event, reason) => {
        if (reason === 'clickaway') return;

        this.setState({open: false});
    };

    onExited = () => {
        this.controller.remove(this.state.message);
        this.processQueue();
    };

    onNewMessage = () => {
        if (this.state.open) return;

        this.processQueue();
    };

    componentWillMount() {
        this.controller.on('snackbar-new-message', this.onNewMessage);
    }

    componentWillUnmount() {
        this.controller.off('snackbar-new-message', this.onNewMessage);
    }
}

Snackbars.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Snackbars);
