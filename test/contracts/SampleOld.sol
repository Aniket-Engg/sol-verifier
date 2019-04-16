pragma solidity ^0.4.18;

contract SampleOld {
    uint public  n;
    
    function SampleOld() public {
        n = 100;
    }

    function getn() public view returns (uint) {
        return n;
    }
}