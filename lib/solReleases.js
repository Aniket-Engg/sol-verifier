const map = require('../lib/mapping.json');
const rp = require('request-promise');

function getCompilerVersion(parsedData) {
    return new Promise(async function(resolve, reject){
        if(parsedData[0].hasOwnProperty('start_version') == false) {
            reject(new Error('No Pragma specified !!!'))
        } else {
            var pragmaVersion = parsedData[0].start_version.version
            if(parsedData[0].type == 'PragmaStatement' && Object.keys(map.compilers).indexOf(parsedData[0].start_version.version) > -1){
                compiler = map.compilers[parsedData[0].start_version.version];
                resolve(compiler);
            } else {
                var options = {
                    method: 'GET',
                    uri: 'https://api.github.com/repos/ethereum/solidity/releases',
                    headers: {'user-agent': 'node.js'}
                };
            
                rp(options)
                .then(function (result) {
                    let data = JSON.parse(result)
                        let index = data.findIndex(obj => obj.tag_name == 'v'+pragmaVersion)
                        if(index < 0) {
                            reject(new Error('Unsupported Compiler Version/No Pragma'));
                        } else {
                            let hash = data[index].target_commitish;
                            let hashTrim = hash.substring(0,8);
                            resolve('v'+pragmaVersion+"+commit."+hashTrim);
                        }
                })
                .catch(function (err) {
                    reject(err);
                });  
            }
        }
    })
}

module.exports.getCompilerVersion = getCompilerVersion