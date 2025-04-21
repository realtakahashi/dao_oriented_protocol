import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { ContractPromise, CodePromise } from "@polkadot/api-contract";
import { BN } from "@polkadot/util";
import assert from "assert";

import ColorContract from "./contract_files/color_the_internet.contract.json";
import ColorContractAbi from "../color_the_internet/target/ink/color_the_internet.json";
import GovernanceContract from "./contract_files/governance_token.contract.json";
import GovernanceContractAbi from "../governance_token/target/ink/governance_token.json";

let api: any;
let deployer: any;
let Bob: any;
let Charlie: any;
let Dave: any;
let keyring: any;
const storageDepositLimit = null;

let next_scenario: number = 1;

let colorContractAddress = "";
let governanceContractAddress = "";

const checkEventsAndInculueError = (events: any[]): boolean => {
  let ret = false;
  events.forEach(({ event: { data } }) => {
    // console.log("### data.methhod:", data.method);
    if (String(data.method) == "ExtrinsicFailed") {
      console.log("######## detail:", String(data));
      console.log("######## check ExtrinsicFailed");
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

const test_controller = async () => {
  switch (next_scenario) {
    case 1:
      await deployColorTheInternet(test_controller);
      break;
    case 2:
      await deployGovernanceToken(test_controller);
      break;
    // case 3: supplyInitialGovernanceToken(test_controller);
    //   break;
    case 3:
      await setGovernanceTokenAddress(test_controller);
      break;
    case 4:
      await aliceSignsUp(test_controller);
      break;
    case 5:
      await bobSignsUp(test_controller);
      break;
    case 6:
      await charlieSignsUp(test_controller);
      break;
    case 7:
      await daveSignsUp(test_controller);
      break;
    case 8:
      await checkSignUpDatas();
      await createXXX(test_controller);
      break;
    case 9:
      await addSecondMember(test_controller);
      break;
    case 10:
      await addThirdMember(test_controller);
      break;
    case 11:
      await checkXxxData();
      await proposeColorTheSite(test_controller);
      break;
    case 12:
      await approveColorTheSiteByAlice(test_controller);
      break;
    case 13:
      await approveColorTheSiteByCharlie(test_controller);
      break;
    case 14:
      await checkColorTheSiteData(0);
      await voteToColorTheSite(test_controller);
      break;
    case 15:
      await checkColorTheSiteData(1);
      await stopCreatingXxxForListing(test_controller);
      break;
    case 16:
      await deleteMariciousXxx(test_controller);
      break;
    case 17:
      await finalCheck();
      api.disconnect();
      break;
    default:
      api.disconnect();
      console.log("# End executeAllTest");
      break;
  }
  next_scenario++;
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
};

// finalCheck
const finalCheck = async () => {
  console.log("## Start finalCheck");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    ColorContractAbi,
    colorContractAddress
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
    GovernanceContractAbi,
    governanceContractAddress
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

  const contractWasm = ColorContract.source.wasm;
  const contract = new ContractPromise(
    api,
    ColorContractAbi,
    colorContractAddress
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

  const contractWasm = ColorContract.source.wasm;
  const contract = new ContractPromise(
    api,
    ColorContractAbi,
    colorContractAddress
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

  const contractWasm = ColorContract.source.wasm;
  const contract = new ContractPromise(
    api,
    ColorContractAbi,
    colorContractAddress
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
    ColorContractAbi,
    colorContractAddress
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

  const contractWasm = ColorContract.source.wasm;
  const contract = new ContractPromise(
    api,
    ColorContractAbi,
    colorContractAddress
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

  const contractWasm = ColorContract.source.wasm;
  const contract = new ContractPromise(
    api,
    ColorContractAbi,
    colorContractAddress
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

  const contractWasm = ColorContract.source.wasm;
  const contract = new ContractPromise(
    api,
    ColorContractAbi,
    colorContractAddress
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
    ColorContractAbi,
    colorContractAddress
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

  const contractWasm = ColorContract.source.wasm;
  const contract = new ContractPromise(
    api,
    ColorContractAbi,
    colorContractAddress
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

  const contractWasm = ColorContract.source.wasm;
  const contract = new ContractPromise(
    api,
    ColorContractAbi,
    colorContractAddress
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

  const contractWasm = ColorContract.source.wasm;
  const contract = new ContractPromise(
    api,
    ColorContractAbi,
    colorContractAddress
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
    ColorContractAbi,
    colorContractAddress
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

// daveSignsUp
const daveSignsUp = async (callBack: () => void) => {
  console.log("## Start daveSignsUp");

  const contractWasm = ColorContract.source.wasm;
  const contract = new ContractPromise(
    api,
    ColorContractAbi,
    colorContractAddress
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

// bobSignsUp
const bobSignsUp = async (callBack: () => void) => {
  console.log("## Start bobSignsUp");

  const contractWasm = ColorContract.source.wasm;
  const contract = new ContractPromise(
    api,
    ColorContractAbi,
    colorContractAddress
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

  const contractWasm = ColorContract.source.wasm;
  const contract = new ContractPromise(
    api,
    ColorContractAbi,
    colorContractAddress
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

// aliceSignsUp
const aliceSignsUp = async (callBack: () => void) => {
  console.log("## Start aliceSignsUp");

  const contractWasm = ColorContract.source.wasm;
  const contract = new ContractPromise(
    api,
    ColorContractAbi,
    colorContractAddress
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

// // supplyInitialGovernanceToken
// const supplyInitialGovernanceToken = async (callBack:() => void) => {
//   console.log("## Start supplyInitialGovernanceToken");

//   const contractWasm = GovernanceContract.source.wasm;
//   const contract = new ContractPromise(api, GovernanceContractAbi, governanceContractAddress);
//   const gasLimit: any = api.registry.createType("WeightV2", {
//     refTime: 3219235328,
//     proofSize: 131072,
//   });

//   const { gasRequired } = await contract.query.initialSupply(
//     deployer.address,
//     { value: 0, gasLimit: gasLimit },
//     999999999,
//     colorContractAddress
//   );
//   const tx = await contract.tx.initialSupply(
//     { value: 0, gasLimit: gasRequired },
//     999999999,
//     colorContractAddress
//   );
//   //@ts-ignore
//   const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
//     if (status.isFinalized) {
//       if (checkEventsAndInculueError(events) == true) {
//         console.log("################# Transaction is failure.");
//       }
//       unsub();
//       console.log("## End supplyInitialGovernanceToken");
//       callBack();
//     }
//   });
// }

// setGovernanceTokenAddress
const setGovernanceTokenAddress = async (callBack: () => void) => {
  console.log("## Start setGovernanceTokenAddress");

  const contractWasm = ColorContract.source.wasm;
  const contract = new ContractPromise(
    api,
    ColorContractAbi,
    colorContractAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const { gasRequired } = await contract.query.setGovernanceTokenAddress(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    governanceContractAddress
  );
  const tx = await contract.tx.setGovernanceTokenAddress(
    { value: 0, gasLimit: gasRequired },
    governanceContractAddress
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

  const contractWasm = GovernanceContract.source.wasm;
  const contract = new CodePromise(api, GovernanceContractAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new(
    { gasLimit, storageDepositLimit },
    "Color Token",
    "CTI",
    999999999999999,
    colorContractAddress
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
          governanceContractAddress = contract.address.toString();
        }
        unsub();
        console.log(
          "### governanceContractAddress:",
          governanceContractAddress
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

  const contractWasm = ColorContract.source.wasm;
  const contract = new CodePromise(api, ColorContractAbi, contractWasm);
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
          colorContractAddress = contract.address.toString();
        }
        unsub();
        console.log("### colorContractAddress:", colorContractAddress);
        console.log("## End deployColorTheInternet");
        callBack();
      }
    }
  );
};

const main = () => {
  console.log("# Start executeAllTest");
  executeAllTest();
};

main();
