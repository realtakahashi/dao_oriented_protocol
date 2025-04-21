import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { ContractPromise, CodePromise } from "@polkadot/api-contract";
import proposalManagerContract from "./contract_files/default_proposal.contract.json";
import proposalManagerAbi from "../../../target/ink/default_proposal/default_proposal.json";
import memberManagerContract from "./contract_files/default_member.contract.json";
import memberManagerAbi from "../../../target/ink/default_member/default_member.json";
import electionManagerContract from "./contract_files/default_election.contract.json";
import electionManagerAbi from "../../../target/ink/default_election/default_election.json";
import applicationCoreContract from "./contract_files/application_core.contract.json";
import applicationCoreAbi from "../../../target/ink/application_core/application_core.json";
import colorTheInternetContract from "./contract_files/color_the_internet.contract.json";
import colorTheInternetAbi from "../../../target/ink/color_the_internet/color_the_internet.json";
import governanceTokenContract from "./contract_files/governance_token.contract.json";
import governanceTokenAbi from "../../../target/ink/governance_token/governance_token.json";
import { BN } from "@polkadot/util";
import assert from "assert";

const storageDepositLimit = null;
const first_delimiter = "$1$";

let memberManagerContractAddress = "";
let proposalManagerContractAddress = "";
let electionManagerContractAddress = "";
let applicationCoreContractAddress = "";
let colorTheInternetContractAddress = "";
let governanceTokenContractAddress = "";
let api: any;
let deployer: any;
let Bob: any;
let Charlie: any;
let Dave: any;
let keyring: any;

let next_scenario: number = 1;

