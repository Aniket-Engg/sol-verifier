#!/usr/bin/env node

'use strict';
const clc       = require('cli-color');
const program     = require('commander');
const { verify } = require('../lib/verify');
const { getNetwork } = require('../utils/network');
const constructParams = require('./../utils/constructParams');

program
  .version(require('../package.json').version, '-v, --version')
  .option('-k, --key <etherscan-api-key>', 'Add Etherscan API Key (recommended but optional)')
  .option('-c, --contract <path-to-solidity-contract-file>', 'Add Contract File Path (required)')
  .option('-a, --address <contract-address>', 'Add Address of Deployed Contract (required)')
  .option('-n, --network <network>', 'Add Ethereum Network on Which Contract is deployed (if applicable)')
  .option('-N, --contractName <contract-name>', 'Add Contract Name if Passed File Contains More Than One Contract (if applicable)') // eslint-disable-line max-len
  .option('-p, --constructParams [param1, param2,...]', 'Add Constructor Parameter Values Same as in Deployment (if applicable)') // eslint-disable-line max-len
  .option('-r, --runs <runs>', 'Add Optimizer Runs (optional, default 200)')
  .option('-o, --optimize', 'Add This Flag to Optimize The Contract (optional)')
  .parse(process.argv);

(async function (){
  let network;
  let key;

  if(!program.contract || !program.address)
  {
    console.log(clc.red('Error: Missing Required Parameter. Please Provide --contract & --address Both Options.'));
    program.outputHelp();
  }
  else{
    if(!program.key)
    //It is recommended to use your own API key. This key is once/twice to use to make the package user-friendly.
      key = 'JHVMB2A24SC4QYGA9KYINSQEUFU9CSHDAK';
    else
      key = program.key;

    if(program.constructParams)
      program.constructParams = constructParams(program.constructParams.slice(1, (program.constructParams.length -1)).split(',')); // eslint-disable-line max-len

    if(program.network)
      network = program.network;
    else {
      const availableNets = await getNetwork(program.address);
      if(availableNets.length == 1){
        network = availableNets[0];
        console.log(clc.yellow(`Contract Address Found on ${network} Network!!! Verifying ...`));
      }
      else{
        console.log(clc.red(`Contract Address Found on ${availableNets} Networks. Please Provide --network Option.`));
        program.outputHelp();
        process.exit();
      }
    }

    const data = {
      key             :   key,
      path            :   program.contract,
      contractAddress :   program.address,
      network         :   network,
      contractName    :   program.contractName,
      cvalues         :   program.constructParams,
      runs            :   program.runs,
      optimizationFlag:   program.optimize,
    };
    try{
      const res = await verify(data, true);
      if(res.status == '1'){
        console.log(clc.green('Info: Contract has been successfully verified.'));
      }
      else if(res.status == '0'){
        if(res.result == 'Fail - Unable to verify')
          console.log(clc.red('Error: Contract could not be verified.'));
        else
          console.log(clc.red('Error: ' + res.result));
      }
    }catch(error){
      console.log(clc.red('Error: ' + error.message));
    }
  }
})();

