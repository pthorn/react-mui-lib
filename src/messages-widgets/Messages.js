import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import ClearIcon from '@material-ui/icons/Clear';
import ErrorIcon from '@material-ui/icons/Error';
import CheckIcon from '@material-ui/icons/Check';

import registry from '../registry';
import './messages.css';


const styles = {
    closeButton: {
        position: 'absolute',
        top: '4px',
        right: '4px'
    },
    normalAvatar: {
    },
    errorAvatar: {
        backgroundColor: 'red'
    }
};


class Messages extends React.Component {
    render() {
        const c = this;
        const { data, classes } = c.props;

        const render_exception = exception => {
            if (exception.json_response && exception.json_response.exception) {
                const server_exc = exception.json_response.exception;

                return <CardContent>
                    <h4>{server_exc.name}</h4>
                    <p><code>{server_exc.message}</code></p>
                    <p><code>{server_exc.statement}</code></p>
                    <ul>
                        {_.map(server_exc.params,
                            (param, key) => <li key={key}>
                                {key}: {JSON.stringify(param)}
                                </li>
                        )}
                    </ul>
                </CardContent>;
            } else {
                return <CardContent>
                    <h4>{exception.message}</h4>
                    <p>{exception.name} ({exception.reason})</p>
                </CardContent>;
            }
        };

        const avatar = message => {
            const Icon = message.type === 'error' ?
                ErrorIcon :
                CheckIcon;
            const className = message.type === 'error' ?
                classes.errorAvatar :
                classes.normalAvatar;

            return <Avatar className={className}>
                <Icon/>
            </Avatar>;
        };

        // TODO change CardHeader title color for error messages

        return <div id="messages">
            <ul>
                {data.dialog_messages.map((msg, key) => <li key={key}>
                    <Card>
                        <CardHeader avatar={avatar(msg)}
                                    title={msg.title}
                                    subheader={msg.text} />
                        <IconButton onClick={c.onClick.bind(c, msg)}
                                    className={classes.closeButton}>
                            <ClearIcon/>
                        </IconButton>
                        {msg.exception && render_exception(msg.exception)}
                    </Card>
                </li>)}
            </ul>
        </div>;
    }

    onClick(message, e) {
        e.preventDefault();
        registry.get('message_controller').remove(message);
    }
}

Messages.propTypes = {
    data: PropTypes.object.isRequired,
};

export default connect(
    /* mapStateToProps */ state => ({
        data: state.messages
    }),
    /* mapDispatchToProps */ state => ({
    })
)(withStyles(styles)(Messages));
