import React from 'react';
import PropTypes from 'prop-types';

import TableFooter from '@material-ui/core/TableFooter';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';

import IconButton from '@material-ui/core/IconButton';
import Icon from  '@material-ui/core/Icon';
import Tooltip from '@material-ui/core/Tooltip';


class Pagination extends React.Component {
    render() {
        const c = this;
        const { controller } = c.context;

        return <TableFooter>
            <TableRow>
                <TablePagination page={controller.getCurrentPageNumber() - 1}
                                 count={controller.getTotalRows()}
                                 rowsPerPage={controller.getRowsPerPage()}
                                 rowsPerPageOptions={[10, 15, 25, 50, 100]}
                                 labelDisplayedRows={({from, to, count}) => `${from}-${to} из ${count}`}
                                 labelRowsPerPage={'Показывать:'}
                                 onChangePage={c.onClickPage.bind(c)}
                                 onChangeRowsPerPage={c.onSetRowsPerPage.bind(c)}>
                </TablePagination>
                <td>
                    <Tooltip title="Обновить">
                        <IconButton onClick={() => controller._request()}>
                            <Icon>refresh</Icon>
                        </IconButton>
                    </Tooltip>
                </td>
            </TableRow>
        </TableFooter>;
    }

    onClickPage(e, page_n) {
        const c = this;
        const { controller } = c.context;

        if (e != null ) {
            controller.loadPage(page_n + 1);
        }
    }

    onSetRowsPerPage(e) {
        console.log(arguments);
    }
}

Pagination.contextTypes = {
    controller: PropTypes.object
};

export default Pagination;
