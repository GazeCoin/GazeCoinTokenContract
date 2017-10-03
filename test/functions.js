// Jun 12 2017
var ethPriceUSD = 380.39;

// -----------------------------------------------------------------------------
// Accounts
// -----------------------------------------------------------------------------
var accounts = [];
var accountNames = {};

addAccount(eth.accounts[0], "Account #0 - Miner");
addAccount(eth.accounts[1], "Account #1 - Contract Owner");
addAccount(eth.accounts[2], "Account #2 - Crowdsale Wallet");
addAccount(eth.accounts[3], "Account #3 - Advisors Wallet");
addAccount(eth.accounts[4], "Account #4 - Team Wallet");
addAccount(eth.accounts[5], "Account #5 - Contractors Wallet");
addAccount(eth.accounts[6], "Account #6 - Growth Pool Wallet");
addAccount(eth.accounts[7], "Account #7 - Whitelisted");
addAccount(eth.accounts[8], "Account #8 - Whitelisted");
addAccount(eth.accounts[9], "Account #9");
addAccount(eth.accounts[10], "Account #10");
addAccount(eth.accounts[11], "Account #11");
addAccount(eth.accounts[12], "Account #12");
addAccount(eth.accounts[13], "Account #13");

var minerAccount = eth.accounts[0];
var contractOwnerAccount = eth.accounts[1];
var wallet = eth.accounts[2];
var account3 = eth.accounts[3];
var account4 = eth.accounts[4];
var account5 = eth.accounts[5];
var account6 = eth.accounts[6];
var account7 = eth.accounts[7];
var account8 = eth.accounts[8];
var account9 = eth.accounts[9];
var account10 = eth.accounts[10];
var account11 = eth.accounts[11];
var account12 = eth.accounts[12];
var account13 = eth.accounts[13];

var baseBlock = eth.blockNumber;

function unlockAccounts(password) {
  for (var i = 0; i < eth.accounts.length; i++) {
    personal.unlockAccount(eth.accounts[i], password, 100000);
  }
}

function addAccount(account, accountName) {
  accounts.push(account);
  accountNames[account] = accountName;
}


// -----------------------------------------------------------------------------
// Token Contract
// -----------------------------------------------------------------------------
var tokenContractAddress = null;
var tokenContractAbi = null;

function addTokenContractAddressAndAbi(address, tokenAbi) {
  tokenContractAddress = address;
  tokenContractAbi = tokenAbi;
}


// -----------------------------------------------------------------------------
// Account ETH and token balances
// -----------------------------------------------------------------------------
function printBalances() {
  var token = tokenContractAddress == null || tokenContractAbi == null ? null : web3.eth.contract(tokenContractAbi).at(tokenContractAddress);
  var decimals = token == null ? 18 : token.decimals();
  var i = 0;
  var totalTokenBalance = new BigNumber(0);
  console.log("RESULT:  # Account                                             EtherBalanceChange                          Token Name");
  console.log("RESULT: -- ------------------------------------------ --------------------------- ------------------------------ ---------------------------");
  accounts.forEach(function(e) {
    var etherBalanceBaseBlock = eth.getBalance(e, baseBlock);
    var etherBalance = web3.fromWei(eth.getBalance(e).minus(etherBalanceBaseBlock), "ether");
    var tokenBalance = token == null ? new BigNumber(0) : token.balanceOf(e).shift(-decimals);
    totalTokenBalance = totalTokenBalance.add(tokenBalance);
    console.log("RESULT: " + pad2(i) + " " + e  + " " + pad(etherBalance) + " " + padToken(tokenBalance, decimals) + " " + accountNames[e]);
    i++;
  });
  console.log("RESULT: -- ------------------------------------------ --------------------------- ------------------------------ ---------------------------");
  console.log("RESULT:                                                                           " + padToken(totalTokenBalance, decimals) + " Total Token Balances");
  console.log("RESULT: -- ------------------------------------------ --------------------------- ------------------------------ ---------------------------");
  console.log("RESULT: ");
}

function pad2(s) {
  var o = s.toFixed(0);
  while (o.length < 2) {
    o = " " + o;
  }
  return o;
}

function pad(s) {
  var o = s.toFixed(18);
  while (o.length < 27) {
    o = " " + o;
  }
  return o;
}

function padToken(s, decimals) {
  var o = s.toFixed(decimals);
  var l = parseInt(decimals)+12;
  while (o.length < l) {
    o = " " + o;
  }
  return o;
}


