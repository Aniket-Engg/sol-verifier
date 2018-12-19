pragma solidity ^0.5.1;

contract Base {
    uint public m;

    function setm(uint _m) public {
        m = _m;
    }
}

contract MultiContractSample is Base {
    uint public  n;

    constructor(uint _num) public {
        n = _num;
    }

    function get() public view returns (uint) {
        return n;
    }
}