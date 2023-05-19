const path = require("path");
const assert = require("assert");
const wasmTester = require("circom_tester").wasm;
const Module = require("./module.js");
const utils = require("./utils");
const fs = require("fs");
const jpeg = require("jpeg-js");
const bench = require("./bench");
const snarkjs = require("snarkjs");
const { log } = require("console");

describe("Image Encrypt AES256 CTR Test", () => {
    it("Bench", async () => {

        const pxSize = 28;
        const ctr = [469237865, 927770925, 1003210585, 3037346057];
        const ks = [1962153145, 3621906731, 3712678050, 3286144703, 1815899717, 1472326661, 507853, 584243966, 3479675375, 411453636, 3318526054, 101852889, 66427248, 1412724085, 1412680376, 1994461254, 2506053927, 2379813347, 1209377157, 1309116252, 741379642, 2013592399, 741814775, 1523982769, 1575071710, 3493379645, 2553094072, 3593115876, 3671443539, 2731619100, 2397438699, 3559924570, 3819547632, 865146317, 2881227381, 2107019921, 625313746, 2274669774, 158512677, 3712128383, 828934090, 49910279, 2839910514, 3570600675, 1831067843, 3937883149, 3821396520, 1049065303, 1792708639, 1747124760, 3244726890, 364220553, 888569956, 3728856169, 1032074817, 50544918, 765586396, 1166207428, 2229564334, 2438062887];
        const ctrBits = bench.formatToBits(ctr);
        const ksBits = bench.formatToBits(ks);

        const zkeyFileName = `aes_${pxSize}px_256_ctr_test_1`;
        const vkeyFileName = `aes_${pxSize}px_256_ctr_test_vk`;
        const wasmFileName = `aes_${pxSize}px_256_ctr_test`;
        const zkeyPath = path.join(__dirname, "zkeys", `${zkeyFileName}.zkey`);
        const vkeyPath = path.join(__dirname, "vkeys", `${vkeyFileName}.json`);
        const wasmPath = path.join(__dirname, `circuits/img_encrypt/aes_${pxSize}px_256_ctr_test_js`, `${wasmFileName}.wasm`);

        const inp = bench.loadImg(`${pxSize}px.jpg`);
        const inpBits = utils.buffer2bits(inp);

        const wtns = { type: "mem" };
        const witnessStart = Date.now();
        const witness = await snarkjs.wtns.calculate(
            {
                "ks": ksBits,
                "ctr": ctrBits,
                "in": inpBits
            },
            wasmPath,
            wtns
        )
        const witnessEnd = Date.now();

        const proofStart = Date.now();
        const { proof, publicSignals } = await snarkjs.groth16.prove(zkeyPath, wtns, undefined)
        const proofEnd = Date.now();

        const verifStart = Date.now();
        const vkey = JSON.parse(fs.readFileSync(vkeyPath).toString());
        const verifEnd = Date.now();
        const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);

        console.log(`Witness time: ${witnessEnd - witnessStart}ms`);
        console.log(`Proof time: ${proofEnd - proofStart}ms`);
        console.log(`Verification time: ${verifEnd - verifStart}ms`);
        console.log(`Proof verified as: ${res}`);

    })
});