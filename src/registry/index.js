import _ from 'lodash';


var _singleton;


class Registry {
    constructor() {
        _singleton = this;
        this.registry = {};

        if (process.env.NODE_ENV !== 'production') {
            window.rl = function () {
                _.each(_singleton.registry, (el, k) => {
                    console.log(k, el.name, el.state_prefix);
                });
            }

            window.rg = function (name) {
                return _singleton.get(name);
            };
        }
    }

    register(name, obj) {
        if (_.has(this.registry, name)) {
            throw new Error(`object ${name} is already present in registry`);
        }
    
        this.registry[name] = obj;
    }
    
    get(name) {
        if (!_.has(this.registry, name)) {
            throw new Error(`no such object ${name} in registry`);
        }
    
        return this.registry[name];
    }

    map(fn) {
        return _.map(this.registry, fn);
    }

    filter(pred) {
        return _.filter(this.registry, pred);
    }
}

export default new Registry();
