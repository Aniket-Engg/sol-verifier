'use strict';
const rp = require('request-promise');

function getCompilerVersion (parsedData, map) {
  let compiler;
  return new Promise(function (resolve, reject){
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
          uri: 'https://raw.githubusercontent.com/ethereum/solc-bin/gh-pages/bin/list.json',
        };

        rp(options)
          .then(function (result) {
            const data = JSON.parse(result);
            if(!data.releases.hasOwnProperty(pragmaVersion)) {
              reject(new Error('Unsupported Compiler Version'));
            } else {
              const commit = data.releases[pragmaVersion];
              resolve(commit.slice(8, 30));
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
