import React from 'react';

import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';


class ColumnHeader extends React.Component {
    render() {
        const c = this;
        const { col_config, controller } = c.props;
        const { order_col, order_dir } = controller.state;

        const key = col_config.sort_key || col_config.key;

        // column is sortable if key or sort_key is provided and sortable: false is not set
        const sortable = col_config.sortable !== false && key !== null && key !== undefined;

        // text to display in the header
        const label = col_config.label || key;

        if (!sortable) {
            return <TableCell>{label}</TableCell>;
        }

        return <TableCell>
            <TableSortLabel active={order_col === key}
                            direction={order_dir}
                            onClick={c.onClick.bind(c, key)}>
                {label}
            </TableSortLabel>
        </TableCell>;
    }

    onClick(column) {
        const { controller } = this.props;
        controller.setOrderColumn(column);
    }
}

export default ColumnHeader;
