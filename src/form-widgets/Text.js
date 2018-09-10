import React from 'react';
import PropTypes from 'prop-types';


class Text extends React.Component {
    render() {
        const c = this;
        const { path, ...etc } = c.props;
        const controller = c.context.controller;
        const model = controller.getModel(path);

        return <span {...etc}>
            {model.getViewValue()}
        </span>;
    }
}

Text.propTypes = {
    path: PropTypes.string.isRequired
};

Text.contextTypes = {
    controller: PropTypes.object
};


export default Text;
