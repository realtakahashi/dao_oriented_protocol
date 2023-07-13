import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { ContractPromise, CodePromise } from "@polkadot/api-contract";
import proposalManagerContract from "./contract_json/defaultProposalContract.json";
import proposalManagerAbi from "../../../../target/ink/default_proposal/default_proposal.json";
import electionManagerContract from "./contract_json/defaultElectionContract.json";
import electionManagerAbi from "../../../../target/ink/default_election/default_election.json";
import applicationCoreAbi from "../../../../target/ink/application_core/application_core.json";
import communitySubTokenContract from "./contract_json/community_sub_token.json";
import communitySubTokenAbi from "../../../../target/ink/community_sub_token/community_sub_token.json";
import communityCoreContract from "./contract_json/community_core.json";
import communityCoreAbi from "../../../../target/ink/community_core/community_core.json";
import updateMemberManagerContract from "./contract_json/update_member_manager.json";
import updateMemberManagerAbi from "../../../../target/ink/update_member_manager/update_member_manager.json";
import updateApplicationCoreContract from "./contract_json/update_application_core.json";
import updateApplicationCoreAbi from "../../../../target/ink/update_application_core/update_application_core.json";
import { BN } from "@polkadot/util";

const storageDepositLimit = null;

let memberManagerContractAddress:string = "";
let proposalManagerContractAddress:string = "";
let electionManagerContractAddress:string = "";
let applicaitonCoreContractAddress:string = "";
let communityContractAddress:string = "";
let communitySubTokenContractAddress:string = "";
let api: any;
let deployer: any;
let keyring: any;

let next_community_scenario:number = 0;

/// controller function
const deploy_and_create_community = async () => {
  switch(next_community_scenario){
    case 0:
      await readConfigFile(deploy_and_create_community);
      break;
    case 1:
      //console.log("##### deploy & create community call test is started.");
      await deployProposalManager(deploy_and_create_community);
      break;
    case 2:
      await deployCommunity(deploy_and_create_community,contribution_check_interval,community_name,community_description);
      break;
    case 3:
      await deployUpdateMemberManager(deploy_and_create_community,communityContractAddress);
      break;
    case 4:
      await deployElectionManager(deploy_and_create_community);
      break;
    case 5:
      await deployCommunitySubToken(deploy_and_create_community,community_sub_token_name,community_sub_token_symbol,18, communityContractAddress, 
        community_token_address,proposalManagerContractAddress);
      break;
    case 6:
        await deployUpdateApplicationCore(deploy_and_create_community,memberManagerContractAddress,
          proposalManagerContractAddress,electionManagerContractAddress,
          communityContractAddress,communitySubTokenContractAddress,community_list_manager_address);
        break;
    case 7:
      await callConfigurePreInstallMemberManager(deploy_and_create_community, applicaitonCoreContractAddress);
      break;
    case 8:
      await callConfigurePreInstallProposalManager(deploy_and_create_community, applicaitonCoreContractAddress);
      break;
    case 9:
      await callConfigurePreInstallElectionManager(deploy_and_create_community, applicaitonCoreContractAddress);
      break;
    case 10:
      await callConfigurePreInstallCommunityCore(deploy_and_create_community,applicaitonCoreContractAddress);
      break;
    case 11:
      await callConfigurePreInstallCommunitySubToken(deploy_and_create_community,applicaitonCoreContractAddress);
      break;
    default:
      api.disconnect();
      console.log("");
      console.log("######## Application Core Address is :    ",applicaitonCoreContractAddress);
      console.log("######## Proposal Manager Address is :    ",proposalManagerContractAddress);
      console.log("######## Member Manager Address is :      ",memberManagerContractAddress);
      console.log("######## Election Manager Address is :    ",electionManagerContractAddress);
      console.log("######## Community Address is :           ",communityContractAddress);
      console.log("######## Community Sub Token Address is : ",communitySubTokenContractAddress);
      console.log("");
      console.log("======== Creating Community is finished!");
      break;
  }
  next_community_scenario++;
  // console.log("# next_community_scenario is:",next_community_scenario);  
}


