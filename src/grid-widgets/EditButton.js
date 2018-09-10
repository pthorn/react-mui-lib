import React from 'react';
import { Link } from "react-router-dom";

import IconButton from '@material-ui/core/IconButton';
import Icon from  '@material-ui/core/Icon';


function EditButton({to}) {
    return <IconButton component={Link}
                       to={to}>
        <Icon>edit</Icon>
    </IconButton>;
}

export default EditButton;
