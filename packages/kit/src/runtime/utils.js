export const text_encoder = new TextEncoder();
export const text_decoder = new TextDecoder();

/**
 * Like node's path.relative, but without using node
 * @param {string} from
 * @param {string} to
 */
export function get_relative_path(from, to) {
	const from_parts = from.split(/[/\\]/);
	const to_parts = to.split(/[/\\]/);
	from_parts.pop(); // get dirname

	while (from_parts[0] === to_parts[0]) {
		from_parts.shift();
		to_parts.shift();
	}

	let i = from_parts.length;
	while (i--) from_parts[i] = '..';

	return from_parts.concat(to_parts).join('/');
}

/**
 * @param {string} encoded
 * @returns {ArrayBufferLike}
 */
export function base64_decode(encoded) {
	const result = new Uint8Array(Math.ceil(encoded.length / 4) * 3);
	let totalBytes = 0;
	for (let i = 0; i < encoded.length; i += 4) {
		let chunk = 0;
		let bitsRead = 0;
		for (let j = 0; j < 4; j++) {
			const char = encoded[i + j];
			if (i + j >= encoded.length || char === '=') {
				continue;
			}
			if (j > 0 && encoded[i + j - 1] === '=') {
				throw new Error('Invalid padding');
			}
			if (!(char in base64_decode_map)) {
				throw new Error('Invalid character');
			}
			chunk |=
				base64_decode_map[/** @type {keyof typeof base64_decode_map} */ (char)] << ((3 - j) * 6);
			bitsRead += 6;
		}
		if (bitsRead < 24) {
			/** @type {number} */
			let unused;
			if (bitsRead === 12) {
				unused = chunk & 0xffff;
			} else if (bitsRead === 18) {
				unused = chunk & 0xff;
			} else {
				throw new Error('Invalid padding');
			}
			if (unused !== 0) {
				throw new Error('Invalid padding');
			}
		}
		const byteLength = Math.floor(bitsRead / 8);
		for (let i = 0; i < byteLength; i++) {
			result[totalBytes] = (chunk >> (16 - i * 8)) & 0xff;
			totalBytes++;
		}
	}
	return result.slice(0, totalBytes);
}

/**
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
export function base64_encode(buffer) {
	if (globalThis.Buffer) {
		return Buffer.from(buffer).toString('base64');
	}

	const bytes = new Uint8Array(buffer);
	let result = '';
	for (let i = 0; i < bytes.byteLength; i += 3) {
		let buffer = 0;
		let bufferBitSize = 0;
		for (let j = 0; j < 3 && i + j < bytes.byteLength; j++) {
			buffer = (buffer << 8) | bytes[i + j];
			bufferBitSize += 8;
		}
		for (let j = 0; j < 4; j++) {
			if (bufferBitSize >= 6) {
				result += base64_alphabet[(buffer >> (bufferBitSize - 6)) & 0x3f];
				bufferBitSize -= 6;
			} else if (bufferBitSize > 0) {
				result += base64_alphabet[(buffer << (6 - bufferBitSize)) & 0x3f];
				bufferBitSize = 0;
			}
		}
	}
	return result;
}

const base64_alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const base64_decode_map = {
	0: 52,
	1: 53,
	2: 54,
	3: 55,
	4: 56,
	5: 57,
	6: 58,
	7: 59,
	8: 60,
	9: 61,
	A: 0,
	B: 1,
	C: 2,
	D: 3,
	E: 4,
	F: 5,
	G: 6,
	H: 7,
	I: 8,
	J: 9,
	K: 10,
	L: 11,
	M: 12,
	N: 13,
	O: 14,
	P: 15,
	Q: 16,
	R: 17,
	S: 18,
	T: 19,
	U: 20,
	V: 21,
	W: 22,
	X: 23,
	Y: 24,
	Z: 25,
	a: 26,
	b: 27,
	c: 28,
	d: 29,
	e: 30,
	f: 31,
	g: 32,
	h: 33,
	i: 34,
	j: 35,
	k: 36,
	l: 37,
	m: 38,
	n: 39,
	o: 40,
	p: 41,
	q: 42,
	r: 43,
	s: 44,
	t: 45,
	u: 46,
	v: 47,
	w: 48,
	x: 49,
	y: 50,
	z: 51,
	'-': 62,
	_: 63
};

/**
	Based on https://github.com/oslo-project/encoding/blob/main/src/base64.ts

	MIT License
	Copyright (c) 2024 pilcrowOnPaper

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
		
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
		
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
 */
