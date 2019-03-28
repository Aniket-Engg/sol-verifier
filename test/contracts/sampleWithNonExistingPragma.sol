pragma solidity ^0.7.0;
contract Sample {
    uint public  n;
    
    function set(uint _n) public returns (uint) {
        n = _n;
    }

    function get() public view  returns (uint) {
        return n;
    }
}