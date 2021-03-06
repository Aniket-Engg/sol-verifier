[![npm version](https://badge.fury.io/js/sol-verifier.svg)](https://www.npmjs.com/package/sol-verifier)
[![Build status](https://travis-ci.com/Aniket-Engg/sol-verifier.svg?branch=master)](https://travis-ci.com/Aniket-Engg/sol-verifier)
[![Coverage Status](https://coveralls.io/repos/github/Aniket-Engg/sol-verifier/badge.svg?branch=master)](https://coveralls.io/github/Aniket-Engg/sol-verifier?branch=master)
[![npm](https://img.shields.io/npm/dw/sol-verifier.svg)](https://www.npmjs.com/package/sol-verifier)
[![npm](https://img.shields.io/npm/dt/sol-verifier.svg?label=Total%20Downloads)](https://www.npmjs.com/package/sol-verifier)
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
  -k, --key <etherscan-api-key>                    Etherscan API Key (recommended but optional)
  -c, --contract <path-to-solidity-contract-file>  Contract File Path (required)
  -a, --address <contract-address>                 Address of Deployed Contract (required)
  -n, --network <network>                          Ethereum Network on Which Contract is deployed (if applicable)
  -N, --contractName <contract-name>               Contract Name if Passed File Contains More Than One Contract (if applicable)
  -p, --constructParams [param1, param2,...]       Constructor Parameter Values Same as in Deployment (if applicable)
  -r, --runs <runs>                                Optimizer Runs (optional, default 200)
  -e, --evmVersion <evm-version>                   See valid options: https://solidity.readthedocs.io/en/latest/using-the-compiler.html#target-options (optional, default compiler-default)
  -l, --licenseType <license-type>                 Valid codes 1-12, see https://etherscan.io/contract-license-types (optional, default 1=No License)
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

When you have a contract importing some other contracts and having constructor with parameters, it can be verified with this command:
```
$ sol-verifier -k <etherscan-api-key> -c <contract-file-path> -a <contract-address> -n <network i.e. mainnet, ropsten etc.> -p <constructor-params-values as: [param1,param2]> -N <contract-name>
```
If contract is compiled & deployed by enabling optimization, flag `-o` can be used to enable the optimization during verification. On successful verification, you will get response as :
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
        evmVersion: 'istanbul',                         // See valid options: https://solidity.readthedocs.io/en/latest/using-the-compiler.html#target-options (optional, default compiler-default)
        runs: 200,                                      // Optimizer Runs (optional, default 200)
        licenseType: 1,                                 // Valid codes 1-12, see https://etherscan.io/contract-license-types (optional, default 1=No License)
        optimizationFlag: false                         // Set `true` to enable optimization (default false)
    };

    await verifier.verifyContract(data);
```
Parameters not applicable can be ignored. 

**Note:** In case of array as constructor parameters, pass values as: [[v1, v2], v3, v4] (This feature is available since version v2.1.0)

## Points to remember
* Add specific version with `^` in your contract pragma. Version should be same as the compiler version used while contract deployment.
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
