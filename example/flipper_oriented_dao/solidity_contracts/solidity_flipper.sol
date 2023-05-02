// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract Flipper {

    bool value;

    constructor(bool init_value){
        value = init_value;
    } 

    function flip() public {
        value = !value;
    }

    function get() public view returns (bool){
        return value;
    }
}