var NFTUniverseCoin = artifacts.require("./contracts/NFTUniverseCoin.sol");
var NFTUniverseCoinMultiSigWallet = artifacts.require("./contracts/NFTUniverseCoinMultiSigWallet.sol");
var NFTUniverseCoinMultiSigWalletWithMint = artifacts.require("./contracts/NFTUniverseCoinMultiSigWalletWithMint.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(NFTUniverseCoin, 'NFTUniverse', 'NFTUniverseCoin', accounts[0], accounts[1], accounts[2]).then( () => {
    console.log(`NFTUniverseCoin deployed: address = ${NFTUniverseCoin.address}`);

    deployer.
      deploy(NFTUniverseCoinMultiSigWallet, [accounts[0], accounts[1], accounts[2]], 2, NFTUniverseCoin.address,
          "vault multisig wallet");

      deployer.
      deploy(NFTUniverseCoinMultiSigWalletWithMint, [accounts[0], accounts[1], accounts[2]], 2, NFTUniverseCoin.address,
          "vault multisig wallet with mint");

  });
};
