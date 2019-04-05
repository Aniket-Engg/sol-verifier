#!/usr/bin/env node

'use strict';
const clc       = require('cli-color');
const program     = require('commander');
const { verify } = require('../lib/verify');
const { getNetwork } = require('../utils/network');

program
  .version(require('../package.json').version, '-v, --version')
  .option('-k, --key <etherscan-api-key>', 'Add Etherscan API Key (required)')
  .option('-c, --contract <path-to-solidity-contract-file>', 'Add Contract File Path (required)')
  .option('-a, --address <contract-address>', 'Add Address of Deployed Contract (required)')
  .option('-n, --network <network>', 'Add Ethereum Network on Which Contract is deployed (if applicable)')
  .option('-N, --contractName <contract-name>', 'Add Contract Name if Passed File Contains More Than One Contract (if applicable)') // eslint-disable-line max-len
  .option('-p, --constructParams [param1, param2,...]', 'Add Constructor Parameter Values Same as in Deployment (if applicable)') // eslint-disable-line max-len
  .option('-o, --optimize', 'Add This Flag to Optimize The Contract (optional)')
  .parse(process.argv);

(async function formalize (){
  let network;

  if(!program.key || !program.contract || !program.address)
  {
    console.log(clc.red('Error: Required Parameter Not Passed'));
    program.outputHelp();
  }
  else{
    if(program.constructParams)
      program.constructParams = program.constructParams.slice(1, (program.constructParams.length -1)).split(',');

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
      key             :   program.key,
      path            :   program.contract,
      contractAddress :   program.address,
      network         :   network,
      contractName    :   program.contractName,
      cvalues         :   program.constructParams,
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

