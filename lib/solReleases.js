'use strict';
const rp = require('request-promise');

module.exports.getCompilerVersion = async (parsedData, map) => {
  let compiler;
  try{
    if(parsedData[0].type != 'PragmaStatement') {
      throw new Error('No Pragma Specified!!!');
    }else {
      const pragmaVersion = parsedData[0].start_version.version;
      if(Object.keys(map.compilers).indexOf(parsedData[0].start_version.version) > -1){
        compiler = map.compilers[parsedData[0].start_version.version];
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
