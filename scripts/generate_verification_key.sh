#!/bin/bash
# Copyright © 2022, Electron Labs

set -o xtrace
set -o verbose

builddir="build"

function command_exists() {
        if ! command -v "$1" &> /dev/null
        then
                echo "$1 could not be found"
                exit 1
        fi
}

function check_circuit_exists() {
        if ! test -f "$1"; then
                echo "$1 circuit does not exists."
                exit 1
        fi
}

# $1 -> Main circuit file

echo "Start generating verification key!"

# Check if utilities are installed
command_exists "circom"
command_exists "snarkjs"

check_circuit_exists "$1"

mkdir -p "$builddir"

val=$(circom "$1" --r1cs --wasm --sym --c --output "$builddir" | grep "non-linear constraints" | awk -F ': ' '{print $2}')
constraints=$(python3 -c "from math import *; print(ceil(log($val)/log(2)))")
echo "Total number of constraints: 2**$constraints"

circom=$(basename "$1")
circuit="${circom%%.*}"

pushd "$builddir"
ptau="powersOfTau28_hez_final_$constraints.ptau"

# Only download PTAU file if it does not exits locally
if ! test -f "$ptau"; then
        wget "https://hermez.s3-eu-west-1.amazonaws.com/$ptau"
fi

snarkjs groth16 setup "$circuit.r1cs" "powersOfTau28_hez_final_$constraints.ptau" "$circuit"_0000.zkey
snarkjs zkey contribute "$circuit"_0000.zkey "$circuit"_0001.zkey --name="Jinank Jain" -v
snarkjs zkey export verificationkey "$circuit"_0001.zkey verification_key.json
popd

echo "Done generating verification key: $builddir/verification_key.json!"
