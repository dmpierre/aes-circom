const path = require("path");
const assert = require("assert");
const wasmTester = require("circom_tester").wasm;
const utils = require("./utils");
const fs = require("fs");
const jpeg = require("jpeg-js");
const snarkjs = require("snarkjs");

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

(BigInt.prototype).toJSON = function () {
    return this.toString();
};


const formatToBits = (intArray) => {
    var arrayBuffer = [];
    for (let i = 0; i < intArray.length; i++) {
        arrayBuffer.push(...utils.intToLEBuffer(intArray[i], 4));
    }
    var arrayBits = utils.buffer2bits(arrayBuffer);
    return arrayBits;
}

/**
 * Calculates witness and prove - time in ms
 * @param {wasmCircuit} cir 
 * @param {Uint8Array} inp
 * @param {ks} ks
 * @param {ctr} ctr 
*/
const calcWitnessAndProve = async (wasmFileName, zkeyFileName, inp, ks, ctr) => {

    const wasmPath = path.join(__dirname, "circuits/img_encrypt", `${wasmFileName}_js/${wasmFileName}.wasm`);
    const zkeyPath = path.join(__dirname, "zkeys", `${zkeyFileName}.zkey`);

    const ks_bits = formatToBits(ks);
    const ctr_bits = formatToBits(ctr);

    fs.writeFileSync("witness.json", JSON.stringify({ "ks": ks_bits, "in": utils.buffer2bits(inp), "ctr": ctr_bits }));

    const witnessStart = Date.now();
    const wtns = { type: "mem" }

    const witness = await snarkjs.wtns.calculate(
        { "ks": ks_bits, "in": utils.buffer2bits(inp), "ctr": ctr_bits },
        wasmPath,
        wtns
    )
    const witnessEnd = Date.now();

    const proofStart = Date.now();
    const proof = await snarkjs.groth16.prove(zkeyPath, wtns, undefined)
    const proofEnd = Date.now();

    return [witnessEnd - witnessStart, proofEnd - proofStart];
};

const calculateWitness = async (cir, inp, ks, ctr) => {

    var ks_bits = formatToBits(ks);
    var ctr_bits = formatToBits(ctr);

    const witnessStart = Date.now();
    let witness = await cir.calculateWitness({ "ks": ks_bits, "in": utils.buffer2bits(inp), "ctr": ctr_bits });
    const witnessEnd = Date.now();
    return [witness, witnessEnd - witnessStart];
};

module.exports = {
    compile,
    loadImg,
    formatToBits,
    calcWitnessAndProve,
    calculateWitness
}