/// controller function
const test_controller = async () => {
  switch (next_scenario) {
    case 1:
      await deployProposalManager(test_controller);
      break;
    case 2:
      await deployMemberManager(test_controller);
      break;
    case 3:
      await deployElectionManager(test_controller);
      break;
    case 4:
      await deployApplicationCore(test_controller);
      break;
    case 5:
      await callConfigurePreInstallMemberManager(test_controller);
      break;
    case 6:
      await callConfigurePreInstallProposalManager(test_controller);
      break;
    case 7:
      await callConfigurePreInstallElectionManager(test_controller);
      break;
    case 8:
      await doAfterDeployTest();
      await createProposalForAddingNewMemeber(test_controller);
      break;
    case 9:
      await checkProposalList(1, "Add Bob");
      await createElection(test_controller, "0");
      break;
    case 10:
      await voteForProposal(test_controller, "0", "yes");
      break;
    case 11:
      await endElection(test_controller, "0");
      break;
    case 12:
      await executeProposal(test_controller, "0");
      break;
    case 13:
      await checkMember(2, "Bob");
      await deployColorTheInternet(test_controller);
      break;
    case 14:
      await deployGovernanceToken(test_controller);
      break;
    case 15:
      await setGovernanceTokenAddress(test_controller);
      break;
    case 16:
      const param1 =
        "2$1$Suggestion to install color_the_internet$1$I suggest to install color_the_internet which I have implemented$1$https://github.com/realtakahashi/color_the_internet$1$This is test$1$" +
        applicationCoreContractAddress +
        "$1$install_software$1$color_the_internet$2$color_the_internet$2$description_color_the_internet$2$" +
        colorTheInternetContractAddress;
      await createProposal(test_controller, param1);
      break;
    case 17:
      await checkProposalList(2, "Suggestion to install color_the_internet");
      await createElection(test_controller, "1");
      break;
    case 18:
      await voteForProposal(test_controller, "1", "yes");
      break;
    case 19:
      deployer = keyring.addFromUri("//Bob");
      await voteForProposal(test_controller, "1", "yes");
      break;
    case 20:
      deployer = keyring.addFromUri("//Alice");
      await endElection(test_controller, "1");
      break;
    case 21:
      await installSoftware(test_controller, "1");
      break;
    case 22:
      await checkSoftwareList(
        1,
        "color_the_internet",
        colorTheInternetContractAddress
      );
      await aliceSignsUp(test_controller);
      break;
    case 23:
      await bobSignsUp(test_controller);
      break;
    case 24:
      await charlieSignsUp(test_controller);
      break;
    case 25:
      await daveSignsUp(test_controller);
      break;
    case 26:
      await checkSignUpDatas();
      await createXXX(test_controller);
      break;
    case 27:
      await addSecondMember(test_controller);
      break;
    case 28:
      await addThirdMember(test_controller);
      break;
    case 29:
      await checkXxxData();
      await proposeColorTheSite(test_controller);
      break;
    case 30:
      await approveColorTheSiteByAlice(test_controller);
      break;
    case 31:
      await approveColorTheSiteByCharlie(test_controller);
      break;
    case 32:
      await checkColorTheSiteData(0);
      await voteToColorTheSite(test_controller);
      break;
    case 33:
      await checkColorTheSiteData(1);
      const param2 =
        "2$1$stop to create xxx$1$I want to stop to create xxx$1$https://github.com/realtakahashi/dao_oriented_protocol$1$This is test$1$" +
        colorTheInternetContractAddress +
        "$1$stop_creating_xxx_for_listing$1$";
      await createProposal(test_controller, param2);
      break;
    case 34:
      await checkProposalList(3, "stop to create xxx");
      await createElection(test_controller, "2");
      break;
    case 35:
      await voteForProposal(test_controller, "2", "yes");
      break;
    case 36:
      deployer = keyring.addFromUri("//Bob");
      await voteForProposal(test_controller, "2", "yes");
      break;
    case 37:
      deployer = keyring.addFromUri("//Alice");
      await endElection(test_controller, "2");
      break;
    case 38:
      await executeProposal(test_controller, "2");
      break;
    case 39:
      const param3 =
        "2$1$delete maricious xxx$1$I want to delete maricious xxx$1$https://github.com/realtakahashi/dao_oriented_protocol$1$This is test$1$" +
        colorTheInternetContractAddress +
        "$1$delete_maricious_xxx$1$0";
      await createProposal(test_controller, param3);
      break;
    case 40:
      await checkProposalList(4, "delete maricious xxx");
      await createElection(test_controller, "3");
      break;
    case 41:
      await voteForProposal(test_controller, "3", "yes");
      break;
    case 42:
      deployer = keyring.addFromUri("//Bob");
      await voteForProposal(test_controller, "3", "yes");
      break;
    case 43:
      deployer = keyring.addFromUri("//Alice");
      await endElection(test_controller, "3");
      break;
    case 44:
      await executeProposal(test_controller, "3");
      break;
    case 45:
      await finalCheck();
      api.disconnect();
      break;
    default:
      api.disconnect();
      break;
  }
  next_scenario++;
};
/// specific test functions
// finalCheck
const finalCheck = async () => {
  console.log("## Start finalCheck");
  const gasLimit: any = getGasLimitForNotDeploy(api);
  colorTheInternetContractAddress;
  const contract = new ContractPromise(
    api,
    colorTheInternetAbi,
    colorTheInternetContractAddress
  );

  var { output } = await contract.query.getXxxDataList(deployer.address, {
    value: 0,
    gasLimit: gasLimit,
    storageDepositLimit,
  });

  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    // console.log("########### json_data:", json_data);
    assert.equal(json_data.length, 0);
  }

  // check balance
  const tokenContract = new ContractPromise(
    api,
    governanceTokenAbi,
    governanceTokenContractAddress
  );
  // balance of Alice
  var { output } = await tokenContract.query.balanceOf(
    deployer.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
    deployer.address
  );

  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    console.log("########### Balance of Alice:", json_data);
    // assert.equal(json_data, 0);
  }
  // balance of Bob
  var { output } = await tokenContract.query.balanceOf(
    Bob.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
    Bob.address
  );

  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    console.log("########### Balance of Bob:", json_data);
    // assert.equal(json_data, 0);
  }
  // balance of Charlie
  var { output } = await tokenContract.query.balanceOf(
    Charlie.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
    Charlie.address
  );

  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    console.log("########### Balance of Charile:", json_data);
    // assert.equal(json_data, 0);
  }
  // balance of Dave
  var { output } = await tokenContract.query.balanceOf(
    Dave.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
    Dave.address
  );

  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    console.log("########### Balance of Dave:", json_data);
    // assert.equal(json_data, 0);
  }

  console.log("## End finalCheck");
};

// deleteMariciousXxx
const deleteMariciousXxx = async (callBack: () => void) => {
  console.log("## Start deleteMariciousXxx");

  const contractWasm = colorTheInternetContract.source.wasm;
  const contract = new ContractPromise(
    api,
    colorTheInternetAbi,
    colorTheInternetContractAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 321923532800,
    proofSize: 13107200,
  });

  const xxxId = 0;

  const { gasRequired } = await contract.query.deleteMariciousXxx(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    xxxId
  );
  const tx = await contract.tx.deleteMariciousXxx(
    { value: 0, gasLimit: gasRequired },
    xxxId
  );
  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("############ Transaction is failure.");
      }
      unsub();
      console.log("## End deleteMariciousXxx");
      callBack();
    }
  });
};

// stopCreatingXxxForListing
const stopCreatingXxxForListing = async (callBack: () => void) => {
  console.log("## Start stopCreatingXxxForListing");

  const contractWasm = colorTheInternetContract.source.wasm;
  const contract = new ContractPromise(
    api,
    colorTheInternetAbi,
    colorTheInternetContractAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 321923532800,
    proofSize: 13107200,
  });

  const xxxId = 0;
  const siteId = 0;

  const { gasRequired } = await contract.query.stopCreatingXxxForListing(
    deployer.address,
    { value: 0, gasLimit: gasLimit }
  );
  const tx = await contract.tx.stopCreatingXxxForListing({
    value: 0,
    gasLimit: gasRequired,
  });
  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("############ Transaction is failure.");
      }
      unsub();
      console.log("## End stopCreatingXxxForListing");
      callBack();
    }
  });
};

