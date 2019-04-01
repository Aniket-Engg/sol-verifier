'use strict';

const solc = require('solc');
const fs = require('fs');
const util = require('util');

module.exports.compile = async (contractPath, contractName, enableOptimization, compiler) => {
  const input = {
    language: 'Solidity',
    sources: {
      'sample.sol': {
        content : fs.readFileSync(contractPath, 'utf8'),
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': [ '*' ],
        },
      },
    },
  };

  if(enableOptimization)
    input.settings.optimizer = { enabled: true };
  const loadRemoteVersion = util.promisify(solc.loadRemoteVersion);
  const remoteSolc = await loadRemoteVersion(compiler);
  const compilationData = JSON.parse(remoteSolc.compile(JSON.stringify(input))).contracts['sample.sol'][contractName];
  const result = {};
  result.bytecode = compilationData.evm.bytecode.object;
  result.abi = compilationData.abi;
  return result;
};
