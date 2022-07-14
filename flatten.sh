#!/bin/zsh
truffle-flattener contracts/NFTUniverseCoin.sol > NFTUniverseCoin.flatten.sol
truffle-flattener contracts/NFTUniverseCoinMultiSigWallet.sol > NFTUniverseCoinMultiSigWallet.flatten.sol
