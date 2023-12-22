// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/proxy/Clones.sol";

contract SimpleCloner{
    constructor() {}

    event ContractCloned(
        address indexed _from,
        address indexed _to
        
    );

    function clone(address template) public returns(address){
        address result = Clones.clone(template);
        emit ContractCloned(template, result);
        return result;
        
    }


    
}

