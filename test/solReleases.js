'use strict';
const mockMap = require('./utils/mock_mapping.json')
var fs = require('fs');
const parser = require("solparse");
const solReleases = require('../lib/solReleases')
require('chai').should();

describe('sol-Releases', () => {

    describe('Verifying compiler versions for upgraded compiler version', () => {
        var contractName = 'sampleWithUpdatedPragma';
        var path = __dirname + '/contracts/'+ contractName +'.sol';
        it(' trying to get compiler version for sampleWithUpdatedPragma.sol  (should pass)', async () => {
            
            const contractSource = fs.readFileSync(path,'UTF-8');
            var parsedData = parser.parse(contractSource).body;
            let compiler = await solReleases.getCompilerVersion(parsedData,mockMap);
            compiler.should.equal("v0.5.7+commit.6da8b019");    
        });
    });

    describe('Verifying compiler versions for non-existing compiler version', () => {
        var contractName = 'sampleWithNonExistingPragma';
        var path = __dirname + '/contracts/'+ contractName +'.sol';
        
        it(' trying to get compiler version for sampleWithNonExistingPragma.sol  (should fail)', async () => {
            const contractSource = fs.readFileSync(path,'UTF-8');
            var parsedData = parser.parse(contractSource).body;
            try {
                await solReleases.getCompilerVersion(parsedData,mockMap);
            } catch(err){
                err.message.should.equal('Unsupported Compiler Version');
             }
        });
    });

        describe('Verifying compiler versions of contract without prgama', () => {
            var contractName = 'SampleWithoutPragma';
            var path = __dirname + '/contracts/'+ contractName +'.sol';
        
    
        it(' trying to get compiler version for SampleWithoutPragma.sol  (should fail)', async () => {
            const contractSource = fs.readFileSync(path,'UTF-8');
            var parsedData = parser.parse(contractSource).body;
            try {
                await solReleases.getCompilerVersion(parsedData,mockMap);
            } catch(err){
                err.message.should.equal('No Pragma Specified !!!');
             }    
        });
    });
});