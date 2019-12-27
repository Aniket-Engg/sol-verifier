#!/usr/bin/env node

'use strict';
const clc       = require('cli-color');
const program     = require('commander');
const { verify } = require('../lib/verify');
const { getNetwork } = require('../utils/network');
const constructParams = require('./../utils/constructParams');

program
  .version(require('../package.json').version, '-v, --version')
  .option('-k, --key <etherscan-api-key>', 'Etherscan API Key (recommended but optional)')
  .option('-c, --contract <path-to-solidity-contract-file>', 'Contract File Path (required)')
  .option('-a, --address <contract-address>', 'Address of Deployed Contract (required)')
  .option('-n, --network <network>', 'Ethereum Network on Which Contract is deployed (if applicable)')
  .option('-N, --contractName <contract-name>', 'Contract Name if Passed File Contains More Than One Contract (if applicable)') // eslint-disable-line max-len
  .option('-p, --constructParams [param1, param2,...]', 'Constructor Parameter Values Same as in Deployment (if applicable)') // eslint-disable-line max-len
  .option('-r, --runs <runs>', 'Optimizer Runs (optional, default 200)')
  .option('-e, --evmVersion <evm-version>', 'See valid options: https://solidity.readthedocs.io/en/latest/using-the-compiler.html#target-options (optional, default compiler-default)') // eslint-disable-line max-len
  .option('-l, --licenseType <license-type>', 'Valid codes 1-12, see https://etherscan.io/contract-license-types (optional, default 1=No License)') // eslint-disable-line max-len
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
      evmVersion      :   program.evmVersion,
      licenseType     :   program.licenseType,
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

