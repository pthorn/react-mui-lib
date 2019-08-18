// import history from '../../misc/history';


class FormDelegate {
    constructor(controller) {
        this.controller = controller;
    }

    /**
     * :param action: <SubmitButton action="action"/>
     */
    didSubmit(json_response, action) {
        // const c = this.controller;
        //
        // // navigate to edit url
        // if (!c.state.entity_id) {
        //     history.push(`/admin/${c.entity_name}/${json_response.id}`);
        // }
    }

    didDelete() {
    }
}

export default FormDelegate;
