const path = require("path");
const assert = require("assert");
const wasmTester = require("circom_tester").wasm;
const Module = require("./module.js");
const utils = require("./utils");
const fs = require("fs");
const jpeg = require("jpeg-js");
const bench = require("./bench");

describe("Image Encrypt AES256 CTR Test", () => {
    it("Should carry out bench correctly", async () => {
        const ctr = [469237865, 927770925, 1003210585, 3037346057];
        const ks = [1962153145, 3621906731, 3712678050, 3286144703, 1815899717, 1472326661, 507853, 584243966, 3479675375, 411453636, 3318526054, 101852889, 66427248, 1412724085, 1412680376, 1994461254, 2506053927, 2379813347, 1209377157, 1309116252, 741379642, 2013592399, 741814775, 1523982769, 1575071710, 3493379645, 2553094072, 3593115876, 3671443539, 2731619100, 2397438699, 3559924570, 3819547632, 865146317, 2881227381, 2107019921, 625313746, 2274669774, 158512677, 3712128383, 828934090, 49910279, 2839910514, 3570600675, 1831067843, 3937883149, 3821396520, 1049065303, 1792708639, 1747124760, 3244726890, 364220553, 888569956, 3728856169, 1032074817, 50544918, 765586396, 1166207428, 2229564334, 2438062887];

        const testsPx = [28, 240, 480, 1024]
        const benchResults = [];

        for (let i = 0; i < testsPx.length; i++) {
            const pxSize = testsPx[i];
            const circuitPath = `aes_${pxSize}px_256_ctr_test.circom`;
            const inp = bench.loadImg(`${pxSize}px.jpg`);

            const out_len = inp.length;
            const out = [];

            const inp_ptr = Module._malloc(inp.length * Uint8Array.BYTES_PER_ELEMENT);
            const ctr_ptr = Module._malloc(ctr.length * Uint32Array.BYTES_PER_ELEMENT);
            const ks_ptr = Module._malloc(ks.length * Uint32Array.BYTES_PER_ELEMENT);
            const out_ptr = Module._malloc(out_len * Uint8Array.BYTES_PER_ELEMENT);

            Module.HEAPU8.set(new Uint8Array(inp), inp_ptr / Uint8Array.BYTES_PER_ELEMENT);
            Module.HEAPU32.set(new Uint32Array(ctr), ctr_ptr / Uint32Array.BYTES_PER_ELEMENT);
            Module.HEAPU32.set(new Uint32Array(ks), ks_ptr / Uint32Array.BYTES_PER_ELEMENT);

            Module._AES_256_CTR(out_ptr, inp_ptr, ctr_ptr, inp.length, ks_ptr);

            for (let i = 0; i < out_len; i++) {
                out.push(Module.HEAPU8[out_ptr / Uint8Array.BYTES_PER_ELEMENT + i]);
            }

            const [cir, compileTime] = await bench.compile(circuitPath);
            const [wtns, wtnsTime] = await bench.calculateWitness(cir, inp, ks, ctr);

            const resultOut = utils.buffer2bits(out)

            const witness = wtns.slice(1, resultOut.length + 1);
            assert.ok(resultOut.every((v, i) => v == witness[i]));

            console.log(`Bench ${pxSize}px: ${compileTime/1000}s compile, ${wtnsTime/1000}ms wtns gen.`);
        }

    });
});