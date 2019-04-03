'use strict';

const parser    = require('solparse');
const rp        = require('request-promise');
const map       = require('../lib/mapping.json');
const Web3      = require('web3');
const web3      = new Web3(Web3.givenProvider);
const solReleases = require('./solReleases');
const { getPragma, processFile } =  require('./../utils/import');


module.exports.verify = async (data) => {
  try{
    const { key, path, contractAddress, network, contractName, cvalues, optimizationFlag } = data;

    if(Object.keys(map.urls).indexOf(network) > -1){
      let oFlag = 0;
      let name;
      let abiEncodedParams;
      const pragma = await getPragma(path);
      const contractSource = await processFile(path, true);
      let parsedData = parser.parse(pragma + '\n\n' + contractSource).body;
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

      const cParamsArray = parsedData.body.filter(obj => obj.type == 'ConstructorDeclaration');
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
      return await rp(options);
    }else
      throw new Error('Invalid Network/Network Not Supported!!!');
  }catch(error){
    throw error;
  }
};