// -----------------------------------------------------------------------------
// Transaction status
// -----------------------------------------------------------------------------
function printTxData(name, txId) {
  var tx = eth.getTransaction(txId);
  var txReceipt = eth.getTransactionReceipt(txId);
  var gasPrice = tx.gasPrice;
  var gasCostETH = tx.gasPrice.mul(txReceipt.gasUsed).div(1e18);
  var gasCostUSD = gasCostETH.mul(ethPriceUSD);
  console.log("RESULT: " + name + " gas=" + tx.gas + " gasUsed=" + txReceipt.gasUsed + " costETH=" + gasCostETH +
    " costUSD=" + gasCostUSD + " @ ETH/USD=" + ethPriceUSD + " gasPrice=" + gasPrice + " block=" + 
    txReceipt.blockNumber + " txIx=" + tx.transactionIndex + " txId=" + txId);
}

function assertEtherBalance(account, expectedBalance) {
  var etherBalance = web3.fromWei(eth.getBalance(account), "ether");
  if (etherBalance == expectedBalance) {
    console.log("RESULT: OK " + account + " has expected balance " + expectedBalance);
  } else {
    console.log("RESULT: FAILURE " + account + " has balance " + etherBalance + " <> expected " + expectedBalance);
  }
}

function gasEqualsGasUsed(tx) {
  var gas = eth.getTransaction(tx).gas;
  var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
  return (gas == gasUsed);
}

function failIfGasEqualsGasUsed(tx, msg) {
  var gas = eth.getTransaction(tx).gas;
  var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
  if (gas == gasUsed) {
    console.log("RESULT: FAIL " + msg);
    return 0;
  } else {
    console.log("RESULT: PASS " + msg);
    return 1;
  }
}

function passIfGasEqualsGasUsed(tx, msg) {
  var gas = eth.getTransaction(tx).gas;
  var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
  if (gas == gasUsed) {
    console.log("RESULT: PASS " + msg);
    return 1;
  } else {
    console.log("RESULT: FAIL " + msg);
    return 0;
  }
}

function failIfGasEqualsGasUsedOrContractAddressNull(contractAddress, tx, msg) {
  if (contractAddress == null) {
    console.log("RESULT: FAIL " + msg);
    return 0;
  } else {
    var gas = eth.getTransaction(tx).gas;
    var gasUsed = eth.getTransactionReceipt(tx).gasUsed;
    if (gas == gasUsed) {
      console.log("RESULT: FAIL " + msg);
      return 0;
    } else {
      console.log("RESULT: PASS " + msg);
      return 1;
    }
  }
}


function addCrowdsaleContractAddressAndAbi(address, abi) {
  crowdsaleContractAddress = address;
  crowdsaleContractAbi = abi;
}

var crowdsaleFromBlock = 0;
function printCrowdsaleContractDetails() {
  console.log("RESULT: crowdsaleContractAddress=" + crowdsaleContractAddress);
  // console.log("RESULT: crowdsaleContractAbi=" + JSON.stringify(crowdsaleContractAbi));
  if (crowdsaleContractAddress != null && crowdsaleContractAbi != null) {
    var contract = eth.contract(crowdsaleContractAbi).at(crowdsaleContractAddress);
    console.log("RESULT: crowdsale.softCap=" + contract.softCap() + " " + contract.softCap().shift(-18));
    console.log("RESULT: crowdsale.hardCap=" + contract.hardCap() + " " + contract.hardCap().shift(-18));
    console.log("RESULT: crowdsale.totalEthers=" + contract.totalEthers() + " " + contract.totalEthers().shift(-18));
    console.log("RESULT: crowdsale.token=" + contract.token());
    console.log("RESULT: crowdsale.wallet=" + contract.wallet());
    console.log("RESULT: crowdsale.maximumTokens=" + contract.maximumTokens() + " " + contract.maximumTokens().shift(-8));
    console.log("RESULT: crowdsale.minimalEther=" + contract.minimalEther() + " " + contract.minimalEther().shift(-18));
    console.log("RESULT: crowdsale.weiPerToken=" + contract.weiPerToken() + " " + contract.weiPerToken().shift(-18));
    console.log("RESULT: crowdsale.startTime=" + contract.startTime() + " " + new Date(contract.startTime() * 1000).toUTCString());
    console.log("RESULT: crowdsale.endTime=" + contract.endTime() + " " + new Date(contract.endTime() * 1000).toUTCString());
    console.log("RESULT: crowdsale.refundAllowed=" + contract.refundAllowed());
    console.log("RESULT: crowdsale.bountyReward=" + contract.bountyReward() + " " + contract.bountyReward().shift(-8));
    console.log("RESULT: crowdsale.teamReward=" + contract.teamReward() + " " + contract.teamReward().shift(-8));
    console.log("RESULT: crowdsale.founderReward=" + contract.founderReward() + " " + contract.founderReward().shift(-8));
    console.log("RESULT: crowdsale.softCapReached=" + contract.softCapReached());

    var latestBlock = eth.blockNumber;
    var i;

    var tokenPurchaseEvents = contract.TokenPurchase({}, { fromBlock: crowdsaleFromBlock, toBlock: latestBlock });
    i = 0;
    tokenPurchaseEvents.watch(function (error, result) {
      console.log("RESULT: TokenPurchase " + i++ + " #" + result.blockNumber + ": purchaser=" + result.args.purchaser +
        " beneficiary=" + result.args.beneficiary + " value=" + result.args.value.shift(-18) + " amount=" + result.args.amount.shift(-8));
    });
    tokenPurchaseEvents.stopWatching();

    crowdsaleFromBlock = parseInt(latestBlock) + 1;
  }
}


