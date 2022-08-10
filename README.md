# LotteryContractusingSolang

Implementtaion of Lottery contract written in Solidity using Solang. Solang can compile Solidity for Solana, Substrate, and ewasm. 
Solang is source compatible with Solidity 0.8.

Description:

`lottery.sol` :
```
has the solidity contract where a secret number is initialized and player who guess the correct secret number will be 
given reward of 5*LAMPORTS_PER_SOL. The smart contract has function `play` for the player to guess the number.
```

`play.js` : 
```
airdrops are given to players `player1` , `player2` and also to `fundContract` publicKey which will send the rewards 
to the winner.

```

Steps:

#Install Solang for Mac:

```
brew install hyperledger-labs/solang/solang
```

#build using below command to produce `lottery.abi` and `bundle.so`:

```
solang --target solana lottery.sol
```

#install 
```
npm install @solana/solidity
```

#now run:
```
node play.js
```
The ouput should appear like this:
```
Airdropping SOL to a player1 wallet ...
Airdropping SOL to a player2 wallet ...
Airdropping SOL to a wallet to give reward value of 5*LAMPORTS_PER_SOL....
Airdropping SOL to a contract address ...
Deploying the Solang-compiled Lottery program ...
Program deployment finished, deploying the Lottery contract ...
Contract deployment finished, invoking some contract functions ...
Lottery contract for Secret Number 5 deployed!
Current State of Lottery is 0
The Contract Address is 0x779bd62834c0b96a909fdf279610d5f5832b2261acb9cf6d0c1f58e56d80a786
The fundContract  pubkey's Balance is 6000000000
The Player1 original Balance is 1769823840
The Player2 oroginal Balance is 2000000000
setting the reward.....
The Reward value is 6000000000
The Player1 address is 0x5e0a8267d5711b9afeea0eacb2362de492132c77e7bf13ca0644cf83f904f59b
Calling the play function from player 1.....
The Player2 address is 0xdf4b46607d608935e87381f4f9334309e405f336eb385e8a5872c82ca8782b3b
Calling the play function from player 2.....
The winner is 0xdf4b46607d608935e87381f4f9334309e405f336eb385e8a5872c82ca8782b3b
formatting the value of winner from hex format to base-58 format for reward transfer .............. 
Tranferring the reward to winner .... 
SIGNATURE of Transaction 63KyVPUdA7HC5Vo241JaycLgXEkFRYEcnDK74u2ytWo2FnraCwgpShcfg97zpJqJ6raWfpcqNM4qMTxqh7VxKCAn
The Player1 updated Balance is 1769808840
The Player2 updated Balance is 7000000000

```
