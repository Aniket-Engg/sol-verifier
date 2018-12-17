# sol-verifier
Verifying a contract on etherscan make your contract global and eligible for reading and writing on Etherscan. Sol-verifier is an npm package which can be used to verify the ethereum contracts on Etherscan. It internally uses the Etherscan API.

## Prerequisites
Make sure you have:
* [Node.js](https://nodejs.org/en/) installed on your system
* Etherscan Ethereum Developer [API](https://etherscan.io/apis) key-token.
* Address on which contract is deployed on the network
* Constructor parameters values (if applicable)

## Install
As a dependency, to use inside the code:
```
npm install --save sol-verifier
```
As a development dependency, to use it as `<project_root>/node_modules/.bin/solidity-docgen`
```
npm install --save-dev sol-verifier
```
As a global npm module, to use `sol-verifier` as an executable
```
npm install -g sol-verifier
```

## Run

### As CLI
Sol-verifier has multiple available options some of them are required and some depends on the usecase. One can see all the available options by using `--help` option.
```
$ sol-verifier --help
Usage: sol-verifier [options]

Options:
  -v, --version                                    output the version number
  -k, --key <etherscan-api-key>                    Add Etherscan API Key (required)
  -c, --contract <path-to-solidity-contract-file>  Add Contract File Path (required)
  -a, --address <contract-address>                 Add Address of Deployed Contract (required)
  -n, --network <network>                          Add Ethereum Network on Which Contract is deployed (required)
  -N, --contractName <contract-name>               Add Contract Name if Passed File Contains More Than One Contract (if applicable)
  -p, --constructParams [param1, param2,...]       Add Constructor parameter values same as in deployment (if applicable)
  -o, --optimize                                   Add This Flag to Optimize The Contract (optional)
  -h, --help                                       output usage information 
```
In an extensive case, where you have a file containing more than one contract and contract have a constructor which accepts some values at the time of deployment, you can use following commands for verifying contract on Etherscan. 
```
sol-verifier -k <etherscan-api-key> -c <contract-file-path> -a <contract-address> -n <network i.e. mainnet, ropsten etc.> -p <constructor-params-values as: [param1, param2]> -N <contract-name>
```
You can add flag `-o` to enable the optimization of contract. On successful verification, you will get response as :
```
Contract has been successfully verified. Your GUID receipt : zkelnp3uxnr4qg3tcxsbdt8jnbdl96jevcb268c5uru4nhmgqn
```

### By requiring in Node.js file
Require the module after installation.
```
const verifier = require('sol-verifier');
```
Now create the request object to pass as: (Make sure keys of request object will be always same.)
```
    var data = {
        key: 'FK6N4FZ33KAGQJYPQJQ8JUS6JH9ZNBFJ4N',  // Etherscan API key (required)
        path : '/path/to/contract/file/sample.sol', // Contract file path(required)
        contractAddress:  '0xec22710b71d8437a4915fba32dd95c02ad62ef19',     // Contract address (required)
        network  : 'ropsten',   // Ethereum network used (required)
        contractName: 'Sample'  // Contract name, applicable only if contract file has more than one contracts
        cvalues   : cArray,     // constructor value in array, applicable if contract has constructor
        optimizationFlag: false // Depends how you have compiled your contract (Default: false)
    };

    verifier.verifyContract(data1).then(function(res){
        console.log(res);
    })
    .catch(function(error){
        console.log('Error: ' + error.message);
    });
```
Parameters not applicable in your usecase can be ignored. Success response will look like:
```
{ status: '1',
  message: 'OK',
  result: 'zkelnp3uxnr4qg3tcxsbdt8jnbdl96jevcb268c5uru4nhmgqn' }
```
You will get a different GUID (from above response) everytime. This GUID receipt can be used to track the status of verification in the bottom section [here](https://etherscan.io/sourcecode-demo.html). (Choose the right URL according to the used network)
**Note:** Getting GUID back doesn't ensure the contract verification, unless it show `>> Pass - Verified` in the status while checking at above given link.
## Limitations

* This doesn't provide support for libraries.
* Works for solidity version `0.4.11` to `0.5.1`.
* Doesn't support `import` statements in contract file. Use available packages to flatten the contract.
* The Etherscan API that this module uses is in BETA state.

## Contribution/Suggestions
Each kind of contributions even a single suggestion or feedback makes the project mature and reliable, so any such contributions are most welcome!

## License
[MIT](https://github.com/Aniket-Engg/sol-verifier/blob/master/LICENSE)
