const parser    = require("solparse");
const fs        = require('fs');
const rp        = require('request-promise');

module.exports.verify = (key, path, contractAddress, network, optimizationFlag) => {
    const URL = {
        ropsten: 'https://api-ropsten.etherscan.io/api',
        kovan: 'https://api-kovan.etherscan.io/api',
        rinkeby: 'https://api-rinkeby.etherscan.io/api',
        mainnet: 'https://api.etherscan.io/api'
      };

    return new Promise(function(resolve, reject){
        
        if(Object.keys(URL).indexOf(network) > -1){
            var oFlag = 0;
            const contractSource = fs.readFileSync(path,'UTF-8');
            const parsedData = parser.parse(contractSource).body;
            if(parsedData[0].type == 'PragmaStatement')
                var compiler = 'v' + parsedData[0].start_version.version;
            else
                reject(new Error('Pragma Not found'))
            
            if(parsedData[1].type == 'ContractStatement'){
                var name = parsedData[1].name;}
            
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
                runs: '200'
            };

            var options = {
                method: 'POST',
                uri: URL[network],
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