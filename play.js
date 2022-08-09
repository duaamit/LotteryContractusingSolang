const { Connection, LAMPORTS_PER_SOL, Keypair } = require("@solana/web3.js");
const { Contract, publicKeyToHex } = require("@solana/solidity");
const { readFileSync } = require("fs");

const Lottery_ABI = JSON.parse(readFileSync("./lottery.abi", "utf8"));
const BUNDLE_SO = readFileSync("./bundle.so");

(async function () {
  console.log("Connecting to your local Solana node ...");
  const connection = new Connection("http://localhost:8899", "confirmed");

  const payer = Keypair.generate();

  console.log("Airdropping SOL to a new wallet ...");
  const signature = await connection.requestAirdrop(
    payer.publicKey,
    1 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(signature, "confirmed");

  const address = publicKeyToHex(payer.publicKey);
  const program = Keypair.generate();
  const storage = Keypair.generate();

  const contract = new Contract(
    connection,
    program.publicKey,
    storage.publicKey,
    Lottery_ABI,
    payer
  );

  console.log("Airdropping SOL to a contract address ...");
  const signature1 = await connection.requestAirdrop(
    program.publicKey,
    5 * LAMPORTS_PER_SOL
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
  //   const playerbalance = await contract.getBalance(
  //     publicKeyToHex(payer.publicKey)
  //   );
  //   contract.requestAirdrop(program.publicKey, 5 * LAMPORTS_PER_SOL);

  const balancePayer = await connection.getBalance(payer.publicKey);

  const balancecontract = await connection.getBalance(program.publicKey);

  //   const balance = await contract.balanceOf(address);

  console.log(`Lottery contract for Secret Number ${secretNumber} deployed!`);
  console.log(`Current State of Lottery is ${currentState}`);
  console.log(`Current Contract Balance is ${balance}`);
  console.log(`The Contract Address is ${contractAddress}`);
  //   console.log(`The Contract Address is ${playerbalance}`);
  console.log(`The Payer Balance is ${balancePayer}`);
  console.log(`The contract program Balance is ${balancecontract}`);

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

  const reward = await contract.getReward();
  console.log(`The Reward value is ${reward}`);

  console.log(`The Payer address is ${publicKeyToHex(payer.publicKey)}`);
  console.log("Calling the play function.....");
  const play = await contract.play(publicKeyToHex(payer.publicKey), 5);
  console.log("Balance of Contract Returned is: " + play.result);

  const winner = await contract.getWinner();
  console.log(`The winner is ${winner}`);

  process.exit(0);
})();
