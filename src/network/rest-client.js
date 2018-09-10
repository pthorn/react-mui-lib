import _ from 'lodash';
// import EventEmitter from 'eventemitter';
// import $ from 'jquery';


export function RestError (options) {
    _.assign(this, options);

    this.name = 'RestError';
    this.message = this.message || 'Rest Error';
    this.stack = Error(this.message).stack;  // http://es5.github.io/#x15.11.1
}

RestError.prototype = Object.create(Error.prototype);
RestError.prototype.constructor = RestError;


/**
 * config:
 *   url_prefix:  string, default '/rest/', could be '//rest.me.com/api/'
 *   csrf_token:  string or callable, default null
 *
 * events:
 *   'rest-error'
 *   'http-error-401'
 *   'http-error-403'
 *   'http-error'      http status is 4xx or 5xx but not 401 or 403
 *   'start-request'
 *   'end-request'
 */
class RestClient {
    constructor(config_) {
        this.config = _.assign({
            url_prefix: '/rest/',
            csrf_token: null
        }, config_ || {});

        // remove trailing slash
        if (this.config.url_prefix.endsWith('/')) {
            this.config.url_prefix = this.config.url_prefix.slice(0, -1);
        }

        this.csrf_token = this.config.csrf_token;

        //EventEmitter.call(this);
    }

    /**
     * opts:
     *   url
     *   method
     *   data: query string if GET else JSON request body
     *   send_as: json | formdata
     *
     *   @return promise:
     *     .then(arg): json response
     *     .catch(arg): RestError {reason: 'rest-error|http-error', json_response: {...}|undefined, status:, statusText:}
     */
    request(opts) {
        const options = _.assign({
            method: 'GET',
            data: {},
            send_as: 'json'
        }, opts || {});

        const fetch_options = {
            method: options.method.toUpperCase(),
            headers: new Headers(),
            credentials: 'same-origin'
            // mode: 'cors',
            // cache: 'default'
        };
        fetch_options.headers.append('Accept', 'application/json');

        let query_str = '';
        if (!_.isEmpty(options.data) && (options.method === 'GET' ||
            options.method === 'DELETE')
        ) {
            query_str = '?' + _.map(options.data, (v, k) =>
                encodeURIComponent(k) + '=' + encodeURIComponent(v)
            ).join('&');
        }

        if (options.method !== 'GET' && options.method !== 'DELETE') {
            if (options.send_as === 'json') {
                fetch_options.body = JSON.stringify(options.data);
                fetch_options.headers.append('Content-Type', 'application/json');
            } else if (options.send_as === 'formdata') {
                fetch_options.body = new FormData();

                _.forOwn(options.data, (v, k) => {
                    if (!_.isUndefined(v)) {
                        fetch_options.body.append(k, v);
                    }
                });
            } else {
                throw new Error(`bad options.send_as: ${options.send_as}`);
            }
        }

        if (options.method !== 'GET' && this.csrf_token !== null) {
            let csrf_token = this.csrf_token;
            if (_.isFunction(csrf_token)) {
                csrf_token = csrf_token();
            }

            fetch_options.headers.append('X-CSRF-Token', csrf_token);
        }

        return fetch(
            options.url + query_str,
            fetch_options
        ).then(resp => {
            if (resp.ok) {
                return resp.json();
            }

            throw new RestError({
                reason: 'http-error',
                message: `HTTP Error ${resp.status}`,
                status: resp.status
            });
        }, err => {
            throw new RestError({
                reason: 'network-error',
                message: 'Network Error'
            });
        }).then(json => {
            if (json.status === 'ok') {
                return json;
            }

            throw new RestError({
                reason: 'rest-error',
                code: json.code,
                message: json.message,
                json_response: json
            });
        });
    }

    //
    // CRUD methods
    //

    getList(entity, params) {
        var qs = {};

        if (_.isObject(params)) {
            if (params.start) {
                qs.s = params.start;
            }

            if (params.limit) {
                qs.l = params.limit;
            }

            if (_.isString(params.order)) {
                qs.o = params.order;
            } else if (_.isObject(params.order) && params.order.col) {
                qs.o = (params.order.dir === 'desc' ? '-' : '') + params.order.col;
            }

            if (params.search) {
                qs.q = params.search;
            }

            if (params.filters) {
                _.forEach(params.filters, function (val, key) {
                    // 0 and false are valid filter values
                    if (val === undefined || val === '') {
                        return;
                    }

                    var value = val,
                        op = 'e';
                    if (val instanceof Array) {
                        op = val[0];
                        value = val[1];
                    }

                    qs['f' + op + '_' + key] = value;
                });
            }
        }

        return this.request({
            url: this._url(entity),
            method: 'GET',
            data: qs
        });
    }

    getEntityById(entity, id) {
        return this.request({
            url: this._url(`${entity}/${id}`),
            method: 'GET'
        });
    }

    createEntity(entity, data) {
        return this.request({
            url: this._url(entity),
            method: 'POST',
            data: data
        });
    }

    updateEntityForId(entity, id, data) {
        return this.request({
            url: this._url(`${entity}/${id}`),
            method: 'PUT',
            data: data
        });
    }

    deleteById(entity, id) {
        return this.request({
            url: this._url(`${entity}/${id}`),
            method: 'DElETE'
        });
    }

    //
    // low level methods
    //

    get(url, data) {
        return this.request({
            url: this._url(url),
            method: 'GET',
            data: data
        });
    }

    post(url, data) {
        return this.request({
            url: this._url(url),
            method: 'POST',
            data: data
        });
    }

    put(url, data) {
        return this.request({
            url: this._url(url),
            method: 'PUT',
            data: data
        });
    }

    del(url, data) {
        return this.request({
            url: this._url(url),
            method: 'DELETE',
            data: data
        });
    }

    //
    // utility
    //

    set csrfToken(new_token) {
        this.csrf_token = new_token;
    }

    _url(url) {
        if (url.startsWith('/') || url.startsWith('http:') ||
            url.startsWith('https:')) {
            return url;
        } else {
            const slash = url.startsWith('/') ? ''  : '/';
            return `${this.config.url_prefix}${slash}${url}`;
        }
    }
}

// _.extend(Rest.prototype, EventEmitter.prototype);

export default RestClient;