pragma solidity ^0.5.12;

contract sampleWithUpdatedPragma {
    uint public  n;
    
    function set(uint _n) public returns (uint) {
        n = _n;
    }

    function get() public view  returns (uint) {
        return n;
    }
}