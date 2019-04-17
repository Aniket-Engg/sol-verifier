[![npm version](https://badge.fury.io/js/sol-verifier.svg)](https://www.npmjs.com/package/sol-verifier)
[![Build status](https://travis-ci.com/Aniket-Engg/sol-verifier.svg?branch=master)](https://travis-ci.com/Aniket-Engg/sol-verifier)
[![Coverage Status](https://coveralls.io/repos/github/Aniket-Engg/sol-verifier/badge.svg?branch=master)](https://coveralls.io/github/Aniket-Engg/sol-verifier?branch=master)
[![npm](https://img.shields.io/npm/dt/sol-verifier.svg)](https://www.npmjs.com/package/sol-verifier)
![NPM](https://img.shields.io/npm/l/sol-verifier.svg)
[![Package Quality](https://npm.packagequality.com/shield/sol-verifier.svg)](https://packagequality.com/#?package=sol-verifier)

# sol-verifier
sol-verifier is an NPM package to verify the Solidity smart contracts on Etherscan. It works as a CLI tool and can be used inside the js file too. 

## Install
As a dependency, to use inside a file:
```
npm install --save sol-verifier
```
As a development dependency, to use it as `<project_root>/node_modules/.bin/sol-verifier`:
```
npm install --save-dev sol-verifier
```
As a global npm module, to use `sol-verifier` as an executable:
```
npm install -g sol-verifier
```

## How to use

### As a CLI tool
sol-verifier has multiple available options. some of them are required and some depends on the usecase. One can see all the available options by using `--help` option.
```
$ sol-verifier --help
Usage: sol-verifier [options]

Options:
  -v, --version                                    output the version number
  -k, --key <etherscan-api-key>                    Add Etherscan API Key (recommended but optional)
  -c, --contract <path-to-solidity-contract-file>  Add Contract File Path (required)
  -a, --address <contract-address>                 Add Address of Deployed Contract (required)
  -n, --network <network>                          Add Ethereum Network on Which Contract is deployed (if applicable)
  -N, --contractName <contract-name>               Add Contract Name if Passed File Contains More Than One Contract (if applicable)
  -p, --constructParams [param1, param2,...]       Add Constructor Parameter Values Same as in Deployment (if applicable)
  -o, --optimize                                   Add This Flag to Optimize The Contract (optional)
  -h, --help                                       output usage information 
```
Keeping the user-friendliness in mind, sol-verifier process certain information internally until it is explicitly required. For example, in a minimum case, if someone deploys a contract as below on some Ethereum network(which exists only on one network),
```
pragma solidity ^0.5.7;

contract SimpleStorage {
    uint storedData;

    function set(uint x) public {
        storedData = x;
    }

    function get() public view returns (uint) {
        return storedData;
    }
}
```
by CLI, it can be verified with this command:
```
$ sol-verifier -c <contract-file-path> -a <contract-address>
```
That's it.

In an extensive one, where you have a contract importing some other contracts and having constructor with parameters,it can be verified with this command:
```
$ sol-verifier -k <etherscan-api-key> -c <contract-file-path> -a <contract-address> -n <network i.e. mainnet, ropsten etc.> -p <constructor-params-values as: [param1,param2]> -N <contract-name>
```
If contract is deployed by enabling optimization, flag `-o` can be used to enable the optimization during verification. On successful verification, you will get response as :
```
Info: Contract has been successfully verified.
```

### By requiring in file
A request object will be passed to verify contract. See below: (Make sure keys of request object will be always same)
```
    const verifier = require('sol-verifier');
    var data = {
        key: 'etherscan-api-key',                       // Etherscan API key (required)
        path : '/path/to/contract/contractName.sol',    // Contract file path(required)
        contractAddress:  '0x123456789.......',         // Contract address (required)
        network  : 'mainnet/ropsten/rinkeby/kovan',     // Ethereum network used (required)
        contractName: 'contractName'                    // Contract name, only if contract file has more than one contracts
        cvalues   : [constructor, values, in, array],   // constructor values in array, only if contract has constructor
        optimizationFlag: false                         // Set `true` to enable optimization (Default: false)
    };

    await verifier.verifyContract(data);
```
Parameters not applicable can be ignored.

## Points to remember
* This doesn't provide support for libraries.
* Works for solidity version `> 0.4.11`.
* The Etherscan API that this module uses is in BETA state.
* Maximum time for processing verification request is 30 seconds. If request timed out, check final result on Etherscan itself.

## Contribution
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/Aniket-Engg/sol-verifier/issues)

Each kind of contributions even a single suggestion or feedback makes project mature and reliable.

## License
[MIT](https://github.com/Aniket-Engg/sol-verifier/blob/master/LICENSE)

### <i>Powered by Etherscan.io APIs</i>
