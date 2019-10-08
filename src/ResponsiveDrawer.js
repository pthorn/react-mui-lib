import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Hidden from '@material-ui/core/Hidden';
import MenuIcon from '@material-ui/icons/Menu';
import Divider from '@material-ui/core/Divider';


const drawerWidth = 240;

const styles = theme => ({
    root: {
        width: '100%',
        height: '100vh',
        //marginTop: theme.spacing.unit * 3,
        zIndex: 1,
        //overflow: 'hidden',
    },
    appFrame: {
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: '100%',
    },
    appBar: {
        position: 'absolute',
        marginLeft: drawerWidth,
        [theme.breakpoints.up('md')]: {
            width: `calc(100% - ${drawerWidth}px)`,
        },
    },
    navIconHide: {
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
    },
    drawerHeader: theme.mixins.toolbar,
    drawerPaper: {
        width: 250,
        [theme.breakpoints.up('md')]: {
            width: drawerWidth,
            position: 'relative',
            height: '100%',
        },
    },
    content: {
        backgroundColor: theme.palette.background.default,
        width: '100%',
        padding: '0',
        height: 'calc(100% - 56px)',
        marginTop: 56,
        [theme.breakpoints.up('sm')]: {
            padding: theme.spacing.unit * 3,
            height: 'calc(100% - 64px)',
            marginTop: 64,
        },
    },
    grow: {
        flexGrow: 1,
    }
});

class ResponsiveDrawer extends React.Component {
    state = {
        mobileOpen: false,
    };

    handleDrawerToggle = () => {
        this.setState({mobileOpen: !this.state.mobileOpen});
    };

    render() {
        const {title, classes, theme, drawerContent, children} = this.props;

        const drawer = (
            <div>
                <div className={classes.drawerHeader}/> {/* <- TODO logo here? */}
                <Divider />
                {drawerContent}
            </div>
        );

        return (
            <div className={classes.root}>
                <div className={classes.appFrame}>
                    <AppBar className={classes.appBar}>
                        <Toolbar>
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                onClick={this.handleDrawerToggle}
                                className={classes.navIconHide}>
                                <MenuIcon/>
                            </IconButton>
                            <Typography variant="h6"
                                        color="inherit"
                                        noWrap
                                        className={classes.grow}>
                                {title}
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <Hidden mdUp>
                        <Drawer
                            variant="temporary"
                            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                            open={this.state.mobileOpen}
                            classes={{
                                paper: classes.drawerPaper,
                            }}
                            onClose={this.handleDrawerToggle}
                            ModalProps={{
                                keepMounted: true, // Better open performance on mobile.
                            }}>
                            {drawer}
                        </Drawer>
                    </Hidden>
                    <Hidden smDown implementation="css">
                        {/*TODO full height*/}
                        <Drawer
                            variant="permanent"
                            open
                            classes={{
                                paper: classes.drawerPaper,
                            }}>
                            {drawer}
                        </Drawer>
                    </Hidden>
                    <main className={classes.content}>
                        {children}
                    </main>
                </div>
            </div>
        );
    }
}

ResponsiveDrawer.propTypes = {
    title: PropTypes.string,
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    drawerContent: PropTypes.object.isRequired
};

export default withStyles(styles, {withTheme: true})(ResponsiveDrawer);
