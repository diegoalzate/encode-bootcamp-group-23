import { ethers } from "ethers";
import * as readline from "readline"
import { 
  setupWallet, 
  setupProvider, 
  getBallotContract} from "../utils";


async function main() {
  const wallet = setupWallet();
  console.log(`Using address ${wallet.address}`);

  const provider = setupProvider();
  const signer = wallet.connect(provider);
  const ballotContract = getBallotContract(signer);
  console.log("Getting proposals")
  const proposals = await ballotContract.getProposals();
  const proposalNames = proposals.map((p: any) => ethers.utils.parseBytes32String(p.name))
  console.log(proposalNames)
  console.log("Setting event filter")
  const eventFilter = ballotContract.filters.Voted();
  console.log("Waiting for votes")
  provider.on(eventFilter, (log: any) => {
    const parsedEvent = ballotContract.interface.parseLog({
      topics: log.topics,
      data: log.data,
    });
    const voter = parsedEvent.args.voter;
    const proposalIndex = parsedEvent.args.proposal.toNumber();
    const weight = parsedEvent.args.weight;
    console.log(voter, " voted for ", proposalNames[proposalIndex], " weight: ", weight.toString());
  })
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});