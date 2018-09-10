import React from 'react';
import FormHelperText from '@material-ui/core/FormHelperText';


export function errors(model) {
    const errors = Object.values(model.getErrors());
    const message = errors.join(';');

    return <FormHelperText error>
        {message}
    </FormHelperText>;
}
