import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Checkbox from '@material-ui/core/Checkbox';
import withStyles from '@material-ui/core/styles/withStyles';

import ColumnHeader from './ColumnHeader';
import Pagination from './Pagination';


function Cell({row, col_config}) {
    const { key } = col_config;
    // key can be a dotted string or a list
    // (see https://lodash.com/docs#get)
    const val = _.get(row, key);

    // TODO grid={p.grid}
    if (col_config.template) {
        return <TableCell>
            <col_config.template
              val={val}
              row={row}
              col_config={col_config} />
        </TableCell>;
    } else {
        return <TableCell>
            {val}
        </TableCell>;
    }
}


/**
 * const controller = new GridController();
 * <Grid controller={controller} />
 */
export class Grid extends React.Component {
    render() {
        const {
            controller,
            columns,
            padding = "none",
            minWidth = 700,
            enableSelection = false,
            isRowSelected, isRowDisabled,
            onRowCheckboxChanged,
            onHeaderCheckboxChanged
        } = this.props;

        if (controller.isLoading()) {
            return <h2>Загрузка...</h2>;
        }

        if (controller.hasError()) {
            return <h2>Ошибка загрузки</h2>;
        }

        if (!controller.hasData()) {
            return null; // TOSO ???
        }

        const rows = controller.getRowsForDisplay();

        return <div style={{width: '100%', overflowX: 'auto'}}> 
            <Table padding={padding} style={{minWidth}}>
                <TableHead>
                    <TableRow>
                        {enableSelection &&
                            <TableCell padding="checkbox">
                                <Checkbox checked={false}
                                        disabled={true}
                                        onChange={onHeaderCheckboxChanged}/>
                            </TableCell>
                        }
                        {columns.map((col_config, key) =>
                            (col_config.include_if || col_config.include_if === undefined) &&
                            <ColumnHeader key={key}
                                          col_config={col_config}
                                          controller={controller} />
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, key) => <TableRow key={key}>
                        {enableSelection &&
                            <TableCell padding="checkbox">
                                <Checkbox checked={isRowSelected(row)}
                                        disabled={isRowDisabled(row)}
                                        onChange={onRowCheckboxChanged.bind(null, row)} />
                            </TableCell>
                        }
                        {columns.map((col_config) =>
                            (col_config.include_if || col_config.include_if === undefined) &&
                            <Cell key={col_config.key}
                                  row={row}
                                  col_config={col_config} />
                        )}
                    </TableRow>)}
                </TableBody>
                {controller.hasPagination() &&
                    <Pagination />
                }
            </Table>
        </div>;
    }

    getChildContext() {
        return {
            controller: this.props.controller
        };
    }
}

Grid.propTypes = {
    controller: PropTypes.object.isRequired,
    columns: PropTypes.array.isRequired,
    padding: PropTypes.string,
    minWidth: PropTypes.number,
    enableSelection: PropTypes.bool,
    isRowSelected: PropTypes.func,
    isRowDisabled: PropTypes.func,
    onRowCheckboxChanged: PropTypes.func,
    onHeaderCheckboxChanged: PropTypes.func,
};

Grid.childContextTypes = {
    controller: PropTypes.object
};


const StretchTypography = withStyles({
    root: {
        flex: '1 0'
    }
})(Typography);


function GridCard(props) {
    return <Card>
        <CardContent>
            <Toolbar>
                <StretchTypography variant="headline" component="h2">
                    {props.title}
                </StretchTypography>
                {props.children}
            </Toolbar>
            <Grid {...props} />
        </CardContent>
    </Card>;
}


// TODO!
//export default Grid;
export default connect(
    /* mapStateToProps */ state => ({
        state__: state
    }),
    /* mapDispatchToProps */ state => ({
    })
)(GridCard);
