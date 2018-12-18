const Web3 = require('web3');
const HDWalletProvider = require("truffle-hdwallet-provider");
const solc = require('./solc');
const config = require('./config.json');


module.exports.deployContract = async (contractName, network, initParams = [] ) => {
    var net = 'https://' + network +'.infura.io/';
    var web3 = new Web3(new HDWalletProvider(config.seeds, net));
    let contractPath = __dirname + "/../contracts/"+ contractName + ".sol";
    try{
        let {bytecode, abi } = await solc.compile(contractPath, contractName);
        let myContract = new web3.eth.Contract(abi);
        let result = await myContract.deploy({
            data: '0x' + bytecode,
            arguments: initParams
        })
        .send({
            from: config.address,
        });
        return result.options.address;
    }catch(err){
        throw err;
    }
    
}