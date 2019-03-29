'use strict';
const rp = require('request-promise');

function getCompilerVersion (parsedData, map) {
  let compiler;
  return new Promise(async function (resolve, reject){
    if(parsedData[0].type != 'PragmaStatement') {
      reject(new Error('No Pragma Specified !!!'));
    } else {
      const pragmaVersion = parsedData[0].start_version.version;
      if(Object.keys(map.compilers).indexOf(parsedData[0].start_version.version) > -1){
        compiler = map.compilers[parsedData[0].start_version.version];
        resolve(compiler);
      } else {
        const options = {
          method: 'GET',
          uri: 'https://api.github.com/repos/ethereum/solidity/releases',
          headers: { 'user-agent': 'sol-verifier' },
        };

        rp(options)
          .then(function (result) {
            const data = JSON.parse(result);
            const index = data.findIndex(obj => obj.tag_name == 'v'+pragmaVersion);
            if(index < 0) {
              reject(new Error('Unsupported Compiler Version'));
            } else {
              const hash = data[index].target_commitish;
              const hashTrim = hash.substring(0, 8);
              resolve('v'+pragmaVersion+'+commit.'+hashTrim);
            }
          })
          .catch(function (err) {
            reject(err);
          });
      }
    }
  });
}

module.exports.getCompilerVersion = getCompilerVersion;
