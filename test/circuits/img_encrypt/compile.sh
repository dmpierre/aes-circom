#!/bin/bash
for px in 28 # 240 480 1024 
do
	echo
	FILE=aes_${px}px_256_ctr_test.circom
	echo $FILE
	start_time=`date +%s`
	circom --wasm --r1cs $FILE
	end_time=`date +%s`
	echo $FILE COMPILATION TIME: `expr $end_time - $start_time` s.
	echo
done
