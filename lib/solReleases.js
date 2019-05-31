'use strict';
const rp = require('request-promise');

module.exports.getCompilerVersion = async (parsedData, map) => {
  let compiler;
  try{
    if(parsedData[0].type != 'PragmaDirective') {
      throw new Error('No Pragma Specified!!!');
    }else {
      let pragmaVersion = parsedData[0].value;
      if(pragmaVersion.indexOf('<') > -1 || pragmaVersion.indexOf('>') > -1)
        throw new Error('Add Specific Compiler Version Pragma !!!');
      pragmaVersion = pragmaVersion.replace('^', '');

      if(Object.keys(map.compilers).indexOf(pragmaVersion) > -1){
        compiler = map.compilers[pragmaVersion];
        return compiler;
      }else {
        const options = {
          method: 'GET',
          uri: 'https://raw.githubusercontent.com/ethereum/solc-bin/gh-pages/bin/list.json',
        };
        const result = await rp(options);
        const data = JSON.parse(result);
        if(!data.releases.hasOwnProperty(pragmaVersion)) {
          throw new Error('Unsupported Compiler Version!!!');
        }else {
          const commit = data.releases[pragmaVersion];
          return commit.slice(8, 30);
        }
      }
    }
  }catch(err) {
    throw err;
  };
};
