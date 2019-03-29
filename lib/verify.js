'use strict';

const parser    = require('solparse');
const fs        = require('fs');
const rp        = require('request-promise');
const map       = require('../lib/mapping.json');
const Web3      = require('web3');
const web3      = new Web3(Web3.givenProvider);
var solReleases = require('./solReleases');


module.exports.verify = (data) => {

    var {key, path, contractAddress, network, contractName, cvalues, optimizationFlag} = data;
    return new Promise(function(resolve, reject){
        
        if(Object.keys(map.urls).indexOf(network) > -1){
            var oFlag = 0;
            var compiler;
            const contractSource = fs.readFileSync(path,'UTF-8');
            var parsedData = parser.parse(contractSource).body;
            solReleases.getCompilerVersion(parsedData,map)
            .then(result => {
                compiler = result;
                var noOfContracts = parsedData.filter(e => e.type == 'ContractStatement').length;
            
                if( noOfContracts == 1){
                    var name = parsedData[1].name;
                    parsedData = parsedData[1];
                }else if(noOfContracts > 1){
                    if(contractName){
                        name = contractName;
                        parsedData = parsedData.filter(e => (e.type == 'ContractStatement' && e.name == contractName))[0];
                    }
                    else
                        reject(new Error('More Than One Contracts in File, Pass the Contract Name'));
                }

                var cParamsArray = parsedData.body.filter(obj => obj.type == 'ConstructorDeclaration');
                if(cParamsArray.length > 0 && cParamsArray[0].params.length > 0){
                    if(cvalues){
                        var cparams = [];
                        cParamsArray[0].params.forEach(param => cparams.push(param.literal.literal));
                        var abiEncodedParams = web3.eth.abi.encodeParameters(cparams, cvalues);
                        abiEncodedParams = abiEncodedParams.slice(2, abiEncodedParams.length);
                    }
                    else
                        reject(new Error('Constructor Found, Pass the Constructor Parameter Values'));
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
                    constructorArguements: abiEncodedParams
                };

                var options = {
                    method: 'POST',
                    uri: map.urls[network],
                    form: data,
                    json: true 
                };

                rp(options)
                .then(function (result) {
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                });
            })
            .catch(error => {
                reject(error)
            })
        }
        else
          reject(new Error('Constructor Found, Pass the Constructor Parameter Values'));
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

      rp(options)
        .then(function (result) {
          resolve(result);
        })
        .catch(function (err) {
          reject(err);
        });
    }
    else
      reject(new Error('Invalid Network Passed'));
  });
};