const callConfigurePreInstallCommunityCore = async (callBack: () => void,
    applicaitonCoreAddress:string    
) => {
  // console.log("callConfigurePreInstallCommunityCore start");
  console.log("======== Configure Community Contract");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    updateApplicationCoreAbi,
    applicaitonCoreAddress
  );
  const { gasRequired } = await contract.query.configurePreInstallCommunityCore(
    deployer.address,
    { value: 0, gasLimit: gasLimit }
  );
  const tx = await contract.tx.configurePreInstallCommunityCore({
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
      // console.log("callConfigurePreInstallCommunityCore end");
      callBack();
    }
  });
};

const callConfigurePreInstallCommunitySubToken = async (callBack: () => void,
    applicaitonCoreAddress:string    
) => {
  // console.log("callConfigurePreInstallCommunitySubToken start");
  console.log("======== Configure Community Sub Token Contract");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    updateApplicationCoreAbi,
    applicaitonCoreAddress
  );
  const { gasRequired } = await contract.query.configurePreInstallCommunitySubToken(
    deployer.address,
    { value: 0, gasLimit: gasLimit }
  );
  const tx = await contract.tx.configurePreInstallCommunitySubToken({
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
      // console.log("callConfigurePreInstallCommunitySubToken end");
      callBack();
    }
  });
};

const callConfigurePreInstallProposalManager = async (callBack: () => void,
    applicaitonCoreAddress:string
) => {
  // console.log("callConfigurePreInstallProposalManager start");
  console.log("======== Configure Proposal Manager Contract");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicaitonCoreAddress
  );
  const { gasRequired } = await contract.query.configurePreInstallProposalManager(
    deployer.address,
    { value: 0, gasLimit: gasLimit }
  );
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
      // console.log("callConfigurePreInstallProposalManager end");
      callBack();
    }
  });
};

const callConfigurePreInstallElectionManager = async (callBack: () => void,
    applicaitonCoreAddress:string
) => {
  // console.log("callConfigurePreInstallElectionManager start");
  console.log("======== Configure Election Manager Contract");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicaitonCoreAddress
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
      // console.log("callConfigurePreInstallElectionManager end");
      callBack();
    }
  });
};

const callConfigurePreInstallMemberManager = async (callBack: () => void,
    applicaitonCoreAddress:string
) => {
  // console.log("callConfigurePreInstallMemberManager start");
  console.log("======== Configure Member Manager Contract");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicaitonCoreAddress
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
      // console.log("callConfigurePreInstallMemberManager end");
      callBack();
    }
  });
};

// deploy functions
const deployCommunitySubToken = async (
  callBack:()=>void, 
  name: string,
  symbol: string,
  decimal:number,
  communityCoreAddress:string,
  communityTokenAddress:string, 
  proposalManagerAddress:string
) => {
  // console.log("Start deployCommunitySubToken");
  console.log("======== Deploy Community Sub Token Contract");

  const contractWasm = communitySubTokenContract.source.wasm;
  const contract = new CodePromise(api, communitySubTokenAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new(
      { gasLimit, storageDepositLimit },
      name,
      symbol,
      decimal,
      communityCoreAddress,
      communityTokenAddress, 
      proposalManagerAddress
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer,({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
          communitySubTokenContractAddress = contract.address.toString();
        }
        unsub();
        // console.log("End deployCommunitySubToken:address:",communitySubTokenContractAddress);
        callBack();
      }
    }
  ); 
}

const deployCommunity = async (
  callBack:()=>void, 
  checkIntervalOfBlocktime:number,
  name:string,
  contents:string,
) => {
  // console.log("Start deployCommunity");
  console.log("======== Deploy Community Contract");

  const contractWasm = communityCoreContract.source.wasm;
  const contract = new CodePromise(api, communityCoreAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new(
      { gasLimit, storageDepositLimit },
      checkIntervalOfBlocktime,
      name,
      contents,
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer,({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
          communityContractAddress = contract.address.toString();
        }
        unsub();
        // console.log("End deployCommunity:address:",communityContractAddress);
        callBack();
      }
    }
  ); 
}

const deployUpdateMemberManager = async (callBack: () => void, communityCoreAddress:string) => {
  // console.log("Start deployUpdateMemberManager");
  console.log("======== Deploy Member Manager Contract");

  const contractWasm = updateMemberManagerContract.source.wasm;
  const contract = new CodePromise(api, updateMemberManagerAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new({ gasLimit, storageDepositLimit }, "Alice", communityCoreAddress);

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer,({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
            memberManagerContractAddress = contract.address.toString();
        }
        unsub();
        // console.log("End deployUpdateMemberManager address:",memberManagerContractAddress);
        callBack();
      }
    }
  );
};


