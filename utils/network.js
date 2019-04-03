'use strict';

const ethers      = require('ethers');
const map       = require('../lib/mapping.json');

module.exports.getNetwork = async (contractAddress) => {
  const networks = Object.keys(map.urls);
  const finalNetworks = [];
  for(const network of networks) {
    const defaultProvider = ethers.getDefaultProvider(network);
    const code = await defaultProvider.getCode(contractAddress);
    if(code != '0x')
      finalNetworks.push(network);
  }
  return finalNetworks;
};
