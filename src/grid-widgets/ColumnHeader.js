import React from 'react';

import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';


class ColumnHeader extends React.Component {
    render() {
        const c = this;
        const { col_config, controller } = c.props;
        const { order_col, order_dir } = controller.state;

        const key = col_config.sort_key || col_config.key;

        return <TableCell>
            <TableSortLabel active={order_col === key}
                            direction={order_dir}
                            onClick={c.onClick.bind(c, key)}>
                {col_config.label || key}
            </TableSortLabel>
        </TableCell>;
    }

    onClick(column) {
        if (!column) {
            return;
        }

        const { controller } = this.props;
        controller.setOrderColumn(column);
    }
}

export default ColumnHeader;