//-----------------------------------------------------------------------------
// Token Contract
//-----------------------------------------------------------------------------
var tokenFromBlock = 0;
function printTokenContractDetails() {
  console.log("RESULT: tokenContractAddress=" + tokenContractAddress);
  if (tokenContractAddress != null && tokenContractAbi != null) {
    var contract = eth.contract(tokenContractAbi).at(tokenContractAddress);
    var decimals = contract.decimals();
    console.log("RESULT: token.owner=" + contract.owner());
    console.log("RESULT: token.newOwner=" + contract.newOwner());
    console.log("RESULT: token.totalSupply=" + contract.totalSupply().shift(-decimals));
    console.log("RESULT: token.name=" + contract.name());
    console.log("RESULT: token.symbol=" + contract.symbol());
    console.log("RESULT: token.decimals=" + decimals);
    console.log("RESULT: token.START_DATE=" + contract.START_DATE() + " " + new Date(contract.START_DATE() * 1000).toString());
    console.log("RESULT: token.END_DATE=" + contract.END_DATE() + " " + new Date(contract.END_DATE() * 1000).toString());
    console.log("RESULT: token.USD_MINIMUM_GOAL=" + contract.USD_MINIMUM_GOAL());
    console.log("RESULT: token.USD_HARD_CAP=" + contract.USD_HARD_CAP());
    console.log("RESULT: token.WALLET_CROWDSALE=" + contract.WALLET_CROWDSALE());
    console.log("RESULT: token.WALLET_ADVISORS=" + contract.WALLET_ADVISORS() + " " + contract.PERCENT_ADVISORS() + "%");
    console.log("RESULT: token.WALLET_TEAM=" + contract.WALLET_TEAM() + " " + contract.PERCENT_TEAM() + "%");
    console.log("RESULT: token.WALLET_CONTRACTORS=" + contract.WALLET_CONTRACTORS() + " " + contract.PERCENT_CONTRACTORS() + "%");
    console.log("RESULT: token.WALLET_GROWTH_POOL=" + contract.WALLET_GROWTH_POOL() + " " + contract.PERCENT_GROWTH_POOL() + "%");
    console.log("RESULT: token.tokensPerKEther=" + contract.tokensPerKEther());
    console.log("RESULT: token.ethersRaised=" + contract.ethersRaised().shift(-18));
    console.log("RESULT: token.finalised=" + contract.finalised());
    console.log("RESULT: token.transferable=" + contract.transferable());

    var latestBlock = eth.blockNumber;
    var i;

    var ownershipTransferredEvents = contract.OwnershipTransferred({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    ownershipTransferredEvents.watch(function (error, result) {
      console.log("RESULT: OwnershipTransferred " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    ownershipTransferredEvents.stopWatching();

    var whitelistedEvents = contract.Whitelisted({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    whitelistedEvents.watch(function (error, result) {
      console.log("RESULT: Whitelisted " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    whitelistedEvents.stopWatching();

    var precommitmentAddedEvents = contract.PrecommitmentAdded({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    precommitmentAddedEvents.watch(function (error, result) {
      console.log("RESULT: PrecommitmentAdded " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    precommitmentAddedEvents.stopWatching();

    var tokensBoughtEvents = contract.TokensBought({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    tokensBoughtEvents.watch(function (error, result) {
      console.log("RESULT: TokensBought " + i++ + " #" + result.blockNumber + " " + JSON.stringify(result.args));
    });
    tokensBoughtEvents.stopWatching();

    var approvalEvents = contract.Approval({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    approvalEvents.watch(function (error, result) {
      console.log("RESULT: Approval " + i++ + " #" + result.blockNumber + " owner=" + result.args.owner +
        " spender=" + result.args.spender + " value=" + result.args.value.shift(-decimals));
    });
    approvalEvents.stopWatching();

    var transferEvents = contract.Transfer({}, { fromBlock: tokenFromBlock, toBlock: latestBlock });
    i = 0;
    transferEvents.watch(function (error, result) {
      console.log("RESULT: Transfer " + i++ + " #" + result.blockNumber + ": from=" + result.args.from + " to=" + result.args.to +
        " value=" + result.args.value.shift(-decimals));

    });
    transferEvents.stopWatching();

    tokenFromBlock = latestBlock + 1;
  }
}
