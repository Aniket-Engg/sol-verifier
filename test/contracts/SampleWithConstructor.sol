pragma solidity ^0.5.1;

contract SampleWithConstructor {
    bytes32 public name;
    uint public age;
    string nick;

    constructor (bytes32[] memory names, uint[3] memory ages, string memory nickname) public{
        name = names[0];
        age = ages[1];
        nick = nickname;
    }

    function get() public view  returns (uint) {
        return now;
    }
}