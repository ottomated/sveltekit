/** @import { Transport } from '@sveltejs/kit' */

import { stringify as _stringify, parse } from 'devalue';
import { base64_decode, base64_encode, text_decoder, text_encoder } from './utils.js';

/**
 * @param {string} route_id
 * @param {string} dep
 */
export function validate_depends(route_id, dep) {
	const match = /^(moz-icon|view-source|jar):/.exec(dep);
	if (match) {
		console.warn(
			`${route_id}: Calling \`depends('${dep}')\` will throw an error in Firefox because \`${match[1]}\` is a special URI scheme`
		);
	}
}

export const INVALIDATED_PARAM = 'x-sveltekit-invalidated';

export const TRAILING_SLASH_PARAM = 'x-sveltekit-trailing-slash';

/**
 * Try to `devalue.stringify` the data object using the provided transport encoders.
 * @param {any} data
 * @param {Transport} transport
 */
export function stringify(data, transport) {
	const encoders = Object.fromEntries(
		Object.entries(transport).map(([key, value]) => [key, value.encode])
	);

	return _stringify(data, encoders);
}

/**
 * Stringifies the argument (if any) for a remote function in such a way that
 * it is both a valid URL and a valid file name (necessary for prerendering).
 * @param {any} arg
 * @param {Transport} transport
 */
export function stringify_remote_arg(arg, transport) {
	if (arg === undefined) return '';

	// If people hit file/url size limits, we can look into using something like compress_and_encode_text from svelte.dev beyond a certain size
	const json_string = stringify(arg, transport);

	return base64_encode(text_encoder.encode(json_string));
}

/**
 * Parses the argument (if any) for a remote function
 * @param {string} stringified_arg
 * @param {Transport} transport
 */
export function parse_remote_args(stringified_arg, transport) {
	const decoders = Object.fromEntries(Object.entries(transport).map(([k, v]) => [k, v.decode]));

	if (!stringified_arg) return undefined;

	const json_string = text_decoder.decode(base64_decode(stringified_arg));

	return parse(json_string, decoders);
}

/**
 * @param {string} id
 * @param {string} stringified_arg
 */
export function create_remote_cache_key(id, stringified_arg) {
	return id + '|' + stringified_arg;
}
