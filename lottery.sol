//SPDX-License-Identifier: MIT

pragma solidity ^0.8.1;
contract lottery{

    uint private secretNumber;
    enum State {ACTIVE, COMPLETE}
    State public currState;
    uint private balance;
    uint64 private reward;
    address private winner;

    constructor(uint _secretNumber) payable {
        require(address(this).balance >= 5, "This contract needs to be funded.");
        secretNumber = _secretNumber;
        // balance = msg.value; 
    }

    function setReward(uint64 _rewardValue) public {
        reward = _rewardValue;
        balance = reward;
    }

    function getReward() public view returns(uint64){
        return reward;
    }


    function getBalance() public view returns(uint){
        return address(this).balance;
    }

    function getContractAddress() public view returns(address) {
        return address(this);
    }

    function play(address payable player, uint _numberGuess) external payable returns(uint){
        // require(msg.value >= 1, "To play you need to pay at least 1.");
        require(currState == State.ACTIVE, "Too late :X.");
        // balance = balance+msg.value;
        // transferfrom(player, address(this), entryfee);
        if (_numberGuess == secretNumber) {
            // bool complete = player.transfer(reward);
            // player.transfer(reward);
            // player.transfer(reward);

            winner = player;
            currState = State.COMPLETE;
        }
        return balance;
    }

    // function refreshContract(uint _secretNumber) external payable {
    //     require(msg.value >= 10*10**18, "To play you need to pay at least 1 ETH.");
    //     require(currState == State.COMPLETE, "Contract is currently active :X.");
    //     secretNumber = _secretNumber;
    //     balance = msg.value;
    // }

    function SecretNumber() public view virtual returns (uint) {
        return secretNumber;
    }

    function getWinner() public view virtual returns (address) {
        return winner;
    }
}