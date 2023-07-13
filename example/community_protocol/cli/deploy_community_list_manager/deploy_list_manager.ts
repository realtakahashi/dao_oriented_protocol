import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { ContractPromise, CodePromise } from "@polkadot/api-contract";
import proposalManagerContract from "./contract_json/defaultProposalContract.json";
import proposalManagerAbi from "../../../../target/ink/default_proposal/default_proposal.json";
import memberManagerContract from "./contract_json/defaultMemberContract.json";
import memberManagerAbi from "../../../../target/ink/default_member/default_member.json";
import electionManagerContract from "./contract_json/defaultElectionContract.json";
import electionManagerAbi from "../../../../target/ink/default_election/default_election.json";
import applicationCoreContract from "./contract_json/applicationCoreConatract.json";
import applicationCoreAbi from "../../../../target/ink/application_core/application_core.json";
import communityListManagerContract from "./contract_json/community_list_manager.json";
import communityListManagerAbi from "../../../../target/ink/community_list_manager/community_list_manager.json";
import communityTokenContract from "./contract_json/community_token.json";
import communityTokenAbi from "../../../../target/ink/community_token/community_token.json";
import communityCoreAbi from "../../../../target/ink/community_core/community_core.json";

import { BN } from "@polkadot/util";
import assert from "assert";

const storageDepositLimit = null;
const first_delimiter = "$1$";

let memberManagerContractAddress:string = "";
let proposalManagerContractAddress:string = "";
let electionManagerContractAddress:string = "";
let applicaitonCoreContractAddress:string = "";
let communityListManagerContractAddress:string = "";
let communityTokenContractAddress:string = "";
let api: any;
let deployer: any;
let keyring: any;

let next_community_list_manager_scenario:number = 0;

