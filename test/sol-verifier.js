'use strict';
const Verifier = require('../index')
const { deployContract } = require('./utils/deploy');
require('chai').should();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 

describe('sol-verifier', () => {

    describe('Deploying & Verifying Sample.sol', () => {
        var contractAddress;
        var contractName;
        var network;
        var sampleData;
        before('Deploy Sample.sol', async () => {
            try{
                contractName = 'Sample';
                network = 'rinkeby';
                contractAddress = await deployContract(contractName, network);
                await sleep(30000); // To make sure that contractCode is stored
            }catch(err){
                throw err;
            }
        })
        it('Verifies Sample.sol contract successfully', async () => {
            sampleData = {
                key: process.env.KEY,
                path : __dirname + '/contracts/'+ contractName +'.sol', 
                contractAddress:  contractAddress,
                network  : network 
            }; 
            let response = await Verifier.verifyContract(sampleData);
            response.status.should.equal('1');
        });

        it('Trying to verify already verified contract (should fail)', async () => {
            await sleep(20000); // To make sure that etherscan gets sufficient time to verify the contract above
            let response = await Verifier.verifyContract(sampleData);
            response.status.should.equal('0');
            response.result.should.equal('Contract source code already verified');
        });

        it('Trying to verify contract without passing Etherscan API key (should fail)', async () => {
            var temp = {
                key: '',
                path : __dirname + '/contracts/'+ contractName +'.sol', 
                contractAddress:  contractAddress,
                network  : network};
            let response = await Verifier.verifyContract(temp);
            response.status.should.equal('0');
            response.result.should.equal('Missing or invalid ApiKey');
        });

        it('Trying to verify contract by passing non-existing Ethereum network (should fail)', async () => {
            var temp = {
                key: process.env.KEY,
                path : __dirname + '/contracts/'+ contractName +'.sol', 
                contractAddress:  contractAddress,
                network  : "random"
            };
            try{
                await Verifier.verifyContract(temp);
            }catch(err){
                err.message.should.equal('Invalid Network Passed');
            }
        });

        it('Trying to pass a contract without pragma statement (should fail)', async () => {
            var temp = {
                key: process.env.KEY,
                path : __dirname + '/contracts/'+ 'SampleWithoutPragma' +'.sol', 
                contractAddress:  contractAddress,
                network  : "rinkeby"
            };
            try{
                await Verifier.verifyContract(temp);
            }catch(err){
               err.message.should.equal('Unsupported Compiler Version/No Pragma');
            }
        });

        it('Trying to verify contract by passing invalid contract address (should fail)', async () => {
            sampleData.contractAddress = '0x1234567890';
            let response = await Verifier.verifyContract(sampleData);
            response.status.should.equal('0');
            response.result.should.equal('Missing or invalid contractAddress (should start with 0x)');
        });
    });



    describe('Deploying & Verifying SampleWithConstructor.sol', () => {
        var contractAddress;
        var contractName;
        var network;
        var sampleData;
        var constructParams = [];
        before('Deploy SampleWithConstructor.sol', async () => {
            try{
                contractName = 'SampleWithConstructor';
                network = 'rinkeby';
                constructParams.push(50);
                contractAddress = await deployContract(contractName, network, constructParams);
                await sleep(30000); // To make sure that contractCode is stored
            }catch(err){
                throw err;
            }
        })

        it('Verifies SampleWithConstructor.sol contract successfully', async () => {
            sampleData = {
                key     : process.env.KEY,
                path    : __dirname + '/contracts/'+ contractName +'.sol', 
                contractAddress:  contractAddress,
                network : network,
                cvalues : constructParams 
            }; 
            let response = await Verifier.verifyContract(sampleData);
            response.status.should.equal('1');
        });

        it('Trying to verify SampleWithConstructor contract with passing constructor values (should fail)', async () => {
            sampleData.cvalues = null;
            try{
                await Verifier.verifyContract(sampleData);
            }catch(err){
                err.message.should.equal('Constructor Found, Pass the Constructor Parameter Values');
            }
        });
    });

    describe('Deploying & Verifying MultiContractSample.sol', () => {
        var contractAddress;
        var contractName;
        var network;
        var sampleData;
        var constructParams = [];
        before('Deploy MultiContractSample.sol', async () => {
            try{
                contractName = 'MultiContractSample';
                network = 'rinkeby';
                constructParams.push(40);
                contractAddress = await deployContract(contractName, network, constructParams);
                await sleep(30000); // To make sure that contractCode is stored
            }catch(err){
                throw err;
            }
        })

        it('Verifies MultiContractSample.sol contract successfully', async () => {
            sampleData = {
                key     : process.env.KEY,
                path    : __dirname + '/contracts/'+ contractName +'.sol', 
                contractAddress:  contractAddress,
                network : network,
                cvalues : constructParams,
                contractName    :   contractName
            }; 
            let response = await Verifier.verifyContract(sampleData);
            response.status.should.equal('1');
        });

        it('Trying to verify MultiContractSample contract with passing contractName(should fail)', async () => {
            sampleData.contractName = null;
            try{
                await Verifier.verifyContract(sampleData);
            }catch(err){
                err.message.should.equal('More Than One Contracts in File, Pass the Contract Name');
            }
        });
    });
});