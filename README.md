# AES-GCM Implementation in Circom

This is based on the S-table implementation of [AES GCM SIV](https://datatracker.ietf.org/doc/html/rfc8452) encryption scheme.

It is heavily inspired by the C implementation of [AES-GCM-SIV](https://github.com/Shay-Gueron/AES-GCM-SIV)

## Image encryption benchmarks

### Config

Using `circom compiler 2.1.5`.

Compilation carried out on a `r5.4xlarge` machine:
- Linux/UNIX
- 128gb RAM
- 16 vCPUs 

Witness generation, proving and verifying carried out on an Apple M2 Pro.

### Results

The *public outputs* column refers to the number of bits the encrypted image results in. 

We report public outputs instead of public inputs for clarity. Public inputs also consist of the key schedule and IV, which are of constant size across circuits.


|img size|non-linear constraints|public outputs|compilation|witness generation|proving|verifiying|
|--|--|--|--|--|--|--|
| 28x28 | 2036832 | 18816 | 53s |  |  |  |
| 56x56 | 8147328 | 75264 | 223s |  |  |  |
| 112x112 | 32589312 | 301056 | 940s |  |  |  |

### Maximum image size case

Largest ptau file allows us to secure circuits with up to 256 millions constraints. 

This corresponds to an image of 439x439 pixels. 

Using back of the envelope estimations: 
- will require *at least* 2h compilation time on `r5.4xlarge` machine
- 
- 