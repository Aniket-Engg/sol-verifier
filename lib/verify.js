'use strict';
const clc       = require('cli-color');
const parser    = require('solparse');
const rp        = require('request-promise');
const straightener = require('sol-straightener');
const map       = require('../lib/mapping.json');
const Web3      = require('web3');
const web3      = new Web3(Web3.givenProvider);
const solReleases = require('./solReleases');

module.exports.verify = async (data, cli = false) => {
  try{
    const { key, path, contractAddress, network, contractName, cvalues, optimizationFlag } = data;

    if(Object.keys(map.urls).indexOf(network) > -1){
      let oFlag = 0;
      let name;
      let abiEncodedParams;
      const contractSource = await straightener.straighten(path);
      let parsedData = parser.parse(contractSource).body;

      const compiler = await solReleases.getCompilerVersion(parsedData, map);
      const noOfContracts = parsedData.filter(e => e.type == 'ContractStatement').length;
      if( noOfContracts == 1){
        name = parsedData[1].name;
        parsedData = parsedData[1];
      }else if(noOfContracts > 1){
        if(contractName){
          name = contractName;
          parsedData = parsedData.filter(e => (e.type == 'ContractStatement' && e.name == contractName))[0];
        }else
          throw new Error('More Than One Contracts in File!!! Please Provide --contractName Option');
      }
      const cParamsArray = parsedData.body.filter(obj => (obj.type == 'ConstructorDeclaration')||(obj.type == 'FunctionDeclaration' && obj.name == name)); // eslint-disable-line max-len
      if(cParamsArray.length > 0 && cParamsArray[0].params && cParamsArray[0].params.length > 0){
        if(cvalues){
          const cparams = [];
          cParamsArray[0].params.forEach(param => cparams.push(param.literal.literal));
          abiEncodedParams = web3.eth.abi.encodeParameters(cparams, cvalues);
          abiEncodedParams = abiEncodedParams.slice(2, abiEncodedParams.length);
        }else
          throw new Error('Constructor Found!!! Please Provide --constructParams Option');
      }
      else
        abiEncodedParams = '';

      if(optimizationFlag)
        oFlag = 1;
      const data = {
        apikey: key,
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: contractAddress,
        sourceCode: contractSource,
        contractname: name,
        compilerversion: compiler,
        optimizationUsed: oFlag,
        runs: '200',
        constructorArguements: abiEncodedParams,
      };

      const options = {
        method: 'POST',
        uri: map.urls[network],
        form: data,
        json: true,
      };
      const result =  await rp(options);
      if(result.status == 0) {
        throw new Error(result.result);
      } else {
        const dataObj = {
          guid: result.result,
          module: 'contract',
          action: 'checkverifystatus',
        };

        const obj = {
          method: 'GET',
          uri: map.urls[network],
          form: dataObj,
        };
        const ms = 3000;
        let count = 0;
        async function lookupGuid (obj, ms) {
          await sleep(ms);
          const data = await rp(obj);
          if (count < 10) {
            if(JSON.parse(data).result == 'Pending in queue'){
              if (cli == true) {
                console.log(clc.yellow('Pending in queue...'));
                console.log(clc.yellow('Please wait...'));
              }
              count++;
              return await lookupGuid(obj, ms);
            } else {
              return JSON.parse(data);
            }
          } else {
            throw new Error('Contract Verification Timeout!!! Check Final Status on Etherscan');
          }
        }
        return await lookupGuid(obj, ms);
      }
    }else
      throw new Error('Invalid Network/Network Not Supported!!!');
  }catch(error){
    throw error;
  }
};

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
