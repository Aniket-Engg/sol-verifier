pragma solidity >=0.4.0 <0.7.0;

contract Sample2 {
    uint public  n;

    function set(uint _n) public returns (uint) {
        n = _n;
    }

    function get() public view  returns (uint) {
        return n;
    }
}