/// controller function
const community_list_manager_test = async () => {
  switch (next_community_list_manager_scenario){
    case 0:
      await readConfigFile(community_list_manager_test);
      break;
    case 1:
      console.log("======== Deploy Proposal Manager Contract");
      await deployProposalManager(community_list_manager_test);
      break;
    case 2:
      console.log("======== Deploy Memeber Manager Contract");
      await deployMemberManager(community_list_manager_test);
      break;
    case 3:
      console.log("======== Deploy Election Manager Contract");
      await deployElectionManager(community_list_manager_test);
      break;
    case 4:
      console.log("======== Deploy Application Core Contract");
      await deployApplicationCore(community_list_manager_test,memberManagerContractAddress,proposalManagerContractAddress,electionManagerContractAddress);
      break;
    case 5:
      console.log("======== Configure Member Manager Contract");
      await callConfigurePreInstallMemberManager(community_list_manager_test, applicaitonCoreContractAddress);
      break;
    case 6:
      console.log("======== Configure Proposal Manager Contract");
      await callConfigurePreInstallProposalManager(community_list_manager_test, applicaitonCoreContractAddress);
      break;
    case 7:
      console.log("======== Configure Election Manager Contract");
      await callConfigurePreInstallElectionManager(community_list_manager_test, applicaitonCoreContractAddress);
      break;
    case 8:
      await doAfterDeployTest(applicaitonCoreContractAddress);
      const parameter_string = "2$1$Add Bob$1$I propose to add Bob as a member$1$This is a test$1$https://github.com/realtakahashi/dao_oriented_protocol$1$" +
        memberManagerContractAddress +
        "$1$add_member$1$Bob$2$ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR";      
      await createProposal(community_list_manager_test,proposalManagerContractAddress, applicaitonCoreContractAddress, parameter_string);
      break;
    case 9:
      await checkProposalList(1,"Add Bob", applicaitonCoreContractAddress);
      await createElection(community_list_manager_test,"0",electionManagerContractAddress, applicaitonCoreContractAddress);
      break;
    case 10:
      await voteForProposal(community_list_manager_test, "0", "yes", electionManagerContractAddress, applicaitonCoreContractAddress);      
      break;
    case 11:
      await endElection(community_list_manager_test, "0", electionManagerContractAddress, applicaitonCoreContractAddress);
      break;
    case 12:
      await executeProposal(community_list_manager_test, "0",proposalManagerContractAddress, applicaitonCoreContractAddress);
      break;
    case 13:
      console.log("======== Add Bob as member of test");
      await checkMember(2,"Bob", applicaitonCoreContractAddress);
      console.log("======== Deploy Coomunity List Manager Contract");
      await deployCommunityListManager(community_list_manager_test,proposalManagerContractAddress);
      break;
    case 14:
      console.log("======== Deploy Community Token Contract");
      await deployCommunityToken(community_list_manager_test,communityListManagerContractAddress, proposalManagerContractAddress);
      break;
    case 15: 
      const param1 = "2$1$Suggestion to install community_list_manager$1$I suggest to install community_list_manager which I have implemented$1$https://github.com/realtakahashi/dao_oriented_protocol$1$This is test$1$"
        + applicaitonCoreContractAddress
        + "$1$install_software$1$CommunityListManager$2$CommunityListManager$2$description_community_list_anager$2$"
        + communityListManagerContractAddress;
      await createProposal(community_list_manager_test,proposalManagerContractAddress,applicaitonCoreContractAddress, param1);
      break;
    case 16:
      await checkProposalList(2,"Suggestion to install community_list_manager", applicaitonCoreContractAddress);
      await createElection(community_list_manager_test,"1",electionManagerContractAddress,applicaitonCoreContractAddress);
      break;
    case 17:
        await voteForProposal(community_list_manager_test, "1", "yes", electionManagerContractAddress,applicaitonCoreContractAddress);
        break;
    case 18:
        deployer = keyring.addFromUri("//Bob");
        await voteForProposal(community_list_manager_test, "1", "yes", electionManagerContractAddress,applicaitonCoreContractAddress);
        break;
    case 19:
        deployer = keyring.addFromUri("//Alice");
        await endElection(community_list_manager_test, "1", electionManagerContractAddress,applicaitonCoreContractAddress);
        break;
    case 20:
        console.log("======== Install Community List Manager");
        await installSoftware(community_list_manager_test,"1",applicaitonCoreContractAddress);
        break;
    case 21:
        await checkSoftwareList(1, "CommunityListManager", communityListManagerContractAddress,applicaitonCoreContractAddress);
        const param2 = "2$1$Suggestion to install community_token$1$I suggest to install community_token which I have implemented$1$https://github.com/realtakahashi/dao_oriented_protocol$1$This is test$1$"
        + applicaitonCoreContractAddress
        + "$1$install_software$1$CommunityToken$2$CommunityToken$2$description_community_token$2$"
        + communityTokenContractAddress;
        await createProposal(community_list_manager_test,proposalManagerContractAddress,applicaitonCoreContractAddress, param2);
        break;
    case 22:
        await checkProposalList(3,"Suggestion to install community_token", applicaitonCoreContractAddress);
        await createElection(community_list_manager_test,"2",electionManagerContractAddress,applicaitonCoreContractAddress);
        break;
    case 23:
        await voteForProposal(community_list_manager_test, "2", "yes", electionManagerContractAddress,applicaitonCoreContractAddress);
        break;
    case 24:
        deployer = keyring.addFromUri("//Bob");
        await voteForProposal(community_list_manager_test, "2", "yes", electionManagerContractAddress,applicaitonCoreContractAddress);
        break;
    case 25:
        deployer = keyring.addFromUri("//Alice");
        await endElection(community_list_manager_test, "2", electionManagerContractAddress,applicaitonCoreContractAddress);
        break;
    case 26:
      console.log("======== Install Community Token");
        await installSoftware(community_list_manager_test,"2",applicaitonCoreContractAddress);
        break;
    case 27:
        await checkSoftwareList(2, "CommunityToken", communityTokenContractAddress,applicaitonCoreContractAddress);
        await transferNativeToken(community_list_manager_test);
        break;
    default:
      api.disconnect();
      console.log("");
      console.log("######## Application Core Address is       : ",applicaitonCoreContractAddress);
      console.log("######## Proposal Manager Address is       : ",proposalManagerContractAddress);
      console.log("######## Member Manager Address is         : ",memberManagerContractAddress);
      console.log("######## Election Manager Address is       : ",electionManagerContractAddress);
      console.log("######## Community List Manager Address is : ",communityListManagerContractAddress);
      console.log("######## Community Token Address is        : ",communityTokenContractAddress);
      console.log("");
      console.log("======== Creating Community List Manager is finished!");
      break;
  }
  next_community_list_manager_scenario++;
  // console.log("# next_community_list_manager_scenario is:",next_community_list_manager_scenario);    
}

/// query functions
const checkSoftwareList =async (checkcount:number, name:string, contractAddress:string, applicationCoreContractAddress:string) => {
  // console.log("checkSoftwareList Start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );
  const { gasConsumed, result, output } = await contract.query.getInstalledSoftware(
    deployer.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
  );
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    assert.equal(json_data.length,checkcount);
    assert.equal(json_data[checkcount-1].name,name);
    assert.equal(json_data[checkcount-1].contractAddress,contractAddress);
    // console.log("checkSoftwareList End");
  }
}

const checkProposalList =async (checkcount:number, title:string, applicaitonCoreAddress:string) => {
  // console.log("checkProposalList Start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicaitonCoreAddress
  );
  const { gasConsumed, result, output } = await contract.query.getProposalInfoList(
    deployer.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
  );
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    assert.equal(json_data.length,checkcount);
    assert.equal(json_data[checkcount-1].title,title);
  }
}


