#!/usr/bin/env node

const clc       = require("cli-color");
var program     = require('commander');
const { verify } = require('../lib/verify');

program
  .version(require("../package.json").version, '-v, --version')
  .option('-k, --key <etherscan-api-key>', 'Add Etherscan API Key (required)')
  .option('-c, --contract <path-to-solidity-contract-file>', 'Add Contract File Path (required)')
  .option('-a, --address <contract-address>', 'Add Address of Deployed Contract (required)')
  .option('-n, --network <network>', 'Add Ethereum Network on Which Contract is deployed (required)')
  .option('-N, --contractName <contract-name>', 'Add Contract Name if Passed File Contains More Than One Contract (if applicable)')
  .option('-p, --constructParams [param1, param2,...]', 'Add Constructor Parameter Values Same as in Deployment (if applicable)')
  .option('-o, --optimize', 'Add This Flag to Optimize The Contract (optional)')
  .parse(process.argv);
  
if(!program.key || !program.contract || !program.address || !program.network)
{
    console.log(clc.red("Error: Required parameter not passed"));
    program.outputHelp();
}
else{
    verify(program.key, program.contract, program.address, program.network, program.contractName, program.constructParams, program.optimize)
    .then(function(res){
        if(res.status == '1'){
            console.log(clc.green('Contract has been successfully verified. Your GUID receipt : ' + res.result));
        }
        else if(res.status == '0'){
            console.log(clc.red('Error: ' + res.result));
        }
    })
    .catch(function(error){
        console.log(clc.red('Error: ' + error.message));
    });
}


 
