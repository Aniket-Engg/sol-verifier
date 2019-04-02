pragma solidity ^0.5.6;

contract Sample {
    uint public  n;
    
    function set(uint _n) public returns (uint) {
        n = _n;
    }

    function get() public view  returns (uint) {
        return n;
    }
}

contract SampleWithImport is Sample{

    function increment(uint _n) public pure returns (uint) {
        return _n++;
    }
}