// voteToColorTheSite
const voteToColorTheSite = async (callBack: () => void) => {
  console.log("## Start voteToColorTheSite");

  const contractWasm = colorTheInternetContract.source.wasm;
  const contract = new ContractPromise(
    api,
    colorTheInternetAbi,
    colorTheInternetContractAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 321923532800,
    proofSize: 13107200,
  });

  const xxxId = 0;
  const siteId = 0;

  const { gasRequired } = await contract.query.voteToColorTheSite(
    Dave.address,
    { value: 0, gasLimit: gasLimit },
    xxxId,
    siteId
  );
  const tx = await contract.tx.voteToColorTheSite(
    { value: 0, gasLimit: gasRequired },
    xxxId,
    siteId
  );
  //@ts-ignore
  const unsub = await tx.signAndSend(Dave, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("############ Transaction is failure.");
      }
      unsub();
      console.log("## End voteToColorTheSite");
      callBack();
    }
  });
};

// checkColorTheSiteData
const checkColorTheSiteData = async (voteCount: Number) => {
  console.log("## Start checkColorTheSiteData");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    colorTheInternetAbi,
    colorTheInternetContractAddress
  );

  const xxx_id = 0;

  var { output } = await contract.query.getColoredDataListForXxx(
    deployer.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
    xxx_id
  );

  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    // console.log("########### json_data:", json_data);
    assert.equal(json_data.length, 1);
    assert.equal(json_data[0].url, "https://realtakahashi-work.medium.com/");
    assert.equal(json_data[0].ownerApproval, true);
    assert.equal(json_data[0].secondMemberApproval, true);
    assert.equal(json_data[0].thirdMemberApproval, true);
    assert.equal(json_data[0].voteCount, voteCount);
  }

  console.log("## End checkColorTheSiteData");
};

// approveColorTheSiteByCharlie
const approveColorTheSiteByCharlie = async (callBack: () => void) => {
  console.log("## Start approveColorTheSiteByCharlie");

  const contractWasm = colorTheInternetContract.source.wasm;
  const contract = new ContractPromise(
    api,
    colorTheInternetAbi,
    colorTheInternetContractAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 321923532800,
    proofSize: 13107200,
  });

  const xxxId = 0;
  const siteId = 0;

  const { gasRequired } = await contract.query.approveColorTheSite(
    Charlie.address,
    { value: 0, gasLimit: gasLimit },
    xxxId,
    siteId
  );
  const tx = await contract.tx.approveColorTheSite(
    { value: 0, gasLimit: gasRequired },
    xxxId,
    siteId
  );
  //@ts-ignore
  const unsub = await tx.signAndSend(Charlie, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("############ Transaction is failure.");
      }
      unsub();
      console.log("## End approveColorTheSiteByCharlie");
      callBack();
    }
  });
};

// approveColorTheSiteByAlice
const approveColorTheSiteByAlice = async (callBack: () => void) => {
  console.log("## Start approveColorTheSiteByAlice");

  const contractWasm = colorTheInternetContract.source.wasm;
  const contract = new ContractPromise(
    api,
    colorTheInternetAbi,
    colorTheInternetContractAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 321923532800,
    proofSize: 13107200,
  });

  const xxxId = 0;
  const siteId = 0;

  const { gasRequired } = await contract.query.approveColorTheSite(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    xxxId,
    siteId
  );
  const tx = await contract.tx.approveColorTheSite(
    { value: 0, gasLimit: gasRequired },
    xxxId,
    siteId
  );
  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("############ Transaction is failure.");
      }
      unsub();
      console.log("## End approveColorTheSiteByAlice");
      callBack();
    }
  });
};

// proposeColorTheSite
const proposeColorTheSite = async (callBack: () => void) => {
  console.log("## Start proposeColorTheSite");

  const contractWasm = colorTheInternetContract.source.wasm;
  const contract = new ContractPromise(
    api,
    colorTheInternetAbi,
    colorTheInternetContractAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 321923532800,
    proofSize: 13107200,
  });

  const xxxId = 0;

  const { gasRequired } = await contract.query.proposeColorTheSite(
    Bob.address,
    { value: 0, gasLimit: gasLimit },
    xxxId,
    "https://realtakahashi-work.medium.com/"
  );
  const tx = await contract.tx.proposeColorTheSite(
    { value: 0, gasLimit: gasRequired },
    xxxId,
    "https://realtakahashi-work.medium.com/"
  );
  //@ts-ignore
  const unsub = await tx.signAndSend(Bob, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("############ Transaction is failure.");
      }
      unsub();
      console.log("## End proposeColorTheSite");
      callBack();
    }
  });
};

