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

import { BN } from "@polkadot/util";
import assert from "assert";

const storageDepositLimit = null;
const first_delimiter = "$1$";

let memberManagerContractAddressArray:string[] = [];
let proposalManagerContractAddressArray:string[] = [];
let electionManagerContractAddressArray:string[] = [];
let applicaitonCoreContractAddressArray:string[] = [];
let communityListManagerContractAddress:string = "";
let communityTokenContractAddress:string = "";
let communityContractAddressArray:string[] = [];
let api: any;
let deployer: any;
let keyring: any;

let next_base_dao_scenario:number = 1;
let contractAddressIndex:number = 0;
let next_community_list_manager_scenario:number = 1;

/// controller function
const base_dao_creating_test = async () => {
  switch (next_base_dao_scenario){
    case 1:
      await deployProposalManager(base_dao_creating_test);
      break;
    case 2:
      await deployMemberManager(base_dao_creating_test);
      break;
    case 3:
      await deployElectionManager(base_dao_creating_test);
      break;
    case 4:
      await deployApplicationCore(base_dao_creating_test,memberManagerContractAddressArray[contractAddressIndex],proposalManagerContractAddressArray[contractAddressIndex],electionManagerContractAddressArray[contractAddressIndex]);
      break;
    case 5:
      await callConfigurePreInstallMemberManager(base_dao_creating_test, applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    case 6:
      await callConfigurePreInstallProposalManager(base_dao_creating_test, applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    case 7:
      await callConfigurePreInstallElectionManager(base_dao_creating_test, applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    case 8:
      await doAfterDeployTest(applicaitonCoreContractAddressArray[0]);
      const parameter_string = "2$1$Add Bob$1$I propose to add Bob as a member$1$This is a test$1$https://github.com/realtakahashi/dao_oriented_protocol$1$" +
        memberManagerContractAddressArray[contractAddressIndex] +
        "$1$add_member$1$Bob$2$ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR";      
      await createProposal(base_dao_creating_test,proposalManagerContractAddressArray[0], applicaitonCoreContractAddressArray[0], parameter_string);
      break;
    case 9:
      await checkProposalList(1,"Add Bob", applicaitonCoreContractAddressArray[contractAddressIndex]);
      await createElection(base_dao_creating_test,"0",electionManagerContractAddressArray[contractAddressIndex], applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    case 10:
      await voteForProposal(base_dao_creating_test, "0", "yes", electionManagerContractAddressArray[contractAddressIndex], applicaitonCoreContractAddressArray[0]);      
      break;
    case 11:
      await endElection(base_dao_creating_test, "0", electionManagerContractAddressArray[contractAddressIndex], applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    case 12:
      await executeProposal(base_dao_creating_test, "0",proposalManagerContractAddressArray[contractAddressIndex], applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    case 13:
      await checkMember(base_dao_creating_test, 2,"Bob", applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    default:
      // api.disconnect();
      await deploy_and_create_community_list_manager();
      break;
  }
  
  next_base_dao_scenario++;
  console.log("# next_scenario is:",next_base_dao_scenario);    
}

const deploy_and_create_community_list_manager = async () => {
    switch (next_community_list_manager_scenario) {
        case 1:
            await deployCommunityListManager(deploy_and_create_community_list_manager,proposalManagerContractAddressArray[0]);
            break;
        case 2:
            await deployCommunityToken(deploy_and_create_community_list_manager,communityListManagerContractAddress, proposalManagerContractAddressArray[0]);
            break;
        case 3: 
            const param1 = "2$1$Suggestion to install community_list_manager$1$I suggest to install community_list_manager which I have implemented$1$https://github.com/realtakahashi/dao_oriented_protocol$1$This is test$1$"
            + applicaitonCoreContractAddressArray[0]
            + "$1$install_software$1$CommunityListManager$2$CommunityListManager$2$description_community_list_anager$2$"
            + communityListManagerContractAddress;
            await createProposal(deploy_and_create_community_list_manager,proposalManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0], param1);
            break;
        case 4:
            await checkProposalList(2,"Suggestion to install community_list_manager", applicaitonCoreContractAddressArray[0]);
            await createElection(deploy_and_create_community_list_manager,"1",electionManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0]);
            break;
        case 5:
            await voteForProposal(deploy_and_create_community_list_manager, "1", "yes", electionManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0]);
            break;
        case 6:
            deployer = keyring.addFromUri("//Bob");
            await voteForProposal(deploy_and_create_community_list_manager, "1", "yes", electionManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0]);
            break;
        case 7:
            deployer = keyring.addFromUri("//Alice");
            await endElection(deploy_and_create_community_list_manager, "1", electionManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0]);
            break;
        case 8:
            await installSoftware(deploy_and_create_community_list_manager,"1",applicaitonCoreContractAddressArray[0]);
            break;
        case 9:
            await checkSoftwareList(1, "CommunityListManager", communityListManagerContractAddress,applicaitonCoreContractAddressArray[0]);
            const param2 = "2$1$Suggestion to install community_token$1$I suggest to install community_token which I have implemented$1$https://github.com/realtakahashi/dao_oriented_protocol$1$This is test$1$"
            + applicaitonCoreContractAddressArray[0]
            + "$1$install_software$1$CommunityToken$2$CommunityToken$2$description_community_token$2$"
            + communityListManagerContractAddress;
            await createProposal(deploy_and_create_community_list_manager,proposalManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0], param2);
            break;
        case 10:
            await checkProposalList(3,"Suggestion to install community_token", applicaitonCoreContractAddressArray[0]);
            await createElection(deploy_and_create_community_list_manager,"2",electionManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0]);
            break;
        case 11:
            await voteForProposal(deploy_and_create_community_list_manager, "2", "yes", electionManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0]);
            break;
        case 12:
            deployer = keyring.addFromUri("//Bob");
            await voteForProposal(deploy_and_create_community_list_manager, "2", "yes", electionManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0]);
            break;
        case 13:
            deployer = keyring.addFromUri("//Alice");
            await endElection(deploy_and_create_community_list_manager, "2", electionManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0]);
            break;
        case 14:
            await installSoftware(deploy_and_create_community_list_manager,"2",applicaitonCoreContractAddressArray[0]);
            break;
        case 15:
            await checkSoftwareList(3, "CommunityToken", communityListManagerContractAddress,applicaitonCoreContractAddressArray[0]);
            break;
        default:
            api.disconnect();
            break;
    }
    next_community_list_manager_scenario++;
    console.log("# next_community_list_manager_scenario is:",next_community_list_manager_scenario);    
  }



