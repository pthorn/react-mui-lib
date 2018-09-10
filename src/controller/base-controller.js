import registry from '../registry';


class BaseController {
    constructor(name, state_prefix, Reducer) {
        this.name = name;
        this.state_prefix = state_prefix;
        this._reducer = new Reducer(this);
    }

    get reducer() {
        return this._reducer;
    }

    get state() {
        return registry.get('store').getState()[this.state_prefix];
    }

    dispatch(action) {
        action.prefix = this.state_prefix;

        if (process.env.NODE_ENV !== 'production') {
            console.log(`BaseController(name=${this.name}, state_prefix=${this.state_prefix}).dispatch(${JSON.stringify(action)})`);
        }

        registry.get('store').dispatch(action);
    }
}

export default BaseController;
