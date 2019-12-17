'use strict';

const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
const solc = require('./solc');

const SEED = process.env.SEED;
const INFURA_TOKEN = process.env.INFURA_TOKEN;

module.exports.deployContract = async (contractName, network, compiler, contractPath = null, initParams = [], optimize = false, runs = 200) => {// eslint-disable-line max-len
  const infuraEndpoint = 'https://' + network +'.infura.io/v3/' + INFURA_TOKEN;
  const provider = new HDWalletProvider(SEED, infuraEndpoint);
  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];
  if(!contractPath)
    contractPath = __dirname + '/../contracts/'+ contractName + '.sol';
  try{
    const { bytecode, abi } = await solc.compile(contractPath, contractName, optimize, compiler, runs);
    const myContract = new web3.eth.Contract(abi);
    const result = await myContract.deploy({
      data: '0x' + bytecode,
      arguments: initParams,
    })
      .send({
        from: account,
      });
    return result.options.address;
  }catch(err){
    throw err;
  }

};
