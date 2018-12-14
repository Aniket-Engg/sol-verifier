const parser    = require("solparse");
const fs        = require('fs');
const rp        = require('request-promise');
const map       = require('../lib/mapping.json');
const Web3      = require('web3');
const web3      = new Web3(Web3.givenProvider);


module.exports.verify = (key, path, contractAddress, network, cvalues, optimizationFlag) => {

    return new Promise(function(resolve, reject){
        
        if(Object.keys(map.urls).indexOf(network) > -1){
            var oFlag = 0;
            const contractSource = fs.readFileSync(path,'UTF-8');
            const parsedData = parser.parse(contractSource).body;
            if(parsedData[0].type == 'PragmaStatement' && Object.keys(map.compilers).indexOf(parsedData[0].start_version.version) > -1)
                compiler = map.compilers[parsedData[0].start_version.version];
            else
                reject(new Error('Unsupported Compiler Version/No Pragma'))
            
            if(parsedData[1].type == 'ContractStatement'){
                var name = parsedData[1].name;
            }
            
            if(optimizationFlag)
                oFlag = 1;

            if(cvalues){
                cvalues = cvalues.slice(1, (cvalues.length -1)).split(',');
                var cParamsObj = parsedData[1].body.filter(obj => obj.type == 'ConstructorDeclaration')[0].params;
                var cparams = [];
                cParamsObj.forEach(param => cparams.push(param.literal.literal));
                var abiEncodedParams = web3.eth.abi.encodeParameters(cparams, cvalues);
                
            }

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
                constructorArguements: abiEncodedParams.slice(2, abiEncodedParams.length)
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
        }
        else
            reject(new Error('Invalid Network Passed'));
    })
}