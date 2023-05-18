const path = require("path");
const assert = require("assert");
const wasmTester = require("circom_tester").wasm;
const utils = require("./utils");
const fs = require("fs");
const jpeg = require("jpeg-js");

const compile = async (filename) => {
    const compileStart = Date.now();
    const cir = await wasmTester(path.join(__dirname, "circuits/img_encrypt", filename));
    const compileEnd = Date.now();
    return [cir, compileEnd - compileStart];
};

const loadImg = (filename) => {
    const img = jpeg.decode(fs.readFileSync(path.join(__dirname, "img", filename)), {
        formatAsRGBA: false
    }).data;
    return img;
};

/**
 * Calculates witness
 * @param {wasmCircuit} cir 
 * @param {Uint8Array} inp
 * @param {ks} ks
 * @param {ctr} ctr 
*/
const calculateWitness = async (cir, inp, ks, ctr) => {
    var ks_buffer = [];
    for (let i = 0; i < ks.length; i++) {
        ks_buffer.push(...utils.intToLEBuffer(ks[i], 4));
    }
    var ks_bits = utils.buffer2bits(ks_buffer);
    var ctr_buffer = [];
    for (let i = 0; i < ctr.length; i++) {
        ctr_buffer.push(...utils.intToLEBuffer(ctr[i], 4));
    }
    var ctr_bits = utils.buffer2bits(ctr_buffer);

    const witnessStart = Date.now();
    let witness = await cir.calculateWitness({ "ks": ks_bits, "in": utils.buffer2bits(inp), "ctr": ctr_bits });
    const witnessEnd = Date.now();
    return [witness, witnessEnd - witnessStart];
};

module.exports = {
    compile,
    loadImg,
    calculateWitness,
}
