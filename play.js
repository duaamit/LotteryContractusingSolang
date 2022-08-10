const bs58 = require("bs58");
// import { hexToPublicKey } from "../../../src/api/worker/crypto/Rsa";
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
const base58 = require("bs58");
const { publicDecrypt } = require("crypto");

const Lottery_ABI = JSON.parse(readFileSync("./lottery.abi", "utf8"));
const BUNDLE_SO = readFileSync("./bundle.so");

(async function () {
  console.log("Connecting to your local Solana node ...");
  const connection = new Connection("http://localhost:8899", "confirmed");

  const player1 = Keypair.generate();

  console.log("Airdropping SOL to a new wallet ...");
  const signature = await connection.requestAirdrop(
    player1.publicKey,
    2 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(signature, "confirmed");

  //   private fun hexToPublicKey(hex: String): RsaPublicKey {
  //     return arrayToPublicKey(hexToKeyArray(hex))
  // }

  // private fun hexToKeyArray(hex: String): Array<BigInteger> {
  //     val key = ArrayList<BigInteger>();
  //     var pos = 0;
  //     while (pos < hex.length) {
  //         val nextParamLen = hex.substring(pos, pos + 4).toInt(16)
  //         pos += 4
  //         key.add(BigInteger(hex.substring(pos, pos + nextParamLen), 16))
  //         pos += nextParamLen
  //     }
  //     return key.toArray(arrayOf())
  // }
  //   var _ec = require("./lib/ec.js");

  //   function hexToPublicKey(publicKeyHex) {
  //     publicKeyHex = publicKeyHex.slice(2);
  //     var x = publicKeyHex.slice(0, 64);
  //     var y = publicKeyHex.slice(64); // console.log(x);
  //     // console.log(y);
  //     // console.log(x.length);
  //     // console.log(y.length);

  //     var publicKey = new _ec.ECPointFp(
  //       Curve,
  //       Curve.fromBigInteger(new _jsbn["default"](x, 16)),
  //       Curve.fromBigInteger(new _jsbn["default"](y, 16))
  //     ); // console.log(publicKey);

  //     return publicKey;
  //   } // genKeyPair();

  //   console.log(`before hex coversion ${player1.publicKey}`);

  //   const key2 = publicKeyToHex(player1.publicKey);
  //   console.log(`hex value ${key2}`);

  //   console.log(`back to base 58 ${base(key2)}`);

  const player2 = Keypair.generate();

  console.log("Airdropping SOL to a new wallet ...");
  const signature2 = await connection.requestAirdrop(
    player2.publicKey,
    2 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(signature2, "confirmed");

  const fundContract = Keypair.generate();

  console.log("Airdropping SOL to a new wallet ...");
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
  const balance = await contract.getBalance();
  const contractAddress = await contract.getContractAddress();

  //   console.log("Airdropping SOL to a contract address ...");
  //   const signature2 = await connection.requestAirdrop(
  //     contractAddress.publicKey,
  //     5 * LAMPORTS_PER_SOL
  //   );
  //   await connection.confirmTransaction(signature2, "confirmed");
  //   const playerbalance = await contract.getBalance(
  //     publicKeyToHex(payer.publicKey)
  //   );
  //   contract.requestAirdrop(program.publicKey, 5 * LAMPORTS_PER_SOL);

  const balancePayer = await connection.getBalance(player1.publicKey);

  const balancecontract = await connection.getBalance(program.publicKey);

  //   const balance = await contract.balanceOf(address);

  console.log(`Lottery contract for Secret Number ${secretNumber} deployed!`);
  console.log(`Current State of Lottery is ${currentState}`);
  console.log(`Current Contract Balance is ${balance}`);
  console.log(`The Contract Address is ${contractAddress}`);
  //   console.log(`The Contract Address is ${playerbalance}`);
  console.log(`The Payer Balance is ${balancePayer}`);
  console.log(`The contract program Balance is ${balancecontract}`);

  const BalancePlayer1 = await connection.getBalance(player1.publicKey);
  console.log(`The Player1 original Balance is ${BalancePlayer1}`);

  const BalancePlayer2 = await connection.getBalance(player2.publicKey);
  console.log(`The Player2 oroginal Balance is ${BalancePlayer2}`);

  //   contract.addEventListener(function (event) {
  //     console.log(`${event.name} event emitted!`);
  //     console.log(
  //       `${event.args[0]} sent ${event.args[2]} tokens to ${event.args[1]}`
  //     );
  //   });

  //   console.log('Sending tokens will emit a "Transfer" event ...');
  //   const recipient = Keypair.generate();
  //   await contract.transfer(publicKeyToHex(recipient.publicKey), "1000");

  //   console.log("Returning the name from contract.....");
  //   const name = await contract.functions.myname();
  //   console.log("Name Returned is: " + name.result);

  console.log("setting the reward.....");
  const name = await contract.setReward(balancecontract);
  //   const contractAddress = await contract.functions.getContractAddress();
  //   console.log("Name of collection: " + contractAddress.result);

  //   console.log("funding the contract.....");
  //   const send = await contract.send(contractAddress, 5);
  //   //   const contractAddress = await contract.functions.getContractAddress();
  //   //   console.log("Name of collection: " + contractAddress.result);

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

  //   const winnerpubkey = await contract.getWinnerPubKey();
  //   console.log(`The winner is ${winnerpubkey}`);

  // Add transfer instruction to transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fundContract.publicKey,
      toPubkey: player2.publicKey,
      lamports: 5 * LAMPORTS_PER_SOL,
    })
  );

  //   const signers = [
  //     {
  //       publicKey: player1.publicKey,
  //       secretKey: player1.secretKey,
  //     },
  //   ];
  // Sign transaction, broadcast, and confirm
  const signature3 = await sendAndConfirmTransaction(connection, transaction, [
    fundContract,
  ]);
  console.log("SIGNATURE", signature3);
  const UpdatedBalancePlayer1 = await connection.getBalance(player1.publicKey);
  console.log(`The Player1 updated Balance is ${UpdatedBalancePlayer1}`);

  const UpdatedBalancePlayer2 = await connection.getBalance(player2.publicKey);
  console.log(`The Player2 updated Balance is ${UpdatedBalancePlayer2}`);

  process.exit(0);
})();
