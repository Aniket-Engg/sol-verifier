'use strict';
const mockMap = require('./utils/mock_mapping.json');
const fs = require('fs');
const parser = require('solidity-parser-antlr');
const solReleases = require('../lib/solReleases');
require('chai').should();

describe('sol-Releases', () => {

  describe('Verifying compiler versions for listed compiler version', () => {
    const contractName = 'Sample';
    const path = __dirname + '/contracts/'+ contractName +'.sol';
    it(' trying to get compiler version for Sample.sol  (should pass)', async () => {

      const contractSource = fs.readFileSync(path, 'UTF-8');
      const parsedData = parser.parse(contractSource).children;
      const compiler = await solReleases.getCompilerVersion(parsedData, mockMap);
      compiler.should.equal('v0.5.1+commit.c8a2cb62');
    });
  });

  describe('Verifying compiler versions for upgraded compiler version', () => {
    const contractName = 'sampleWithUpdatedPragma';
    const path = __dirname + '/contracts/'+ contractName +'.sol';
    it(' trying to get compiler version for sampleWithUpdatedPragma.sol  (should pass)', async () => {

      const contractSource = fs.readFileSync(path, 'UTF-8');
      const parsedData = parser.parse(contractSource).children;
      const compiler = await solReleases.getCompilerVersion(parsedData, mockMap);
      compiler.should.equal('v0.5.12+commit.7709ece9');
    });
  });

  describe('Verifying compiler versions for non-existing compiler version', () => {
    const contractName = 'sampleWithNonExistingPragma';
    const path = __dirname + '/contracts/'+ contractName +'.sol';

    it(' trying to get compiler version for sampleWithNonExistingPragma.sol  (should fail)', async () => {
      const contractSource = fs.readFileSync(path, 'UTF-8');
      const parsedData = parser.parse(contractSource).children;
      try {
        await solReleases.getCompilerVersion(parsedData, mockMap);
      } catch(err){
        err.message.should.equal('Unsupported Compiler Version!!!');
      }
    });
  });

  describe('Verifying compiler versions of contract without prgama', () => {
    const contractName = 'SampleWithoutPragma';
    const path = __dirname + '/contracts/'+ contractName +'.sol';


    it(' trying to get compiler version for SampleWithoutPragma.sol  (should fail)', async () => {
      const contractSource = fs.readFileSync(path, 'UTF-8');
      const parsedData = parser.parse(contractSource).children;
      try {
        await solReleases.getCompilerVersion(parsedData, mockMap);
      } catch(err){
        err.message.should.equal('No Pragma Specified!!!');
      }
    });
  });

  describe('Verifying compiler versions of contract with non-required format of pragma', () => {
    const contractName = 'Sample2';
    const path = __dirname + '/contracts/'+ contractName +'.sol';


    it(' trying to get compiler version for Sample2.sol  (should fail)', async () => {
      const contractSource = fs.readFileSync(path, 'UTF-8');
      const parsedData = parser.parse(contractSource).children;
      try {
        await solReleases.getCompilerVersion(parsedData, mockMap);
      } catch(err){
        err.message.should.equal('Add Specific Compiler Version Pragma !!!');
      }
    });
  });
});
