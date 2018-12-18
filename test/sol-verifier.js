'use strict';
const Verifier = require('../index')
const { deployContract } = require('./utils/deploy');
const config = require('./utils/config.json');
const assert = require('assert');
describe('sol-verifier', async () => {

    describe('Deploying & Verifying Simple Contract', async() => {
        var contractAddress;
        var contractName;
        var network;
        before('Deploy', async () => {
            try{
                contractName = 'Simple';
                network = 'ropsten';
                contractAddress = await deployContract(contractName, network);
            }catch(err){
                throw err;
            }
        })
        it('should verify contract successfully', async () => {
            var data = {
                key: config.key,
                path : __dirname + '/contracts/'+ contractName +'.sol', 
                contractAddress:  contractAddress,
                network  : network 
            }; 
            try{
                let response = await Verifier.verifyContract(data);
                console.log(response);
                assert.equal(response.status, 1);
            }catch(err){
                throw err;
            }
        });
        // it('should set default options2', () => {
            
        // });
    })

  
});