const doAfterDeployTest =async (applicaitonCoreAddress:string) => {
  // console.log("doAfterDeployTest Start");
  await checkFirstMember(applicaitonCoreAddress);
  await checkPreInstallSoftware(applicaitonCoreAddress);
  
}

const checkMember =async (memberCount:number, addedMemberName:string, applicaitonCoreAddress:string) => {
  // console.log("checkMember Start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicaitonCoreAddress
  );
  const { gasConsumed, result, output } = await contract.query.getMemberList(
    deployer.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
  );
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    // console.log("output.toJSON():",output.toJSON());
    let json_data = JSON.parse(JSON.stringify(response_json));
    assert.equal(json_data.length,memberCount);
    assert.equal(json_data[memberCount-1].name,addedMemberName);
    // console.log("checkMember End");
  }
}

const checkFirstMember =async (applicaitonCoreAddress:string) => {
  // console.log("checkFirstMember Start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicaitonCoreAddress
  );
  const { gasConsumed, result, output } = await contract.query.getMemberList(
    deployer.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
  );
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    // console.log("output.toJSON():",output.toJSON());
    let json_data = JSON.parse(JSON.stringify(response_json));
    assert.equal(json_data.length,1,"member count is not 1.");
    assert.equal(json_data[0].name,"Alice","member is not Alice.");
  }
}

const checkPreInstallSoftware =async (applicaitonCoreAddress:string) => {
  // console.log("checkPreInstallSoftware Start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicaitonCoreAddress
  );
  const { gasConsumed, result, output } = await contract.query.getPreInstalledSoftware(
    deployer.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
  );
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    // console.log("output.toJSON():",output.toJSON());
    let json_data = JSON.parse(JSON.stringify(response_json));
    assert.equal(json_data.length,3,"pre_software count is not 3.");
    assert.equal(json_data[0].name,"Member Manager");
    assert.equal(json_data[1].name,"Proposal Manager");
    assert.equal(json_data[2].name,"Election Manager");
  }
}

/// transaction functions
const transferNativeToken = async (callBack:()=>void) => {
  // console.log("transferNativeToken start");
  // transfer tokens
  const transfer = api.tx.balances.transfer(communityListManagerContractAddress, 12345);
  //@ts-ignore
  const unsub = await transfer.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("### Transaction is failure.");
      }
      unsub();
      // console.log("transferNativeToken end");
      callBack();
    }
  });
}


const installSoftware = async (
  callBack: () => void,
  parameter:string,
  applicationCoreContractAddress:string  
) => {
  // console.log("installSoftware start");
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
      // console.log("installSoftware end");
      callBack();
    }
  });
}

const executeProposal = async (callBack: () => void, targetProposalId:string, proposalManagerAddress:string, applicaitonCoreAddress:string) => {
  // console.log("executeProposal start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicaitonCoreAddress
  );

  const { gasRequired } = await contract.query.executeInterface(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    proposalManagerAddress,
    "execute_proposal",
    targetProposalId
  );
  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired },
    proposalManagerAddress,
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
      // console.log("executeProposal end");
      callBack();
    }
  });
}

const endElection = async (callBack: () => void,
  targetProposalId:string,
  electionManagerAddress:string,
  applicaitonCoreAddress:string
) => {
  // console.log("endElection start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicaitonCoreAddress
  );

  const { gasRequired } = await contract.query.executeInterface(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    electionManagerAddress,
    "end_election",
    targetProposalId
  );
  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired },
    electionManagerAddress,
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
      // console.log("endElection end");
      callBack();
    }
  });
}

const voteForProposal = async (callBack: () => void,
  targetProposalId:string,
  yesOrNoString:string,
  electionManagerAddress:string,
  applicaitonCoreAddress:string
) => {
  // console.log("voteForProposal start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicaitonCoreAddress
  );

  const parameter_string = targetProposalId + first_delimiter + yesOrNoString;

  const { gasRequired } = await contract.query.executeInterface(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    electionManagerAddress,
    "vote",
    parameter_string
  );
  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired },
    electionManagerAddress,
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
      // console.log("voteForProposal end");
      callBack();
    }
  });
}

const createElection = async (callBack: () => void,
  targetProposalId:string,
  electionManagerAddress:string,
  applicaitonCoreAddress:string
) => {
  // console.log("createElection start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicaitonCoreAddress
  );

  const { gasRequired } = await contract.query.executeInterface(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    electionManagerAddress,
    "create_election",
    targetProposalId
  );
  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired },
    electionManagerAddress,
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
      // console.log("createElection end");
      callBack();
    }
  });
}