// checkXxxData
const checkXxxData = async () => {
  console.log("## Start checkXxxData");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    colorTheInternetAbi,
    colorTheInternetContractAddress
  );
  // get Alice
  var { output } = await contract.query.getXxxDataList(deployer.address, {
    value: 0,
    gasLimit: gasLimit,
    storageDepositLimit,
  });
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    assert.equal(json_data.length, 1);
    assert.equal(json_data[0].name, "Blockchain believer");
    assert.equal(json_data[0].tags, "web3, blockchain, polkadot");
    assert.equal(json_data[0].owner, Bob.address);
    assert.equal(json_data[0].secondMember, deployer.address);
    assert.equal(json_data[0].thirdMember, Charlie.address);
    assert.equal(json_data[0].coloredSiteId, 0);
  }

  console.log("## End checkXxxData");
};

// addThirdMember
const addThirdMember = async (callBack: () => void) => {
  console.log("## Start addThirdMember");

  const contractWasm = colorTheInternetContract.source.wasm;
  const contract = new ContractPromise(
    api,
    colorTheInternetAbi,
    colorTheInternetContractAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 321923532800,
    proofSize: 13107200,
  });

  const xxxId = 0;

  const { gasRequired } = await contract.query.addThirdMember(
    Bob.address,
    { value: 0, gasLimit: gasLimit },
    xxxId,
    Charlie.address
  );
  const tx = await contract.tx.addThirdMember(
    { value: 0, gasLimit: gasRequired },
    xxxId,
    Charlie.address
  );
  //@ts-ignore
  const unsub = await tx.signAndSend(Bob, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("############ Transaction is failure.");
      }
      unsub();
      console.log("## End addThirdMember");
      callBack();
    }
  });
};

// addSecondMember
const addSecondMember = async (callBack: () => void) => {
  console.log("## Start addSecondMember");

  const contractWasm = colorTheInternetContract.source.wasm;
  const contract = new ContractPromise(
    api,
    colorTheInternetAbi,
    colorTheInternetContractAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 321923532800,
    proofSize: 13107200,
  });

  const xxxId = 0;

  const { gasRequired } = await contract.query.addSecondMember(
    Bob.address,
    { value: 0, gasLimit: gasLimit },
    xxxId,
    deployer.address
  );
  const tx = await contract.tx.addSecondMember(
    { value: 0, gasLimit: gasRequired },
    xxxId,
    deployer.address
  );
  //@ts-ignore
  const unsub = await tx.signAndSend(Bob, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("############ Transaction is failure.");
      }
      unsub();
      console.log("## End addSecondMember");
      callBack();
    }
  });
};

// createXXX
const createXXX = async (callBack: () => void) => {
  console.log("## Start createXXX");

  const contractWasm = colorTheInternetContract.source.wasm;
  const contract = new ContractPromise(
    api,
    colorTheInternetAbi,
    colorTheInternetContractAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 321923532800,
    proofSize: 13107200,
  });

  const { gasRequired } = await contract.query.createXxx(
    Bob.address,
    { value: 0, gasLimit: gasLimit },
    "Blockchain believer",
    "web3, blockchain, polkadot"
  );
  const tx = await contract.tx.createXxx(
    { value: 0, gasLimit: gasRequired },
    "Blockchain believer",
    "web3, blockchain, polkadot"
  );
  //@ts-ignore
  const unsub = await tx.signAndSend(Bob, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("############ Transaction is failure.");
      }
      unsub();
      console.log("## End createXXX");
      callBack();
    }
  });
};

