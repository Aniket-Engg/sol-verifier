'use strict';

module.exports = (params) => {
  const farray = [];
  for(let i= 0; i<params.length; i++){
    if(params[i].includes('[')){
      if(params[i].includes(']'))
        farray.push(new Array(params[i].replace('[', '').replace(']', '').trim()));
      else{
        let lastIndex = false;
        const paramArr = [];
        paramArr.push(params[i].replace('[', '').trim());
        for(let j=i + 1; !lastIndex; j++){
          if(params[j].includes(']')){
            lastIndex = true;
            i = j;
            paramArr.push(params[j].replace(']', '').trim());
          }
          else
            paramArr.push(params[j]);
        }
        farray.push(paramArr);
      }
    }
    else
      farray.push(params[i]);
  }
  return farray;
};
