"use strict"

var NFTUniverseCoin = artifacts.require("./NFTUniverseCoin.sol");
const theBN = require("bn.js")

/**
 * NFTUniverseCoin contract tests 2
 */
contract('NFTUniverseCoin2', function(accounts) {
  const BIG = (v) => new theBN.BN(v)

  const owner = accounts[0];
  const admin = accounts[1];
  const vault = accounts[2];
  const minter = accounts[0];

  const user1 = accounts[4];
  const user2 = accounts[5];
  const user3 = accounts[6];
  const user4 = accounts[7];
  const user5 = accounts[8];

  let coin, OneNFTUniverseCoinInMinunit, NoOfTokens, NoOfTokensInMinunit;

  const bnBalanceOf = async addr => await coin.balanceOf(addr);
  const bnReserveOf = async addr => await coin.reserveOf(addr);
  const bnAllowanceOf = async (owner, spender) => await coin.allowance(owner, spender);

  const balanceOf = async addr => (await coin.balanceOf(addr)).toString();
  const reserveOf = async addr => (await coin.reserveOf(addr)).toString();
  const allowanceOf = async (owner, spender) => (await coin.allowance(owner,spender)).toString();


  before(async () => {
    coin = await NFTUniverseCoin.deployed();
    NoOfTokensInMinunit = await coin.totalSupply();
    OneNFTUniverseCoinInMinunit = await coin.getOneNFTUniverseCoin();
    NoOfTokens = NoOfTokensInMinunit.div(OneNFTUniverseCoinInMinunit)
  });

  const clearUser = async user => {
    await coin.setReserve(user, 0, {from: admin});
    await coin.transfer(vault, await bnBalanceOf(user), {from: user});
  };

  beforeEach(async () => {
    await clearUser(user1);
    await clearUser(user2);
    await clearUser(user3);
    await clearUser(user4);
    await clearUser(user5);
  });

  it("reserve and then approve", async() => {
    assert.equal(await balanceOf(user4), "0");

    const OneNFTUniverseTimesTwoInMinunit = OneNFTUniverseCoinInMinunit.mul(BIG(2))
    const OneNFTUniverseTimesTwoInMinunitStr = OneNFTUniverseTimesTwoInMinunit.toString()

    const OneNFTUniverseTimesOneInMinunit = OneNFTUniverseCoinInMinunit.mul(BIG(1))
    const OneNFTUniverseTimesOneInMinunitStr = OneNFTUniverseTimesOneInMinunit.toString()

    // send 2 NFTUniverse to user4 and set 1 NFTUniverse reserve
    coin.transfer(user4, OneNFTUniverseTimesTwoInMinunit, {from: vault});
    coin.setReserve(user4, OneNFTUniverseCoinInMinunit, {from: admin});
    assert.equal(await balanceOf(user4), OneNFTUniverseTimesTwoInMinunitStr);
    assert.equal(await reserveOf(user4), OneNFTUniverseCoinInMinunit.toString());

    // approve 2 NFTUniverse to user5
    await coin.approve(user5, OneNFTUniverseTimesTwoInMinunit, {from:user4});
    assert.equal(await allowanceOf(user4, user5), OneNFTUniverseTimesTwoInMinunitStr);

    // transfer 2 NFTUniverse from user4 to user5 SHOULD NOT BE POSSIBLE
    try {
      await coin.transferFrom(user4, user5, OneNFTUniverseTimesTwoInMinunit, {from: user5});
      assert.fail();
    } catch(exception) {
      assert.isTrue(exception.message.includes("revert"));
    }

    // transfer 1 NFTUniverse from user4 to user5 SHOULD BE POSSIBLE
    await coin.transferFrom(user4, user5, OneNFTUniverseTimesOneInMinunit, {from: user5});
    assert.equal(await balanceOf(user4), OneNFTUniverseTimesOneInMinunitStr);
    assert.equal(await reserveOf(user4), OneNFTUniverseTimesOneInMinunitStr); // reserve will not change
    assert.equal(await allowanceOf(user4, user5), OneNFTUniverseTimesOneInMinunitStr); // allowance will be reduced
    assert.equal(await balanceOf(user5), OneNFTUniverseTimesOneInMinunitStr);
    assert.equal(await reserveOf(user5), "0");

    // transfer .5 NFTUniverse from user4 to user5 SHOULD NOT BE POSSIBLE if balance <= reserve
    const halfNFTUniverseInMinunit = OneNFTUniverseCoinInMinunit.div(BIG(2));
    try {
      await coin.transferFrom(user4, user5, halfNFTUniverseInMinunit, {from: user5});
      assert.fail();
    } catch(exception) {
      assert.isTrue(exception.message.includes("revert"));
    }
  })

  it("only minter can call mint", async() => {
      const OneNFTUniverseTimesTenInMinunit = OneNFTUniverseCoinInMinunit.mul(BIG(10))
      const OneNFTUniverseTimesTenInMinunitStr = OneNFTUniverseTimesTenInMinunit.toString()

      assert.equal(await balanceOf(user4), "0");

      await coin.mint(user4, OneNFTUniverseTimesTenInMinunit, {from: minter})

      const totalSupplyAfterMintStr = (await coin.totalSupply()).toString()
      assert.equal(totalSupplyAfterMintStr, OneNFTUniverseTimesTenInMinunit.add(NoOfTokensInMinunit).toString())
      assert.equal(await balanceOf(user4), OneNFTUniverseTimesTenInMinunitStr);

      try {
          await coin.mint(user4, OneNFTUniverseTimesTenInMinunit, {from: user4})
          assert.fail();
      } catch(exception) {
          assert.equal(totalSupplyAfterMintStr, OneNFTUniverseTimesTenInMinunit.add(NoOfTokensInMinunit).toString())
          assert.isTrue(exception.message.includes("revert"));
      }
  })

  it("cannot mint above the mint cap", async() => {
      const OneNFTUniverseTimes100BilInMinunit = 
              OneNFTUniverseCoinInMinunit.mul(BIG(100000000000))

      assert.equal(await balanceOf(user4), "0");


      try {
          await coin.mint(user4, OneNFTUniverseTimes100BilInMinunit, {from: minter})
          assert.fail();
      } catch(exception) {
          assert.isTrue(exception.message.includes("revert"));
      }
  })
});
