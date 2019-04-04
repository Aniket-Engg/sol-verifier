#!/usr/bin/env node

'use strict';
const clc       = require('cli-color');
const program     = require('commander');
const { verify , verifyStatus } = require('../lib/verify');
const { getNetwork } = require('../utils/network');

program
  .command('verifycontract')
  .description('verifies source code on etherscan')
  .version(require('../package.json').version, '-v, --version')
  .option('-k, --key <etherscan-api-key>', 'Add Etherscan API Key (required)')
  .option('-c, --contract <path-to-solidity-contract-file>', 'Add Contract File Path (required)')
  .option('-a, --address <contract-address>', 'Add Address of Deployed Contract (required)')
  .option('-n, --network <network>', 'Add Ethereum Network on Which Contract is deployed (required)')
  .option('-N, --contractName <contract-name>', 'Add Contract Name if Passed File Contains More Than One Contract (if applicable)') // eslint-disable-line max-len
  .option('-p, --constructParams [param1, param2,...]', 'Add Constructor Parameter Values Same as in Deployment (if applicable)') // eslint-disable-line max-len
  .option('-o, --optimize', 'Add This Flag to Optimize The Contract (optional)')
  .action( async function(options) {
    let network;

  if(!options.key || !options.contract || !options.address)
  {
    console.log(clc.red('Error: Required Parameter Not Passed'));
    options.outputHelp();
  }
  else{
    if(options.constructParams)
      options.constructParams = options.constructParams.slice(1, (options.constructParams.length -1)).split(',');

    if(options.network)
      network = options.network;
    else {
      const availableNets = await getNetwork(options.address);
      if(availableNets.length == 1){
        network = availableNets[0];
        console.log(clc.green(`Contract Address Found on ${network} Network!!! Verifying ...`));
      }
      else{
        console.log(clc.red(`Contract Address Found on ${availableNets} Networks. Please Provide --network Option.`));
        program.outputHelp();
        process.exit();
      }
    }

    const data = {
      key             :   options.key,
      path            :   options.contract,
      contractAddress :   options.address,
      network         :   network,
      contractName    :   options.contractName,
      cvalues         :   options.constructParams,
      optimizationFlag:   options.optimize,
    };

    try{
      const res = await verify(data);
      if(res.status == '1'){
        console.log(clc.green('Contract has been successfully verified. Your GUID receipt : ' + res.result));
      }
      else if(res.status == '0'){
        console.log(clc.red('Error: ' + res.result));
      }
    }catch(error){
      throw error;
    }
  }
})

program
  .command('verifystatus')
  .description('returns the status of GUID')
  .option('-g, --guid <guid>', 'guid returned from verifycontract command')
  .action(async function(options) {
    try{
      if(options.guid) {
        let result = await verifyStatus(options.guid)
          if(result.status == '1')
            console.log(clc.green('Contract has been successfully verified : ' + result.result));
          else 
            console.log(clc.red('Error: ' + result.result));          
      } else 
        options.outputHelp();
        process.exit();
    }catch (error){
      console.log(clc.red('Error: ',error))
    }   
  });
  
program.parse(process.argv);

if(program.args.length == 0)
  program.help();
