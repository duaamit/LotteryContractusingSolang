const bs58 = require("bs58");

const {
  Connection,
  LAMPORTS_PER_SOL,
  Keypair,
  web3,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
const { Contract, publicKeyToHex } = require("@solana/solidity");
const { readFileSync } = require("fs");
const { hexValue, isHexString, hexlify } = require("@ethersproject/bytes");
const { publicKeyConvert } = require("secp256k1");
const { publicDecrypt } = require("crypto");

const Lottery_ABI = JSON.parse(readFileSync("./lottery.abi", "utf8"));
const BUNDLE_SO = readFileSync("./bundle.so");

(async function () {
  console.log("Connecting to your local Solana node ...");
  const connection = new Connection("http://localhost:8899", "confirmed");

  const player1 = Keypair.generate();

  console.log("Airdropping SOL to a player1 wallet ...");
  const signature = await connection.requestAirdrop(
    player1.publicKey,
    2 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(signature, "confirmed");

  const fromHexString = (hexString) =>
    Uint8Array.from(
      hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    );

  const player2 = Keypair.generate();

  console.log("Airdropping SOL to a player2 wallet ...");
  const signature2 = await connection.requestAirdrop(
    player2.publicKey,
    2 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(signature2, "confirmed");

  const fundContract = Keypair.generate();

  console.log(
    "Airdropping SOL to a wallet to give reward value of 5*LAMPORTS_PER_SOL...."
  );
  const signature4 = await connection.requestAirdrop(
    fundContract.publicKey,
    6 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(signature4, "confirmed");

  const address = publicKeyToHex(player1.publicKey);
  const program = Keypair.generate();
  const storage = Keypair.generate();

  const contract = new Contract(
    connection,
    program.publicKey,
    storage.publicKey,
    Lottery_ABI,
    player1
  );

  console.log("Airdropping SOL to a contract address ...");
  const signature1 = await connection.requestAirdrop(
    program.publicKey,
    6 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(signature1, "confirmed");

  console.log("Deploying the Solang-compiled Lottery program ...");
  await contract.load(program, BUNDLE_SO);

  console.log(
    "Program deployment finished, deploying the Lottery contract ..."
  );
  await contract.deploy("lottery", [5], storage, 4096 * 8);

  console.log(
    "Contract deployment finished, invoking some contract functions ..."
  );
  const currentState = await contract.currState();
  const secretNumber = await contract.SecretNumber();
  const contractAddress = await contract.getContractAddress();

  const balancecontract = await connection.getBalance(fundContract.publicKey);

  console.log(`Lottery contract for Secret Number ${secretNumber} deployed!`);
  console.log(`Current State of Lottery is ${currentState}`);
  console.log(`The Contract Address is ${contractAddress}`);
  console.log(`The fundContract  pubkey's Balance is ${balancecontract}`);

  const BalancePlayer1 = await connection.getBalance(player1.publicKey);
  console.log(`The Player1 original Balance is ${BalancePlayer1}`);

  const BalancePlayer2 = await connection.getBalance(player2.publicKey);
  console.log(`The Player2 oroginal Balance is ${BalancePlayer2}`);

  console.log("setting the reward.....");
  const name = await contract.setReward(balancecontract);

  const reward = await contract.getReward();
  console.log(`The Reward value is ${reward}`);

  console.log(`The Player1 address is ${publicKeyToHex(player1.publicKey)}`);
  console.log("Calling the play function from player 1.....");
  const play = await contract.play(publicKeyToHex(player1.publicKey), 3);
  //   console.log("The winner is: " + play.result);

  console.log(`The Player2 address is ${publicKeyToHex(player2.publicKey)}`);
  console.log("Calling the play function from player 2.....");
  const play2 = await contract.play(publicKeyToHex(player2.publicKey), 5);

  const winner = await contract.getWinner();
  console.log(`The winner is ${winner}`);

  console.log(
    "formatting the value of winner from hex format to base-58 format for reward transfer .............. "
  );

  const winner_withoutprefix = winner.slice(2); //removing 0X prefix.
  const winner_uint8 = fromHexString(winner_withoutprefix); //coverted from Hex to uint-8 array
  const winner_formatted = bs58.encode(winner_uint8); //converted to base58 original public key

  console.log("Tranferring the reward to winner .... ");

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fundContract.publicKey,
      toPubkey: winner_formatted,
      lamports: 5 * LAMPORTS_PER_SOL,
    })
  );

  const signature3 = await sendAndConfirmTransaction(connection, transaction, [
    fundContract,
  ]);
  console.log("SIGNATURE of Transaction", signature3);
  const UpdatedBalancePlayer1 = await connection.getBalance(player1.publicKey);
  console.log(`The Player1 updated Balance is ${UpdatedBalancePlayer1}`);

  const UpdatedBalancePlayer2 = await connection.getBalance(player2.publicKey);
  console.log(`The Player2 updated Balance is ${UpdatedBalancePlayer2}`);

  process.exit(0);
})();
