import _ from 'lodash';


export function parse_image_id(image_id) {
    const split_id = image_id.split(',');
    if (split_id.length !== 4) {
        throw new Error(`bad image id ${image_id}`);
    }

    return {
        uuid: split_id[0],
        category: split_id[1],
        slug: split_id[2],
        ext: split_id[3]
    };
}


// TODO
const SUBDIRS = 2;
const SUBDIR_CHARS = 1;


export function image_url(parsed_id, prefix, variant) {
    const subdirs = _.map(new Array(SUBDIRS), (el, i) =>
        parsed_id.uuid.slice(i * SUBDIR_CHARS, (i+1)*SUBDIR_CHARS))
        .join('/');

    const file_name = variant ?
        `${parsed_id.slug}.${parsed_id.uuid}.${variant}.${parsed_id.ext}` :
        `${parsed_id.slug}.${parsed_id.uuid}.${parsed_id.ext}`;

    return `${prefix}/${parsed_id.category}/${subdirs}/${file_name}`;
}


export function upload_url(config) {
    if (config.category) {
        return `${config.prefix}/${config.category}`;
    } else {
        return config.prefix;
    }
}