const deployProposalManager = async (callBack: () => void) => {
  // console.log("======== Deploy Proposal Manager");
  console.log("======== Deploy Proposal Manager Contract");

  const contractWasm = proposalManagerContract.source.wasm;
  const contract = new CodePromise(api, proposalManagerAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new({ gasLimit, storageDepositLimit });

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer,({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
            proposalManagerContractAddress = contract.address.toString();
        }
        unsub();
        // console.log("End deployProposalManager address: ",proposalManagerContractAddress);
        callBack();
      }
    }
  );
};

const deployElectionManager = async (callBack: () => void) => {
  // console.log("Start deployElectionManager");
  console.log("======== Deploy Election Manager Contract");

  const contractWasm = electionManagerContract.source.wasm;
  const contract = new CodePromise(api, electionManagerAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new({ gasLimit, storageDepositLimit });

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer,({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
            electionManagerContractAddress = contract.address.toString();
        }
        unsub();
        // console.log("End deployElectionManager address: ", electionManagerContractAddress);
        callBack();
      }
    }
  );
};


const deployUpdateApplicationCore = async (
  callBack: () => void, 
  memberManagerAddress:string,
  proposalManagerAddress:string,
  electionManagerAddress:string,
  communityCoreAddress:string,
  communitySubTokenAddress:string,
  communityListManagerAddress:string,
) => {
// console.log("Start deployUpdateApplicationCore");
console.log("======== Deploy Application Core Contract");

const contractWasm = updateApplicationCoreContract.source.wasm;
const contract = new CodePromise(api, updateApplicationCoreAbi, contractWasm);
const gasLimit: any = api.registry.createType("WeightV2", {
  refTime: 3219235328,
  proofSize: 131072,
});

const tx = contract.tx.new(
  { gasLimit, storageDepositLimit },
  memberManagerAddress,
  proposalManagerAddress,
  electionManagerAddress,
  communityCoreAddress,
  communitySubTokenAddress,
  communityListManagerAddress
);

//@ts-ignore
const unsub = await tx.signAndSend(deployer,({ events = [], status, contract }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events)) {
        console.log("Transaction is failure.");
      } else {
          applicaitonCoreContractAddress = contract.address.toString();
      }
      unsub();
      // console.log("End deployUpdateApplicationCore address: ",applicaitonCoreContractAddress);
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
  await deploy_and_create_community();
};

const toml = require("toml");
const { promisify } = require("util");
const fs = require("fs");
const readFileAsync = promisify(fs.readFile);

let private_key="";
let community_list_manager_address="";
let blockchain_url="";
let community_name="";
let community_description="";
let contribution_check_interval=0;
let community_sub_token_name="";
let community_sub_token_symbol="";
let community_token_address="";

export const readConfigFile = async (callBack: () => void) => {
  readFileAsync("./config.toml")
  //@ts-ignore
  .then(async obj => {
    const data = toml.parse(obj);
    private_key = data.common.private_key;
    community_list_manager_address = data.common.community_list_manager_address;
    community_token_address = data.common.community_token_address;
    blockchain_url = data.common.blockchain_url;
    community_name = data.community.community_name;
    community_description = data.community.community_description;
    contribution_check_interval = data.community.contribution_check_interval;
    community_sub_token_name = data.community_sub_token.community_sub_token_name;
    community_sub_token_symbol = data.community_sub_token.community_sub_token_symbol;
    console.log("");
    console.log("======== Configuration Settings ->->->");
    console.log("======== = private_key: ", private_key);
    console.log("======== = community_list_manager_address: ", community_list_manager_address);
    console.log("======== = community_token_address: ", community_token_address);
    console.log("======== = blockchain_url: ", blockchain_url);
    console.log("======== = community_name: ", community_name);
    console.log("======== = community_description: ", community_description);
    console.log("======== = contribution_check_interval: ", contribution_check_interval);
    console.log("======== = community_sub_token_name: ", community_sub_token_name);
    console.log("======== = community_sub_token_symbol: ", community_sub_token_symbol);
    console.log("");

    const wsProvider = new WsProvider(blockchain_url);
    api = await ApiPromise.create({ provider: wsProvider });
    keyring = new Keyring({ type: "sr25519" });
    deployer = keyring.addFromUri(private_key);
  
    callBack();
  });

}

const main = async () => {
  console.log("======== Creating Community is started......");
  executeAllTest();
};

main();
