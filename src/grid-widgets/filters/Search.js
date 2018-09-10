import React from 'react';
import PropTypes from 'prop-types';
import Input from '@material-ui/core/Input';
import { withStyles } from '@material-ui/core/styles';

import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';


const ENTER = 13;


const SmallIconButton = withStyles({
    root: {
        width: 'auto',
        height: 'auto'
    }
})(IconButton);


class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.controller.getSearch()
        };
    }

    render() {
        const c = this;
        const { classes } = c.props;
        const { value } = c.state;

        return <div className={classes.root}>
            <Input placeholder="Поиск"
                   value={value}
                   onChange={c.onChange.bind(c)}
                   inputProps={{
                       onKeyDown: c.onKeyDown.bind(c)
                   }}/>
                <SmallIconButton onClick={c.onApply.bind(c)}
                            disabled={!value}>
                    <SearchIcon/>
                </SmallIconButton>
                <SmallIconButton onClick={c.onReset.bind(c)}
                            disabled={!value}>
                    <ClearIcon/>
                </SmallIconButton>
        </div>;
    }

    onChange(e) {
        const c = this;
        const value = e.target.value;

        c.setState({value: value});
    }

    onApply() {
        const c = this;
        const { controller } = c.props;
        const { value } = c.state;

        controller.setSearch(value);
    }

    onReset() {
        const c = this;
        const { controller } = c.props;

        c.setState({value: ''});
        controller.setSearch('');
    }

    onKeyDown(e) {
        const c = this;
        const { value } = c.state;

        if(e.keyCode === ENTER && value) {
            c.onApply();
        }
    }
}

Search.propTypes = {
    classes: PropTypes.object
};

export default withStyles({
    root: {
        marginRight: '16px'
    }
})(Search);