// checkSignUpDatas
const checkSignUpDatas = async () => {
  console.log("## Start checkSignUpDatas");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    colorTheInternetAbi,
    colorTheInternetContractAddress
  );
  // get Alice
  var { output } = await contract.query.getPersonalData(
    deployer.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
    deployer.address
  );
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    // console.log("########### json_data of Alice:", json_data);
    assert.equal(json_data.ok.realName, "Shin Takahashi", "Name is invalid.");
    assert.equal(json_data.ok.job, "Software Engineer", "Job is invalid.");
    assert.equal(
      json_data.ok.xAccount,
      "@realtakahashi1",
      "x account is invalid."
    );
    assert.equal(
      json_data.ok.blueSkyAccount,
      "@shintakahashi999.bsky.social",
      "blue sky account is not Alice."
    );
    assert.equal(
      json_data.ok.emailAccount,
      "realtakahashi.work@gmail.com",
      "e-mail account is invalid."
    );
  }
  // get Bob
  var { output } = await contract.query.getPersonalData(
    Bob.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
    Bob.address
  );
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    assert.equal(json_data.ok.realName, "Saki Takahashi", "Name is invalid.");
    assert.equal(json_data.ok.job, "High School Student", "Job is invalid.");
    assert.equal(
      json_data.ok.xAccount,
      "@sakitakahashi1",
      "x account is invalid."
    );
    assert.equal(
      json_data.ok.blueSkyAccount,
      "@sakitakahashi999.bsky.social",
      "blue sky account is not Alice."
    );
    assert.equal(
      json_data.ok.emailAccount,
      "sakitakahashi.work@gmail.com",
      "e-mail account is invalid."
    );
  }
  // get Charlie
  var { output } = await contract.query.getPersonalData(
    Charlie.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
    Charlie.address
  );
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    assert.equal(json_data.ok.realName, "Sei Takahashi", "Name is invalid.");
    assert.equal(
      json_data.ok.job,
      "Junior High School Student",
      "Job is invalid."
    );
    assert.equal(
      json_data.ok.xAccount,
      "@seitakahashi1",
      "x account is invalid."
    );
    assert.equal(
      json_data.ok.blueSkyAccount,
      "@seitakahashi999.bsky.social",
      "blue sky account is not Alice."
    );
    assert.equal(
      json_data.ok.emailAccount,
      "seitakahashi.work@gmail.com",
      "e-mail account is invalid."
    );
  }
  // get Dave
  var { output } = await contract.query.getPersonalData(
    Dave.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
    Dave.address
  );
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    assert.equal(json_data.ok.realName, "Dave Takahashi", "Name is invalid.");
    assert.equal(json_data.ok.job, "University Student", "Job is invalid.");
    assert.equal(
      json_data.ok.xAccount,
      "@davetakahashi1",
      "x account is invalid."
    );
    assert.equal(
      json_data.ok.blueSkyAccount,
      "@davetakahashi999.bsky.social",
      "blue sky account is not Alice."
    );
    assert.equal(
      json_data.ok.emailAccount,
      "davetakahashi.work@gmail.com",
      "e-mail account is invalid."
    );
  }

  console.log("## End checkSignUpDatas");
};
// aliceSignsUp
const aliceSignsUp = async (callBack: () => void) => {
  console.log("## Start aliceSignsUp");

  const contractWasm = colorTheInternetContract.source.wasm;
  const contract = new ContractPromise(
    api,
    colorTheInternetAbi,
    colorTheInternetContractAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 321923532800,
    proofSize: 13107200,
  });

  const { gasRequired } = await contract.query.signUp(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    "Shin Takahashi",
    "Software Engineer",
    "@realtakahashi1",
    "@shintakahashi999.bsky.social",
    "realtakahashi.work@gmail.com"
  );
  const tx = await contract.tx.signUp(
    { value: 0, gasLimit: gasRequired },
    "Shin Takahashi",
    "Software Engineer",
    "@realtakahashi1",
    "@shintakahashi999.bsky.social",
    "realtakahashi.work@gmail.com"
  );
  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("############ Transaction is failure.");
      }
      unsub();
      console.log("## End aliceSignsUp");
      callBack();
    }
  });
};

// bobSignsUp
const bobSignsUp = async (callBack: () => void) => {
  console.log("## Start bobSignsUp");

  const contractWasm = colorTheInternetContract.source.wasm;
  const contract = new ContractPromise(
    api,
    colorTheInternetAbi,
    colorTheInternetContractAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 321923532800,
    proofSize: 13107200,
  });

  const { gasRequired } = await contract.query.signUp(
    Bob.address,
    { value: 0, gasLimit: gasLimit },
    "Saki Takahashi",
    "High School Student",
    "@sakitakahashi1",
    "@sakitakahashi999.bsky.social",
    "sakitakahashi.work@gmail.com"
  );
  const tx = await contract.tx.signUp(
    { value: 0, gasLimit: gasRequired },
    "Saki Takahashi",
    "High School Student",
    "@sakitakahashi1",
    "@sakitakahashi999.bsky.social",
    "sakitakahashi.work@gmail.com"
  );
  //@ts-ignore
  const unsub = await tx.signAndSend(Bob, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("############ Transaction is failure.");
      }
      unsub();
      console.log("## End bobSignsUp");
      callBack();
    }
  });
};

// charlieSignsUp
const charlieSignsUp = async (callBack: () => void) => {
  console.log("## Start charlieSignsUp");

  const contractWasm = colorTheInternetContract.source.wasm;
  const contract = new ContractPromise(
    api,
    colorTheInternetAbi,
    colorTheInternetContractAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 321923532800,
    proofSize: 13107200,
  });

  const { gasRequired } = await contract.query.signUp(
    Charlie.address,
    { value: 0, gasLimit: gasLimit },
    "Sei Takahashi",
    "Junior High School Student",
    "@seitakahashi1",
    "@seitakahashi999.bsky.social",
    "seitakahashi.work@gmail.com"
  );
  const tx = await contract.tx.signUp(
    { value: 0, gasLimit: gasRequired },
    "Sei Takahashi",
    "Junior High School Student",
    "@seitakahashi1",
    "@seitakahashi999.bsky.social",
    "seitakahashi.work@gmail.com"
  );
  //@ts-ignore
  const unsub = await tx.signAndSend(Charlie, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("############ Transaction is failure.");
      }
      unsub();
      console.log("## End charlieSignsUp");
      callBack();
    }
  });
};
// daveSignsUp
const daveSignsUp = async (callBack: () => void) => {
  console.log("## Start daveSignsUp");

  const contractWasm = colorTheInternetContract.source.wasm;
  const contract = new ContractPromise(
    api,
    colorTheInternetAbi,
    colorTheInternetContractAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 321923532800,
    proofSize: 13107200,
  });

  const { gasRequired } = await contract.query.signUp(
    Charlie.address,
    { value: 0, gasLimit: gasLimit },
    "Dave Takahashi",
    "University Student",
    "@davetakahashi1",
    "@davetakahashi999.bsky.social",
    "davetakahashi.work@gmail.com"
  );
  const tx = await contract.tx.signUp(
    { value: 0, gasLimit: gasRequired },
    "Dave Takahashi",
    "University Student",
    "@davetakahashi1",
    "@davetakahashi999.bsky.social",
    "davetakahashi.work@gmail.com"
  );
  //@ts-ignore
  const unsub = await tx.signAndSend(Dave, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("############ Transaction is failure.");
      }
      unsub();
      console.log("## End daveSignsUp");
      callBack();
    }
  });
};

