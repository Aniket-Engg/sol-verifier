'use strict';

const solc = require('solc');
const fs = require('fs');

module.exports.compile = async (contractPath, contractName, enableOptimization) => {
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
  const compilationData = JSON.parse(solc.compile(JSON.stringify(input))).contracts['sample.sol'][contractName];
  const result = {};
  result.bytecode = compilationData.evm.bytecode.object;
  result.abi = compilationData.abi;
  return result;
};
