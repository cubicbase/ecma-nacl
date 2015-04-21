/* Copyright(c) 2015 3NSoft Inc.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at http://mozilla.org/MPL/2.0/. */
/**
 * Testing module lib/signing/sign.(ts/js)
 */

import nu = require('nodeunit');
import sign = require('../../lib/signing/sign');
import arrays = require('../../lib/util/arrays');
import testUtil = require('../test-utils');

var compare = testUtil.compare;
var arrFactory = arrays.makeFactory();

export function s1(test: nu.Test) {

	var keySeed = new Uint8Array(32);
	keySeed.set([ 0xae, 0x38, 0x86, 0x7b, 0xd2, 0x65, 0xcb, 0x86, 0x57, 0x0e,
				  0x90, 0x0e, 0x24, 0xa1, 0x75, 0x03, 0x2f, 0x74, 0xab, 0x4d,
				  0xa1, 0xbd, 0xf5, 0xc9, 0x12, 0x3e, 0x4c, 0x98, 0x12, 0xaa,
				  0x0c, 0x95 ]);

	var expectedPKey = new Uint8Array(32);
	expectedPKey.set([ 0xd0, 0xa5, 0xe8, 0xca, 0xeb, 0xff, 0xb8, 0x2a, 0x5e, 0x6d,
					   0x24, 0x4a, 0x94, 0x94, 0x3c, 0xd5, 0x34, 0x03, 0x68, 0x0d,
					   0x93, 0x02, 0x82, 0xb2, 0xc0, 0x7b, 0x1f, 0xfd, 0xbd, 0x21,
					   0x39, 0xd0 ]);

	// Testing signing keys generation
	var pair = sign.generate_keypair(keySeed);
	compare(test, pair.pkey, expectedPKey);

	// Testing of message signing");
	var m = testUtil.asciiStrToUint8Array("testing\n");

	var signed_m = sign.sign(m, pair.skey, arrFactory);
	var result = sign.open(signed_m, pair.pkey, arrFactory);
	test.ok(!!result, "FAILED signature verification.");
	compare(test, result, m);
	
	// Testing of separated-signature functionality
	var sig = sign.signature(m, pair.skey, arrFactory);
	compare(test, sig, signed_m.subarray(0,64));
	test.ok(sign.verify(sig, m, pair.pkey, arrFactory),
			"FAILED signature verification.");
	test.done();
}

/**
 * Testing for other key seeds
 */
export function s2(test: nu.Test) {
	
	var seedAndPKeys =
	[ { seed: [ 0x13, 0xca, 0x75, 0xbe, 0x97, 0x13, 0x61, 0x62, 0xb4, 0x36,
				0x95, 0xfa, 0xd2, 0xa2, 0xb2, 0xcb, 0xb4, 0x35, 0xc9, 0xad,
				0x0a, 0x0f, 0xf5, 0xb6, 0x58, 0x7e, 0xd9, 0xd0, 0xcf, 0xfb,
				0x59, 0xec ],
		pkey: [ 0xed, 0xef, 0xc9, 0x54, 0x05, 0xce, 0x9f, 0x81, 0x7d, 0x2b,
				0xd8, 0xb9, 0x48, 0x0c, 0x3f, 0xfb, 0xa8, 0xd9, 0x6a, 0x6e,
				0x00, 0x87, 0x90, 0x6a, 0xe2, 0xe9, 0xa9, 0x2f, 0xf5, 0xa9,
				0xdc, 0xe7 ] },
 	  { seed: [ 0xee, 0xdd, 0xec, 0xfa, 0x96, 0x70, 0x23, 0x6b, 0xdd, 0x4b,
				0xba, 0x59, 0xae, 0x69, 0x65, 0x7a, 0x83, 0xb9, 0x74, 0x9a,
				0xd7, 0xd7, 0x68, 0x21, 0xe8, 0x64, 0x1a, 0x4b, 0xe3, 0x1a,
				0x5b, 0x74 ],
		pkey: [ 0x20, 0x95, 0x60, 0x39, 0xa6, 0x6f, 0x66, 0x63, 0xe0, 0x08,
				0xa3, 0xac, 0xd2, 0x96, 0x76, 0x5e, 0xea, 0x21, 0xe5, 0x6c,
				0x3d, 0x2f, 0xea, 0xb7, 0xc7, 0x4d, 0x0c, 0x9d, 0x2f, 0x6e,
				0xc5, 0xe4 ] },
  	  { seed: [ 0x9a, 0xae, 0xe7, 0xc6, 0xf9, 0xd7, 0xe4, 0x9c, 0x64, 0x05,
				0xa9, 0x81, 0xa6, 0xe3, 0xa6, 0x52, 0x5b, 0x62, 0x5f, 0xa1,
				0xae, 0x92, 0x5c, 0xec, 0x12, 0x2f, 0x2d, 0xe3, 0x3d, 0x4d,
				0x30, 0x3c ],
		pkey: [ 0xe3, 0x43, 0x33, 0xb1, 0x42, 0xc5, 0xc5, 0x86, 0x14, 0x86,
				0x46, 0x37, 0x0d, 0xfc, 0xf7, 0x21, 0x48, 0x50, 0x24, 0x6d,
				0x69, 0x7f, 0x6d, 0x32, 0x60, 0x47, 0xdf, 0xa7, 0x85, 0xd6,
				0xee, 0xd5 ] } ];

	var m = testUtil.asciiStrToUint8Array("testing\n");
	
	seedAndPKeys.forEach((seedAndPk, i) => {
		var keySeed = new Uint8Array(32);
		keySeed.set(seedAndPk.seed);
		var expectedPKey = new Uint8Array(32);
		expectedPKey.set(seedAndPk.pkey);
		var pair = sign.generate_keypair(keySeed);
		compare(test, pair.pkey, expectedPKey);
		var signed_m = sign.sign(m, pair.skey, arrFactory);
		var sig = sign.signature(m, pair.skey, arrFactory);
		compare(test, sig, signed_m.subarray(0,64));
		var result = sign.open(signed_m, pair.pkey, arrFactory);
		test.ok(!!result, "FAILED signature verification.");
		test.ok(sign.verify(sig, m, pair.pkey, arrFactory),
			"FAILED signature verification.");
		compare(test, result, m);
	});
	test.done();
}

