'use strict';
const fs = require('fs');
const parser = require('solidity-parser-antlr');
const Verifier = require('../index');
const { deployContract } = require('./utils/deploy');
const solReleases = require('../lib/solReleases');
const mockMap = require('./utils/mock_mapping.json');
const { getPragma, processFile } =  require('./utils/import');
require('chai').should();

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const ETHERSCAN_KEY = process.env.KEY;

describe('sol-verifier', () => {

  describe('Deploying & Verifying Sample.sol', () => {
    let contractAddress;
    let contractName;
    let network;
    let sampleData;
    let path;
    before('Deploy Sample.sol', async () => {
      try{
        contractName = 'Sample';
        network = 'rinkeby';
        path = __dirname + '/contracts/'+ contractName +'.sol';
        const contractSource = fs.readFileSync(path, 'UTF-8');
        const parsedData = parser.parse(contractSource).children;
        const compiler = await solReleases.getCompilerVersion(parsedData, mockMap);
        contractAddress = await deployContract(contractName, network, compiler);
        await sleep(30000); // To make sure that contractCode is stored
      }catch(err){
        throw err;
      }
    });
    it('Verifies Sample.sol contract successfully', async () => {
      sampleData = {
        key: ETHERSCAN_KEY,
        path : path,
        contractAddress:  contractAddress,
        network  : network,
      };
      const response = await Verifier.verifyContract(sampleData);
      await sleep(30000);
      response.status.should.equal('1');
    });

    it('Trying to verify already verified contract (should fail)', async () => {
      await sleep(30000); // To make sure that etherscan gets sufficient time to verify the contract above
      try {
        await Verifier.verifyContract(sampleData);
      }catch(error) {
        error.message.should.equal('Contract source code already verified');
      }
    });

    it('Trying to verify contract without passing Etherscan API key (should fail)', async () => {
      try{
        const temp = {
          key: '',
          path : path,
          contractAddress:  contractAddress,
          network  : network };
        await Verifier.verifyContract(temp);
      }catch(error) {
        error.message.should.equal('Missing or invalid ApiKey');
      }
    });

    it('Trying to verify contract by passing non-existing Ethereum network (should fail)', async () => {
      const temp = {
        key: ETHERSCAN_KEY,
        path : path,
        contractAddress:  contractAddress,
        network  : 'random',
      };
      try{
        await Verifier.verifyContract(temp);
      }catch(err){
        err.message.should.equal('Invalid Network/Network Not Supported!!!');
      }
    });

    it('Trying to verify contract by passing invalid contract address (should fail)', async () => {
      try{
        sampleData.contractAddress = '0x1234567890';
        await Verifier.verifyContract(sampleData);
      } catch (error) {
        error.message.should.equal('Missing or invalid contractAddress (should start with 0x)');
      }

    });
  });

  describe('Compiling & Verifying Sample.sol with all explicit options', () => {
    let contractAddress;
    let contractName;
    let network;
    let sampleData;
    let path;
    before('Compile & Deploy Sample.sol', async () => {
      try{
        contractName = 'Sample';
        network = 'rinkeby';
        path = __dirname + '/contracts/'+ contractName +'.sol';
        const contractSource = fs.readFileSync(path, 'UTF-8');
        const parsedData = parser.parse(contractSource).children;
        const compiler = await solReleases.getCompilerVersion(parsedData, mockMap);
        contractAddress = await deployContract(contractName, network, compiler, null, [], true, 2000);
        await sleep(30000); // To make sure that contractCode is stored
      }catch(err){
        throw err;
      }
    });
    it('Verifies Sample.sol contract successfully by enabling optimization', async () => {
      sampleData = {
        key: ETHERSCAN_KEY,
        path : path,
        contractAddress:  contractAddress,
        network  : network,
        runs  : 2000,
        evmVersion:  'byzantium',
        licenseType: 3,
        optimizationFlag: true,  // Optimization Enabled
      };
      const response = await Verifier.verifyContract(sampleData);
      response.status.should.equal('1');
    });
  });


  describe('Compiling & Verifying SampleOld.sol with version 0.4.18', () => {
    let contractAddress;
    let contractName;
    let network;
    let sampleData;
    let path;
    before('Compile & Deploy SampleOld.sol', async () => {
      try{
        contractName = 'SampleOld';
        network = 'rinkeby';
        path = __dirname + '/contracts/'+ contractName +'.sol';
        const contractSource = fs.readFileSync(path, 'UTF-8');
        const parsedData = parser.parse(contractSource).children;
        const compiler = await solReleases.getCompilerVersion(parsedData, mockMap);
        contractAddress = await deployContract(contractName, network, compiler, null, [], false);
        await sleep(30000); // To make sure that contractCode is stored
      }catch(err){
        throw err;
      }
    });
    it('Verifies SampleOld.sol contract successfully with old way of defining constructor', async () => {
      sampleData = {
        key: ETHERSCAN_KEY,
        path : path,
        contractAddress:  contractAddress,
        network  : network,
      };
      const response = await Verifier.verifyContract(sampleData);
      response.status.should.equal('1');
    });
  });


  describe('Deploying & Verifying SampleWithConstructor.sol', () => {
    let contractAddress;
    let contractName;
    let network;
    let sampleData;
    const constructParams = [];
    let path;
    before('Deploy SampleWithConstructor.sol', async () => {
      try{
        contractName = 'SampleWithConstructor';
        network = 'rinkeby';
        constructParams.push(['0x48656c6c6f20576f726c64210000000000000000000000000000000000000000', '0x48656c6c6f20576f726c64220000000000000000000000000000000000000000']); // eslint-disable-line max-len
        constructParams.push([250, 251, 252]);  // Fix size array
        constructParams.push('nickname'); // string
        path = __dirname + '/contracts/'+ contractName +'.sol';
        const contractSource = fs.readFileSync(path, 'UTF-8');
        const parsedData = parser.parse(contractSource).children;
        const compiler = await solReleases.getCompilerVersion(parsedData, mockMap);
        contractAddress = await deployContract(contractName, network, compiler, null, constructParams);
        await sleep(40000); // To make sure that contractCode is stored
      }catch(err){
        throw err;
      }
    });

    it('Verifies SampleWithConstructor.sol contract with array params in constructor successfully', async () => {
      sampleData = {
        key     : ETHERSCAN_KEY,
        path    : path,
        contractAddress:  contractAddress,
        network : network,
        cvalues : constructParams,
      };
      const response = await Verifier.verifyContract(sampleData);
      response.status.should.equal('1');
    });

    it('Trying to verify SampleWithConstructor contract without passing constructor values (should fail)', async () => {
      await sleep(10000);
      sampleData.cvalues = null;
      try{
        await Verifier.verifyContract(sampleData);
      }catch(err){
        err.message.should.equal('Constructor Found!!! Please Provide --constructParams Option');
      }
    });
  });

  describe('Deploying & Verifying MultiContractSample.sol', () => {
    let contractAddress;
    let contractName;
    let network;
    let sampleData;
    const constructParams = [];
    let path;
    before('Deploy MultiContractSample.sol', async () => {
      try{
        contractName = 'MultiContractSample';
        network = 'rinkeby';
        constructParams.push(40);
        path = __dirname + '/contracts/'+ contractName +'.sol';
        const contractSource = fs.readFileSync(path, 'UTF-8');
        const parsedData = parser.parse(contractSource).children;
        const compiler = await solReleases.getCompilerVersion(parsedData, mockMap);
        contractAddress = await deployContract(contractName, network, compiler, null, constructParams);
        await sleep(30000); // To make sure that contractCode is stored
      }catch(err){
        throw err;
      }
    });

    it('Verifies MultiContractSample.sol contract successfully', async () => {
      sampleData = {
        key     : ETHERSCAN_KEY,
        path    : path,
        contractAddress:  contractAddress,
        network : network,
        cvalues : constructParams,
        contractName    :   contractName,
      };
      const response = await Verifier.verifyContract(sampleData);
      response.status.should.equal('1');
    });

    it('Trying to verify MultiContractSample contract with passing contractName(should fail)', async () => {
      await sleep(10000);
      sampleData.contractName = null;
      try{
        await Verifier.verifyContract(sampleData);
      }catch(err){
        err.message.should.equal('More Than One Contracts in File!!! Please Provide --contractName Option');
      }
    });
  });

  describe('Deploying & Verifying contract with import', () => {
    let contractAddress;
    let contractName;
    let network;
    let sampleData;

    it('Deploys & verifies contract with relative file import successfully', async () => {
      contractName = 'SampleWithImport';
      network = 'rinkeby';
      const pathToDeploy = __dirname + '/contracts/'+ 'SampleWithImport_merged' +'.sol'; // Pre merged contract
      const pathToVerify = __dirname + '/contracts/'+ contractName +'.sol';
      const pragma = await getPragma(pathToVerify);
      const contractSource = await processFile(pathToVerify, true);
      const parsedData = parser.parse(pragma + '\n\n' + contractSource).children;
      const compiler = await solReleases.getCompilerVersion(parsedData, mockMap);
      contractAddress = await deployContract(contractName, network, compiler, pathToDeploy);
      await sleep(40000); // To make sure that contractCode is stored
      sampleData = {
        key     : ETHERSCAN_KEY,
        path    : pathToVerify,
        contractAddress:  contractAddress,
        network : network,
        contractName    :  contractName,
      };
      const response = await Verifier.verifyContract(sampleData);
      response.status.should.equal('1');
    });

    it('Deploys & verifies contract with node_modules file import successfully', async () => {
      contractName = 'SampleWithNodeModulesImport';
      network = 'rinkeby';
      const pathToDeploy = __dirname + '/contracts/'+ 'SampleWithNodeModulesImport_merged' +'.sol';
      const pathToVerify = __dirname + '/contracts/'+ contractName +'.sol';
      const pragma = await getPragma(pathToVerify);
      const contractSource = await processFile(pathToVerify, true);
      const parsedData = parser.parse(pragma + '\n\n' + contractSource).children;
      const compiler = await solReleases.getCompilerVersion(parsedData, mockMap);
      contractAddress = await deployContract(contractName, network, compiler, pathToDeploy);
      await sleep(40000); // To make sure that contractCode is stored
      sampleData = {
        key     : ETHERSCAN_KEY,
        path    : pathToVerify,
        contractAddress:  contractAddress,
        network : network,
        contractName    :  contractName,
      };
      const response = await Verifier.verifyContract(sampleData);
      response.status.should.equal('1');
    });

    it('Deploys & verifies contract with user defined type in construtor successfully', async () => {
      contractName = 'SampleWithUserDefinedType';
      network = 'rinkeby';
      const constructParams = [];
      constructParams.push('0x0000000000000000000000000000000000000000');
      constructParams.push(12345);
      const pathToDeploy = __dirname + '/contracts/'+ 'SampleWithUserDefinedType_merged' +'.sol';
      const pathToVerify = __dirname + '/contracts/'+ contractName +'.sol';
      const pragma = await getPragma(pathToVerify);
      const contractSource = await processFile(pathToVerify, true);
      const parsedData = parser.parse(pragma + '\n\n' + contractSource).children;
      const compiler = await solReleases.getCompilerVersion(parsedData, mockMap);
      contractAddress = await deployContract(contractName, network, compiler, pathToDeploy, constructParams);
      await sleep(40000); // To make sure that contractCode is stored
      sampleData = {
        key     : ETHERSCAN_KEY,
        path    : pathToVerify,
        contractAddress:  contractAddress,
        network : network,
        cvalues : constructParams,
        contractName    :  contractName,
      };
      const response = await Verifier.verifyContract(sampleData);
      response.status.should.equal('1');
    });
  });
});
