pragma solidity ^0.5.1;

contract SampleWithConstructor {
    uint public  n;

    constructor(uint _num) public {
        n = _num;
    }

    function get() public view  returns (uint) {
        return n;
    }
}