const solc = require('solc');
const fs = require('fs');

module.exports.compile = async (contractPath, contractName) => {
    var input = {
        language: 'Solidity',
        sources: {
                'sample.sol': {
                    content : fs.readFileSync(contractPath, 'utf8')
                }
            },
        settings: {
            outputSelection: {
                '*': {
                    '*': [ '*' ]
                }
            }
        }
    };
    let compilationData = JSON.parse(solc.compile(JSON.stringify(input))).contracts['sample.sol'][contractName];
    let result = {};
    result.bytecode = compilationData.evm.bytecode.object;
    result.abi = compilationData.abi;
    return result;
}