/// query functions
const checkSoftwareList = async (
  checkcount: number,
  name: string,
  contractAddress: string
) => {
  console.log("checkSoftwareList Start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );
  const { gasConsumed, result, output } =
    await contract.query.getInstalledSoftware(deployer.address, {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    });
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    assert.equal(json_data.length, checkcount);
    assert.equal(json_data[checkcount - 1].name, name);
    assert.equal(json_data[checkcount - 1].contractAddress, contractAddress);
    console.log("checkSoftwareList End");
  }
};

const checkProposalList = async (checkcount: number, title: string) => {
  console.log("checkProposalList Start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );
  const { gasConsumed, result, output } =
    await contract.query.getProposalInfoList(deployer.address, {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    });
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    assert.equal(json_data.length, checkcount);
    assert.equal(json_data[checkcount - 1].title, title);
    console.log("checkProposalList End");
  }
};

const doAfterDeployTest = async () => {
  console.log("doAfterDeployTest Start");
  await checkFirstMember();
  await checkPreInstallSoftware();
};

const checkMember = async (memberCount: number, addedMemberName: string) => {
  console.log("checkMember Start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );
  const { gasConsumed, result, output } = await contract.query.getMemberList(
    deployer.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    }
  );
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    // console.log("output.toJSON():",output.toJSON());
    let json_data = JSON.parse(JSON.stringify(response_json));
    assert.equal(json_data.length, memberCount);
    assert.equal(json_data[memberCount - 1].name, addedMemberName);
    console.log("checkMember End");
  }
};

const checkFirstMember = async () => {
  console.log("checkFirstMember Start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );
  const { gasConsumed, result, output } = await contract.query.getMemberList(
    deployer.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    }
  );
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    // console.log("output.toJSON():",output.toJSON());
    let json_data = JSON.parse(JSON.stringify(response_json));
    assert.equal(json_data.length, 1, "member count is not 1.");
    assert.equal(json_data[0].name, "Alice", "member is not Alice.");
  }
};

const checkPreInstallSoftware = async () => {
  console.log("checkPreInstallSoftware Start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );
  const { gasConsumed, result, output } =
    await contract.query.getPreInstalledSoftware(deployer.address, {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    });
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    // console.log("output.toJSON():",output.toJSON());
    let json_data = JSON.parse(JSON.stringify(response_json));
    assert.equal(json_data.length, 3, "pre_software count is not 3.");
    assert.equal(json_data[0].name, "Member Manager");
    assert.equal(json_data[1].name, "Proposal Manager");
    assert.equal(json_data[2].name, "Election Manager");
  }
};

/// transaction functions
const installSoftware = async (callBack: () => void, parameter: string) => {
  console.log("installSoftware start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );

  const { gasRequired } = await contract.query.installSoftware(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    parameter
  );
  const tx = await contract.tx.installSoftware(
    { value: 0, gasLimit: gasRequired },
    parameter
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("### Transaction is failure.");
      }
      unsub();
      console.log("installSoftware end");
      callBack();
    }
  });
};

const createProposal = async (callBack: () => void, parameter: string) => {
  console.log("createProposal start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );

  const { gasRequired } = await contract.query.executeInterface(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    proposalManagerContractAddress,
    "add_proposal",
    parameter
  );
  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired },
    proposalManagerContractAddress,
    "add_proposal",
    parameter
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("### Transaction is failure.");
      }
      unsub();
      console.log("createProposal end");
      callBack();
    }
  });
};

const executeProposal = async (
  callBack: () => void,
  targetProposalId: string
) => {
  console.log("executeProposal start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );

  const { gasRequired } = await contract.query.executeInterface(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    proposalManagerContractAddress,
    "execute_proposal",
    targetProposalId
  );
  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired },
    proposalManagerContractAddress,
    "execute_proposal",
    targetProposalId
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("### Transaction is failure.");
      }
      unsub();
      console.log("executeProposal end");
      callBack();
    }
  });
};

