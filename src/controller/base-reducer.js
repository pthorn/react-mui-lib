class BaseReducer {
    constructor(controller) {
        this.controller = controller;
    }

    reduce(state, action) {
        const c = this.controller;

        const my_state = state[c.state_prefix] || {};

        if (action.prefix !== '*' && action.prefix !== c.state_prefix) {
            const unchanged_state = {
                [c.state_prefix]: my_state
            };

            return unchanged_state;
        }

        if (!(action.type in Object.getPrototypeOf(this))) {
            throw new Error(`${c.state_prefix}] reducer: received unknown action ${action.type}: ${JSON.stringify(action)}`);
        }

        return {
            [c.state_prefix]: this[action.type](my_state, action)
        };
    }
}

export default BaseReducer;
