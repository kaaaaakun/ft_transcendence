// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyContract {
    string public message;
    address public owner;

    event MessageUpdated(string oldMessage, string newMessage, address updatedBy);

    constructor(string memory _message) {
        message = _message;
        owner = msg.sender;
    }

    function updateMessage(string memory _newMessage) public {
        string memory oldMessage = message;
        message = _newMessage;
        emit MessageUpdated(oldMessage, _newMessage, msg.sender);
    }

    function getMessage() public view returns (string memory) {
        return message;
    }
}