const createProposal = async (
    callBack: () => void,
    proposalManagerAddress:string,
    applicaitonCoreAddress:string,
    parameter_string:string
) => {
  // console.log("createProposal start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicaitonCoreAddress
  );


  const { gasRequired } = await contract.query.executeInterface(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    proposalManagerAddress,
    "add_proposal",
    parameter_string
  );
  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired },
    proposalManagerAddress,
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
      // console.log("createProposal end");
      callBack();
    }
  });
}


const callConfigurePreInstallProposalManager = async (callBack: () => void,
    applicaitonCoreAddress:string
) => {
  // console.log("callConfigurePreInstallProposalManager start");
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
const deployCommunityToken= async (callBack:()=>void, communityListManagerAddress:string, proposalManagerAddress:string) => {
    // console.log("Start deployCommunityToken");

    const contractWasm = communityTokenContract.source.wasm;
    const contract = new CodePromise(api, communityTokenAbi, contractWasm);
    const gasLimit: any = api.registry.createType("WeightV2", {
      refTime: 3219235328,
      proofSize: 131072,
    });
  
    const tx = contract.tx.new(
        { gasLimit, storageDepositLimit },
        "community_token_name_test",
        "CTNT",
        18,
        1000000000000,
        communityListManagerContractAddress, 
        proposalManagerAddress
    );
  
    //@ts-ignore
    const unsub = await tx.signAndSend(deployer,({ events = [], status, contract }) => {
        if (status.isFinalized) {
          if (checkEventsAndInculueError(events)) {
            console.log("Transaction is failure.");
          } else {
            communityTokenContractAddress = contract.address.toString();
          }
          unsub();
          // console.log("End deployCommunityToken:address:",communityTokenContractAddress);
          callBack();
        }
      }
    ); 

}

const deployCommunityListManager = async (callBack:()=>void, proposalManagerAddress:string) => {
    // console.log("Start deployCommunityListManager");

    const contractWasm = communityListManagerContract.source.wasm;
    const contract = new CodePromise(api, communityListManagerAbi, contractWasm);
    const gasLimit: any = api.registry.createType("WeightV2", {
      refTime: 3219235328,
      proofSize: 131072,
    });
  
    const tx = contract.tx.new({ gasLimit, storageDepositLimit }, proposalManagerAddress);
  
    //@ts-ignore
    const unsub = await tx.signAndSend(deployer,({ events = [], status, contract }) => {
        if (status.isFinalized) {
          if (checkEventsAndInculueError(events)) {
            console.log("Transaction is failure.");
          } else {
              communityListManagerContractAddress = contract.address.toString();
          }
          unsub();
          // console.log("End deployCommunityListManager:address:",communityListManagerContractAddress);
          callBack();
        }
      }
    ); 
}

const deployMemberManager = async (callBack: () => void) => {
  // console.log("Start deployMemberManager");

  const contractWasm = memberManagerContract.source.wasm;
  const contract = new CodePromise(api, memberManagerAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new({ gasLimit, storageDepositLimit }, "Alice");

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer,({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
            memberManagerContractAddress = contract.address.toString();
        }
        unsub();
        // console.log("End deployMemberManager address: ", memberManagerContractAddress);
        callBack();
      }
    }
  );
};

const deployProposalManager = async (callBack: () => void) => {
  // console.log("Start deployProposalManager");

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

const deployApplicationCore = async (
    callBack: () => void, 
    memberManagerAddress:string,
    proposalManagerAddress:string,
    electionManagerAddress:string,
) => {
  // console.log("Start deployApplicationCore");

  const contractWasm = applicationCoreContract.source.wasm;
  const contract = new CodePromise(api, applicationCoreAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new(
    { gasLimit, storageDepositLimit },
    memberManagerAddress,
    proposalManagerAddress,
    electionManagerAddress
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
        // console.log("End deployApplicationCore address: ",applicaitonCoreContractAddress);
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

const toml = require("toml");
const { promisify } = require("util");
const fs = require("fs");
const readFileAsync = promisify(fs.readFile);

let private_key="";
let blockchain_url="";

export const readConfigFile = async (callBack: () => void) => {
  readFileAsync("./config.toml")
  //@ts-ignore
  .then(async obj => {
    const data = toml.parse(obj);
    private_key = data.common.private_key;
    blockchain_url = data.common.blockchain_url;
    console.log("");
    console.log("======== Configuration Settings ->->->");
    console.log("======== = private_key: ", private_key);
    console.log("======== = blockchain_url: ", blockchain_url);
    console.log("");

    const wsProvider = new WsProvider(blockchain_url);
    api = await ApiPromise.create({ provider: wsProvider });
    keyring = new Keyring({ type: "sr25519" });
    deployer = keyring.addFromUri(private_key);
  
    callBack();
  });

}

export const executeAllTest = async () => {

  await community_list_manager_test();
};

const main = () => {
  console.log("======== Creating Community List Manager is started......");
  executeAllTest();
};

main();
