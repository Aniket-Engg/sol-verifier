'use strict';
const clc       = require('cli-color');
const parser    = require('solidity-parser-antlr');
const rp        = require('request-promise');
const straightener = require('sol-straightener');
const map       = require('../lib/mapping.json');
const Web3      = require('web3');
const web3      = new Web3(Web3.givenProvider);
const solReleases = require('./solReleases');
const hasFallback = require('./../utils/hasFallback');

module.exports.verify = async (data, cli = false) => {
  try{
    const { key, path, contractAddress, network, contractName, cvalues, optimizationFlag } = data;

    if(Object.keys(map.urls).indexOf(network) > -1){
      let oFlag = 0;
      let name;
      let abiEncodedParams;
      let parsedData;
      const contractSource = await straightener.straighten(path);
      const ast = parser.parse(contractSource);
      const nodes = ast.children;
      const compiler = await solReleases.getCompilerVersion(nodes, map);

      const noOfContracts = nodes.filter(e => (e.type == 'ContractDefinition' && e.kind == 'contract')).length;
      if( noOfContracts == 1){
        name = nodes[1].name;
        parsedData = nodes[1];
      }else if(noOfContracts > 1){
        if(contractName){
          name = contractName;
          parsedData = nodes.filter(e => (e.type == 'ContractDefinition' && e.kind == 'contract' && e.name == contractName))[0]; // eslint-disable-line max-len
        }else
          throw new Error('More Than One Contracts in File!!! Please Provide --contractName Option');
      }

      const constructorNode = parsedData.subNodes.filter(obj => (obj.type == 'FunctionDefinition' && obj.isConstructor == true)); // eslint-disable-line max-len

      if(constructorNode.length > 0 && constructorNode[0].parameters.parameters.length > 0){
        const cParamsArray = constructorNode[0].parameters.parameters;
        if(cvalues){
          parser.visit(ast, {
            UserDefinedTypeName: function (node) {
              const contract = nodes.filter(e => (e.type == 'ContractDefinition' && e.name == node.namePath))[0];
              let stateMutability = null;
              if (hasFallback(contract)) {
                stateMutability = 'payable';
              }
              node.resolvedType = {
                type: 'ElementaryTypeName',
                name: 'address',
                stateMutability: stateMutability,
              };
            },
          });
          const cparams = [];
          for (const param of cParamsArray){
            if(param.typeName.type == 'UserDefinedTypeName')
              cparams.push(param.typeName.type.resolvedType.name);
            cparams.push(param.typeName.name);
          }
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