/// query functions
const checkSoftwareList =async (checkcount:number, name:string, contractAddress:string, applicationCoreContractAddress:string) => {
  console.log("checkSoftwareList Start");
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
    console.log("checkSoftwareList End");
  }
}

const checkProposalList =async (checkcount:number, title:string, applicaitonCoreAddress:string) => {
  console.log("checkProposalList Start");
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
  console.log("doAfterDeployTest Start");
  await checkFirstMember(applicaitonCoreAddress);
  await checkPreInstallSoftware(applicaitonCoreAddress);
  
}

const checkMember =async (callBack: () => void, memberCount:number, addedMemberName:string, applicaitonCoreAddress:string) => {
  console.log("checkMember Start");
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
    console.log("checkMember End");
  }
  callBack();
}

const checkFirstMember =async (applicaitonCoreAddress:string) => {
  console.log("checkFirstMember Start");
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
  console.log("checkPreInstallSoftware Start");
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
const installSoftware = async (
  callBack: () => void,
  parameter:string,
  applicationCoreContractAddress:string  
) => {
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
}

const executeProposal = async (callBack: () => void, targetProposalId:string, proposalManagerAddress:string, applicaitonCoreAddress:string) => {
  console.log("executeProposal start");
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
      console.log("executeProposal end");
      callBack();
    }
  });
}

const endElection = async (callBack: () => void,
  targetProposalId:string,
  electionManagerAddress:string,
  applicaitonCoreAddress:string
) => {
  console.log("endElection start");
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
      console.log("endElection end");
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
  console.log("voteForProposal start");
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
      console.log("voteForProposal end");
      callBack();
    }
  });
}

const createElection = async (callBack: () => void,
  targetProposalId:string,
  electionManagerAddress:string,
  applicaitonCoreAddress:string
) => {
  console.log("createElection start");
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
      console.log("createElection end");
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
  console.log("createProposal start");
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
      console.log("createProposal end");
      callBack();
    }
  });
}

const callConfigurePreInstallElectionManager = async (callBack: () => void,
    applicaitonCoreAddress:string    
) => {
  console.log("callConfigurePreInstallElectionManager start");
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
      console.log("callConfigurePreInstallElectionManager end");
      callBack();
    }
  });
};

const callConfigurePreInstallProposalManager = async (callBack: () => void,
    applicaitonCoreAddress:string
) => {
  console.log("callConfigurePreInstallProposalManager start");
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
      console.log("callConfigurePreInstallProposalManager end");
      callBack();
    }
  });
};

const callConfigurePreInstallMemberManager = async (callBack: () => void,
    applicaitonCoreAddress:string
) => {
  console.log("callConfigurePreInstallMemberManager start");
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
      console.log("callConfigurePreInstallMemberManager end");
      callBack();
    }
  });
};

// deploy functions
const deployCommunityToken= async (callBack:()=>void, communityListManagerAddress:string, proposalManagerAddress:string) => {
    console.log("Start deployCommunityToken");

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
          console.log("End deployCommunityToken:address:",communityTokenContractAddress);
          callBack();
        }
      }
    ); 

}

const deployCommunityListManager = async (callBack:()=>void, proposalManagerAddress:string) => {
    console.log("Start deployCommunityListManager");

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
          console.log("End deployCommunityListManager:address:",communityListManagerContractAddress);
          callBack();
        }
      }
    ); 
}

const deployMemberManager = async (callBack: () => void) => {
  console.log("Start deployMemberManager");

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
            memberManagerContractAddressArray.push(contract.address.toString());
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
  const unsub = await tx.signAndSend(deployer,({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
            proposalManagerContractAddressArray.push(contract.address.toString());
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
  const unsub = await tx.signAndSend(deployer,({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
            electionManagerContractAddressArray.push(contract.address.toString());
        }
        unsub();
        console.log("End deployElectionManager");
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
  console.log("Start deployApplicationCore");

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
            applicaitonCoreContractAddressArray.push(contract.address.toString());
        }
        unsub();
        console.log("End deployApplicationCore");
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

  await base_dao_creating_test();
  // await deploy_and_create_community_list_manager()
  // await base_dao_creating_test();
  // await deploy_and_create_community();
};

const main = () => {
  console.log("Test Start");
  executeAllTest();
};

main();
