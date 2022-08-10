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
        secretNumber = _secretNumber;
    }

    function send( address receiver, uint64 fund) external payable {
    require(payable(receiver).send(fund), "Transaction failed");   
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

    function play(address payable player, uint _numberGuess) external payable {
        require(currState == State.ACTIVE, "Too late :X.");
        if (_numberGuess == secretNumber) {
            winner = player;
            currState = State.COMPLETE;
        }
    }

    function SecretNumber() public view virtual returns (uint) {
        return secretNumber;
    }

    function getWinner() public view virtual returns (address) {
        return winner;
    }
   
}