const endElection = async (callBack: () => void, targetProposalId: string) => {
  console.log("endElection start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );

  const { gasRequired } = await contract.query.executeInterface(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    electionManagerContractAddress,
    "end_election",
    targetProposalId
  );
  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired },
    electionManagerContractAddress,
    "end_election",
    targetProposalId
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("### Transaction is failure.");
      }
      unsub();
      console.log("endElection end");
      callBack();
    }
  });
};

const voteForProposal = async (
  callBack: () => void,
  targetProposalId: string,
  yesOrNoString: string
) => {
  console.log("voteForProposal start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );

  const parameter_string = targetProposalId + first_delimiter + yesOrNoString;

  const { gasRequired } = await contract.query.executeInterface(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    electionManagerContractAddress,
    "vote",
    parameter_string
  );
  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired },
    electionManagerContractAddress,
    "vote",
    parameter_string
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("### Transaction is failure.");
      }
      unsub();
      console.log("voteForProposal end");
      callBack();
    }
  });
};

const createElection = async (
  callBack: () => void,
  targetProposalId: string
) => {
  console.log("createElection start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );

  const { gasRequired } = await contract.query.executeInterface(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    electionManagerContractAddress,
    "create_election",
    targetProposalId
  );
  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired },
    electionManagerContractAddress,
    "create_election",
    targetProposalId
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("### Transaction is failure.");
      }
      unsub();
      console.log("createElection end");
      callBack();
    }
  });
};

const createProposalForAddingNewMemeber = async (callBack: () => void) => {
  console.log("createProposalForAddingNewMemeber start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );

  const parameter_string =
    "2$1$Add Bob$1$I propose to add Bob as a member$1$This is a test$1$https://github.com/realtakahashi/dao_oriented_protocol$1$" +
    memberManagerContractAddress +
    "$1$add_member$1$Bob$2$ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR";

  const { gasRequired } = await contract.query.executeInterface(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    proposalManagerContractAddress,
    "add_proposal",
    parameter_string
  );
  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired },
    proposalManagerContractAddress,
    "add_proposal",
    parameter_string
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("### Transaction is failure.");
      }
      unsub();
      console.log("createProposalForAddingNewMemeber end");
      callBack();
    }
  });
};

const callConfigurePreInstallElectionManager = async (callBack: () => void) => {
  console.log("callConfigurePreInstallElectionManager start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );
  const { gasRequired } = await contract.query.configurePreInstallElection(
    deployer.address,
    { value: 0, gasLimit: gasLimit }
  );
  const tx = await contract.tx.configurePreInstallElection({
    value: 0,
    gasLimit: gasRequired,
  });

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("Transaction is failure.");
      }
      unsub();
      console.log("callConfigurePreInstallElectionManager end");
      callBack();
    }
  });
};

const callConfigurePreInstallProposalManager = async (callBack: () => void) => {
  console.log("callConfigurePreInstallProposalManager start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );
  const { gasRequired } =
    await contract.query.configurePreInstallProposalManager(deployer.address, {
      value: 0,
      gasLimit: gasLimit,
    });
  const tx = await contract.tx.configurePreInstallProposalManager({
    value: 0,
    gasLimit: gasRequired,
  });

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("Transaction is failure.");
      }
      unsub();
      console.log("callConfigurePreInstallProposalManager end");
      callBack();
    }
  });
};

const callConfigurePreInstallMemberManager = async (callBack: () => void) => {
  console.log("callConfigurePreInstallMemberManager start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );
  const { gasRequired } = await contract.query.configurePreInstallMemberManager(
    deployer.address,
    { value: 0, gasLimit: gasLimit }
  );
  const tx = await contract.tx.configurePreInstallMemberManager({
    value: 0,
    gasLimit: gasRequired,
  });

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("Transaction is failure.");
      }
      unsub();
      console.log("callConfigurePreInstallMemberManager end");
      callBack();
    }
  });
};

/// deploy functions
const deployMemberManager = async (callBack: () => void) => {
  console.log("Start deployMemberManager");
  // const wsProvider = new WsProvider("ws://127.0.0.1:9944");
  // const api = await ApiPromise.create({ provider: wsProvider });
  // const keyring = new Keyring({ type: "sr25519" });
  // const deployer = keyring.addFromUri("//Alice");

  const contractWasm = memberManagerContract.source.wasm;
  const contract = new CodePromise(api, memberManagerAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new({ gasLimit, storageDepositLimit }, "Alice");

  //@ts-ignore
  const unsub = await tx.signAndSend(
    deployer,
    ({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
          memberManagerContractAddress = contract.address.toString();
        }
        unsub();
        console.log("End deployMemberManager");
        callBack();
      }
    }
  );
};

