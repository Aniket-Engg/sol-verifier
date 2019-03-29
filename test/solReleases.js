'use strict';
const mockMap = require('./utils/mock_mapping.json');
const fs = require('fs');
const parser = require('solparse');
const solReleases = require('../lib/solReleases');
require('chai').should();

describe('sol-Releases', () => {

  describe('Verifying compiler versions for upgraded compiler version', () => {
    const contractName = 'sampleWithUpdatedPragma';
    const path = __dirname + '/contracts/'+ contractName +'.sol';
    it(' trying to get compiler version for sampleWithUpdatedPragma.sol  (should pass)', async () => {

      const contractSource = fs.readFileSync(path, 'UTF-8');
      const parsedData = parser.parse(contractSource).body;
      const compiler = await solReleases.getCompilerVersion(parsedData, mockMap);
      compiler.should.equal('v0.5.7+commit.6da8b019');
    });
  });

  describe('Verifying compiler versions for non-existing compiler version', () => {
    const contractName = 'sampleWithNonExistingPragma';
    const path = __dirname + '/contracts/'+ contractName +'.sol';

    it(' trying to get compiler version for sampleWithNonExistingPragma.sol  (should fail)', async () => {
      const contractSource = fs.readFileSync(path, 'UTF-8');
      const parsedData = parser.parse(contractSource).body;
      try {
        await solReleases.getCompilerVersion(parsedData, mockMap);
      } catch(err){
        err.message.should.equal('Unsupported Compiler Version');
      }
    });
  });

  describe('Verifying compiler versions of contract without prgama', () => {
    const contractName = 'SampleWithoutPragma';
    const path = __dirname + '/contracts/'+ contractName +'.sol';


    it(' trying to get compiler version for SampleWithoutPragma.sol  (should fail)', async () => {
      const contractSource = fs.readFileSync(path, 'UTF-8');
      const parsedData = parser.parse(contractSource).body;
      try {
        await solReleases.getCompilerVersion(parsedData, mockMap);
      } catch(err){
        err.message.should.equal('No Pragma Specified !!!');
      }
    });
  });
});
