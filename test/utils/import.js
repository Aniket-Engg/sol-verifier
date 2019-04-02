'use strict';

const path = require('path'),
  { execSync } = require('child_process'),
  fs = require('fs');

const regEx = {
  pragma  :   /(pragma solidity (.+?);)/g,
  import  :   /import ['"](.+?)['"];/g,
};

let processedFiles = [];

const processFile = async (file, root = false) => {
  try{
    if(root)
      processedFiles = [];

    if(processedFiles.indexOf(file) !== -1)
      return;

    processedFiles.push(file);
    let result = '';

    let contents = fs.readFileSync(file, { encoding: 'utf-8' });
    contents = contents.replace(regEx.pragma, '').trim();
    const imports = await processImports(file, contents);

    for (let i = 0; i < imports.length; i++) {
      result += imports[i] + '\n\n';
    }
    contents = contents.replace(regEx.import, '').trim();
    result += contents;
    return result;
  }
  catch(error){
    throw error;
  }
};

const processImports = async (file, content) => {
  try{
    let group='';
    const result = [];
    regEx.import.exec(''); // Resetting state of RegEx
    while (group = regEx.import.exec(content)) {  // jshint ignore:line
      const _importFile = group[1];
      let filePath = path.join(path.dirname(file), _importFile);
      if(!fs.existsSync(filePath)){
        const nodeModulesPath = (await execSync('npm root', { cwd: path.dirname(file) })).toString().trim();
        filePath = path.join(nodeModulesPath, _importFile);
      }
      filePath = path.normalize(filePath);
      const fileContents = await processFile(filePath);
      if (fileContents) {
        result.push(fileContents);
      }
    }
    return result;
  }
  catch(error){
    throw error;
  }
};

const getPragma = async (path) => {
  const contents = fs.readFileSync(path, { encoding: 'utf-8' });
  const group = regEx.pragma.exec(contents);
  return group && group[1];
};

module.exports.processFile = processFile;
module.exports.getPragma = getPragma;