const deployProposalManager = async (callBack: () => void) => {
  console.log("Start deployProposalManager");

  const contractWasm = proposalManagerContract.source.wasm;
  const contract = new CodePromise(api, proposalManagerAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new({ gasLimit, storageDepositLimit });

  //@ts-ignore
  const unsub = await tx.signAndSend(
    deployer,
    ({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
          proposalManagerContractAddress = contract.address.toString();
        }
        unsub();
        console.log("End deployProposalManager");
        callBack();
      }
    }
  );
};

const deployElectionManager = async (callBack: () => void) => {
  console.log("Start deployElectionManager");

  const contractWasm = electionManagerContract.source.wasm;
  const contract = new CodePromise(api, electionManagerAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new({ gasLimit, storageDepositLimit });

  //@ts-ignore
  const unsub = await tx.signAndSend(
    deployer,
    ({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
          electionManagerContractAddress = contract.address.toString();
        }
        unsub();
        console.log("End deployElectionManager");
        callBack();
      }
    }
  );
};

const deployApplicationCore = async (callBack: () => void) => {
  console.log("Start deployApplicationCore");

  const contractWasm = applicationCoreContract.source.wasm;
  const contract = new CodePromise(api, applicationCoreAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new(
    { gasLimit, storageDepositLimit },
    memberManagerContractAddress,
    proposalManagerContractAddress,
    electionManagerContractAddress
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(
    deployer,
    ({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
          applicationCoreContractAddress = contract.address.toString();
        }
        unsub();
        console.log("End deployApplicationCore");
        callBack();
      }
    }
  );
};

// setGovernanceTokenAddress
const setGovernanceTokenAddress = async (callBack: () => void) => {
  console.log("## Start setGovernanceTokenAddress");

  const contractWasm = colorTheInternetContract.source.wasm;
  const contract = new ContractPromise(
    api,
    colorTheInternetAbi,
    colorTheInternetContractAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const { gasRequired } = await contract.query.setGovernanceTokenAddress(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    governanceTokenContractAddress
  );
  const tx = await contract.tx.setGovernanceTokenAddress(
    { value: 0, gasLimit: gasRequired },
    governanceTokenContractAddress
  );
  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("################# Transaction is failure.");
      }
      unsub();
      console.log("## End setGovernanceTokenAddress");
      callBack();
    }
  });
};

// deployGovernanceToken
const deployGovernanceToken = async (callBack: () => void) => {
  console.log("## Start deployGovernanceToken");

  const contractWasm = governanceTokenContract.source.wasm;
  const contract = new CodePromise(api, governanceTokenAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new(
    { gasLimit, storageDepositLimit },
    "Color Token",
    "CTI",
    999999999999999,
    colorTheInternetContractAddress
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(
    deployer,
    //@ts-ignore
    ({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
          governanceTokenContractAddress = contract.address.toString();
        }
        unsub();
        console.log(
          "### governanceContractAddress:",
          governanceTokenContractAddress
        );
        console.log("## End deployGovernanceToken");
        callBack();
      }
    }
  );
};

// deployColorTheInternet
const deployColorTheInternet = async (callBack: () => void) => {
  console.log("## Start deployColorTheInternet");

  const contractWasm = colorTheInternetContract.source.wasm;
  const contract = new CodePromise(api, colorTheInternetAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new({ gasLimit, storageDepositLimit }, 1);

  //@ts-ignore
  const unsub = await tx.signAndSend(
    deployer,
    //@ts-ignore
    ({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
          colorTheInternetContractAddress = contract.address.toString();
        }
        unsub();
        console.log(
          "### colorTheInternetContractAddress:",
          colorTheInternetContractAddress
        );
        console.log("## End deployColorTheInternet");
        callBack();
      }
    }
  );
};

const checkEventsAndInculueError = (events: any[]): boolean => {
  let ret = false;
  events.forEach(({ event: { data } }) => {
    // console.log("### data.methhod:", data.method);
    if (String(data.method) == "ExtrinsicFailed") {
      console.log("### check ExtrinsicFailed");
      ret = true;
    }
  });
  // console.log("### ret is:", ret);
  return ret;
};

export const getGasLimitForNotDeploy = (api: any): any => {
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: new BN("100000000000"),
    proofSize: new BN("100000000000"),
    // refTime: 6219235328,
    // proofSize: 131072,
  });
  return gasLimit;
};

export const executeAllTest = async () => {
  console.log("Start executeAllTest");

  const wsProvider = new WsProvider("ws://127.0.0.1:9944");
  api = await ApiPromise.create({ provider: wsProvider });
  keyring = new Keyring({ type: "sr25519" });
  deployer = keyring.addFromUri("//Alice");
  Bob = keyring.addFromUri("//Bob");
  Charlie = keyring.addFromUri("//Charlie");
  Dave = keyring.addFromUri("//Dave");

  await test_controller();
  // await deployProposalManager(deployProposalManagerCallBack);
};

const main = () => {
  console.log("Test Start");
  executeAllTest();
};

main();
