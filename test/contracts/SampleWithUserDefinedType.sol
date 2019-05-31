pragma solidity ^0.5.1;

import "./Itest.sol";

contract SampleWithUserDefinedType {

    uint age;
    constructor (Itest it, uint _age) public{
        Itest iaddr = it;
        age = _age;
    }
}