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
import communitySubTokenContract from "./contract_json/community_sub_token.json";
import communitySubTokenAbi from "../../../../target/ink/community_sub_token/community_sub_token.json";
import communityCoreContract from "./contract_json/community_core.json";
import communityCoreAbi from "../../../../target/ink/community_core/community_core.json";
import updateMemberManagerContract from "./contract_json/update_member_manager.json";
import updateMemberManagerAbi from "../../../../target/ink/update_member_manager/update_member_manager.json";

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
let communityContractAddress:string = "";
let communitySubTokenContractAddress:string = "";
let api: any;
let deployer: any;
let keyring: any;

let contractAddressIndex:number = 0;
let next_community_list_manager_scenario:number = 1;
let next_community_scenario:number = 1;
let next_community_business_logic_scenario:number = 1;

/// controller function
const community_list_manager_test = async () => {
  switch (next_community_list_manager_scenario){
    case 1:
      console.log("####### community_list_manager_test start.");
      await deployProposalManager(community_list_manager_test);
      break;
    case 2:
      await deployMemberManager(community_list_manager_test);
      break;
    case 3:
      await deployElectionManager(community_list_manager_test);
      break;
    case 4:
      await deployApplicationCore(community_list_manager_test,memberManagerContractAddressArray[contractAddressIndex],proposalManagerContractAddressArray[contractAddressIndex],electionManagerContractAddressArray[contractAddressIndex]);
      break;
    case 5:
      await callConfigurePreInstallMemberManager(community_list_manager_test, applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    case 6:
      await callConfigurePreInstallProposalManager(community_list_manager_test, applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    case 7:
      await callConfigurePreInstallElectionManager(community_list_manager_test, applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    case 8:
      await doAfterDeployTest(applicaitonCoreContractAddressArray[contractAddressIndex]);
      const parameter_string = "2$1$Add Bob$1$I propose to add Bob as a member$1$This is a test$1$https://github.com/realtakahashi/dao_oriented_protocol$1$" +
        memberManagerContractAddressArray[contractAddressIndex] +
        "$1$add_member$1$Bob$2$ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR";      
      await createProposal(community_list_manager_test,proposalManagerContractAddressArray[contractAddressIndex], applicaitonCoreContractAddressArray[contractAddressIndex], parameter_string);
      break;
    case 9:
      await checkProposalList(1,"Add Bob", applicaitonCoreContractAddressArray[contractAddressIndex]);
      await createElection(community_list_manager_test,"0",electionManagerContractAddressArray[contractAddressIndex], applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    case 10:
      await voteForProposal(community_list_manager_test, "0", "yes", electionManagerContractAddressArray[contractAddressIndex], applicaitonCoreContractAddressArray[contractAddressIndex]);      
      break;
    case 11:
      await endElection(community_list_manager_test, "0", electionManagerContractAddressArray[contractAddressIndex], applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    case 12:
      await executeProposal(community_list_manager_test, "0",proposalManagerContractAddressArray[contractAddressIndex], applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    case 13:
      await checkMember(2,"Bob", applicaitonCoreContractAddressArray[contractAddressIndex]);
      await deployCommunityListManager(community_list_manager_test,proposalManagerContractAddressArray[0]);
      break;
    case 14:
      await deployCommunityToken(community_list_manager_test,communityListManagerContractAddress, proposalManagerContractAddressArray[0]);
      break;
    case 15: 
      const param1 = "2$1$Suggestion to install community_list_manager$1$I suggest to install community_list_manager which I have implemented$1$https://github.com/realtakahashi/dao_oriented_protocol$1$This is test$1$"
        + applicaitonCoreContractAddressArray[0]
        + "$1$install_software$1$CommunityListManager$2$CommunityListManager$2$description_community_list_anager$2$"
        + communityListManagerContractAddress;
      await createProposal(community_list_manager_test,proposalManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0], param1);
      break;
    case 16:
      await checkProposalList(2,"Suggestion to install community_list_manager", applicaitonCoreContractAddressArray[0]);
      await createElection(community_list_manager_test,"1",electionManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0]);
      break;
    case 17:
        await voteForProposal(community_list_manager_test, "1", "yes", electionManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0]);
        break;
    case 18:
        deployer = keyring.addFromUri("//Bob");
        await voteForProposal(community_list_manager_test, "1", "yes", electionManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0]);
        break;
    case 19:
        deployer = keyring.addFromUri("//Alice");
        await endElection(community_list_manager_test, "1", electionManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0]);
        break;
    case 20:
        await installSoftware(community_list_manager_test,"1",applicaitonCoreContractAddressArray[0]);
        break;
    case 21:
        await checkSoftwareList(1, "CommunityListManager", communityListManagerContractAddress,applicaitonCoreContractAddressArray[0]);
        const param2 = "2$1$Suggestion to install community_token$1$I suggest to install community_token which I have implemented$1$https://github.com/realtakahashi/dao_oriented_protocol$1$This is test$1$"
        + applicaitonCoreContractAddressArray[0]
        + "$1$install_software$1$CommunityToken$2$CommunityToken$2$description_community_token$2$"
        + communityTokenContractAddress;
        await createProposal(community_list_manager_test,proposalManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0], param2);
        break;
    case 22:
        await checkProposalList(3,"Suggestion to install community_token", applicaitonCoreContractAddressArray[0]);
        await createElection(community_list_manager_test,"2",electionManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0]);
        break;
    case 23:
        await voteForProposal(community_list_manager_test, "2", "yes", electionManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0]);
        break;
    case 24:
        deployer = keyring.addFromUri("//Bob");
        await voteForProposal(community_list_manager_test, "2", "yes", electionManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0]);
        break;
    case 25:
        deployer = keyring.addFromUri("//Alice");
        await endElection(community_list_manager_test, "2", electionManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0]);
        break;
    case 26:
        await installSoftware(community_list_manager_test,"2",applicaitonCoreContractAddressArray[0]);
        break;
    case 27:
        await checkSoftwareList(2, "CommunityToken", communityTokenContractAddress,applicaitonCoreContractAddressArray[0]);
        await transferNativeToken(community_list_manager_test);
        contractAddressIndex++;
        console.log("######## community adding test start.");
        break;
    default:
      await deploy_and_create_community();
      break;
  }
  next_community_list_manager_scenario++;
  console.log("# next_community_list_manager_scenario is:",next_community_list_manager_scenario);    
}

const deploy_and_create_community = async () => {
  switch(next_community_scenario){
    case 1:
      console.log("##### deploy & create community call test is started.");
      await deployCommunity(deploy_and_create_community,10,"TestCommunity1","This community is for test.");
      break;
    case 2:
      await deployCommunitySubToken(deploy_and_create_community,"SubToken","SBT",18, communityContractAddress, 
        communityTokenContractAddress,proposalManagerContractAddressArray[1]);
      break;
    case 3:
      await deployProposalManager(deploy_and_create_community);
      break;
    case 4:
      await deployUpdateMemberManager(deploy_and_create_community,communityContractAddress);
      break;
    case 5:
      await deployElectionManager(deploy_and_create_community);
      break;
    case 6:
      await deployApplicationCore(deploy_and_create_community,memberManagerContractAddressArray[contractAddressIndex],proposalManagerContractAddressArray[contractAddressIndex],electionManagerContractAddressArray[contractAddressIndex]);
      break;
    case 7:
      await callConfigurePreInstallMemberManager(deploy_and_create_community, applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    case 8:
      await callConfigurePreInstallProposalManager(deploy_and_create_community, applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    case 9:
      await callConfigurePreInstallElectionManager(deploy_and_create_community, applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    case 10:
      await doAfterDeployTest(applicaitonCoreContractAddressArray[contractAddressIndex]);
      const parameter_string = "2$1$Add Bob$1$I propose to add Bob as a member$1$This is a test$1$https://github.com/realtakahashi/dao_oriented_protocol$1$" +
        memberManagerContractAddressArray[contractAddressIndex] +
        "$1$add_member$1$Bob$2$ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR";      
      await createProposal(deploy_and_create_community,proposalManagerContractAddressArray[contractAddressIndex], applicaitonCoreContractAddressArray[contractAddressIndex], parameter_string);
      break;
    case 11:
      await checkProposalList(1,"Add Bob", applicaitonCoreContractAddressArray[contractAddressIndex]);
      await createElection(deploy_and_create_community,"0",electionManagerContractAddressArray[contractAddressIndex], applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    case 12:
      await voteForProposal(deploy_and_create_community, "0", "yes", electionManagerContractAddressArray[contractAddressIndex], applicaitonCoreContractAddressArray[contractAddressIndex]);      
      break;
    case 13:
      await endElection(deploy_and_create_community, "0", electionManagerContractAddressArray[contractAddressIndex], applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    case 14:
      await executeProposal(deploy_and_create_community, "0",proposalManagerContractAddressArray[contractAddressIndex], applicaitonCoreContractAddressArray[contractAddressIndex]);
      break;
    case 15:
      await checkMember(2,"Bob", applicaitonCoreContractAddressArray[contractAddressIndex]);
      const param1 = "2$1$Suggestion to install community$1$I suggest to install community which I have implemented$1$https://github.com/realtakahashi/dao_oriented_protocol$1$This is test$1$"
      + applicaitonCoreContractAddressArray[1]
      + "$1$install_software$1$Community$2$Community$2$description_community$2$"
      + communityContractAddress;
      await createProposal(deploy_and_create_community,proposalManagerContractAddressArray[1],applicaitonCoreContractAddressArray[1], param1);
      break;
    case 16:
      await checkProposalList(2,"Suggestion to install community", applicaitonCoreContractAddressArray[1]);
      await createElection(deploy_and_create_community,"1",electionManagerContractAddressArray[1],applicaitonCoreContractAddressArray[1]);
      break;
    case 17:
      await voteForProposal(deploy_and_create_community, "1", "yes", electionManagerContractAddressArray[1],applicaitonCoreContractAddressArray[1]);
      break;
    case 18:
      deployer = keyring.addFromUri("//Bob");
      await voteForProposal(deploy_and_create_community, "1", "yes", electionManagerContractAddressArray[1],applicaitonCoreContractAddressArray[1]);
      break;
    case 19:
      deployer = keyring.addFromUri("//Alice");
      await endElection(deploy_and_create_community, "1", electionManagerContractAddressArray[1],applicaitonCoreContractAddressArray[1]);
      break;
    case 20:
      await installSoftware(deploy_and_create_community,"1",applicaitonCoreContractAddressArray[1]);
      break;
    case 21:
      await checkSoftwareList(1, "Community", communityContractAddress,applicaitonCoreContractAddressArray[1]);
      const param2 = "2$1$Suggestion to install community_sub_token$1$I suggest to install community_sub_token which I have implemented$1$https://github.com/realtakahashi/dao_oriented_protocol$1$This is test$1$"
      + applicaitonCoreContractAddressArray[1]
      + "$1$install_software$1$CommunitySubToken$2$CommunitySubToken$2$description_community_sub_token$2$"
      + communitySubTokenContractAddress;
      await createProposal(deploy_and_create_community,proposalManagerContractAddressArray[1],applicaitonCoreContractAddressArray[1], param2);
      break;
    case 22:
      await checkProposalList(3,"Suggestion to install community_sub_token", applicaitonCoreContractAddressArray[1]);
      await createElection(deploy_and_create_community,"2",electionManagerContractAddressArray[1],applicaitonCoreContractAddressArray[1]);
      break;
    case 23:
      await voteForProposal(deploy_and_create_community, "2", "yes", electionManagerContractAddressArray[1],applicaitonCoreContractAddressArray[1]);
      break;
    case 24:
      deployer = keyring.addFromUri("//Bob");
      await voteForProposal(deploy_and_create_community, "2", "yes", electionManagerContractAddressArray[1],applicaitonCoreContractAddressArray[1]);
      break;
    case 25:
      deployer = keyring.addFromUri("//Alice");
      await endElection(deploy_and_create_community, "2", electionManagerContractAddressArray[1],applicaitonCoreContractAddressArray[1]);
      break;
    case 26:
      await installSoftware(deploy_and_create_community,"2",applicaitonCoreContractAddressArray[1]);
      break;
    case 27:
      await checkSoftwareList(2, "CommunitySubToken", communitySubTokenContractAddress,applicaitonCoreContractAddressArray[1]);
      await configureCommunityCore(deploy_and_create_community,memberManagerContractAddressArray[1],proposalManagerContractAddressArray[1],
        communityListManagerContractAddress,communitySubTokenContractAddress,communityContractAddress);
      break;
    case 28:
        await communityBusinessLogicTest();
    default:
      // api.disconnect();
      // console.log("####### Test End.");
      break;
  }
  next_community_scenario++;
  console.log("# next_community_scenario is:",next_community_scenario);  
}

const communityBusinessLogicTest = async () => {
  switch(next_community_business_logic_scenario) {
    case 1:
      const param1 = "";  
      await callApplicationCoreInfterface(communityBusinessLogicTest,communityContractAddress,"propose_adding_community_list",
        param1,applicaitonCoreContractAddressArray[1]);
      break;
    case 2:
      await checkRequestListToAddCommunityList(1,communityContractAddress,communityListManagerContractAddress);
      const param2 = "2$1$Suggestion to add community$1$I suggest to add community which I have implemented$1$https://github.com/realtakahashi/dao_oriented_protocol$1$This is test$1$"
        + communityListManagerContractAddress
        + "$1$add_community$1$0";
      await createProposal(communityBusinessLogicTest,proposalManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0], param2);  
      break;
    case 3:
      await checkProposalList(4,"Suggestion to add community", applicaitonCoreContractAddressArray[0]);
      await createElection(communityBusinessLogicTest,"3",electionManagerContractAddressArray[0], applicaitonCoreContractAddressArray[0]);
      break;
    case 4:
      await voteForProposal(communityBusinessLogicTest, "3", "yes", electionManagerContractAddressArray[0], applicaitonCoreContractAddressArray[0]);      
      break;
    case 5:
      deployer = keyring.addFromUri("//Bob");
      await voteForProposal(communityBusinessLogicTest, "3", "yes", electionManagerContractAddressArray[0], applicaitonCoreContractAddressArray[0]);      
      break;
    case 6:
      deployer = keyring.addFromUri("//Alice");
      await endElection(communityBusinessLogicTest, "3", electionManagerContractAddressArray[0], applicaitonCoreContractAddressArray[0]);
      break;
    case 7:
      await executeProposal(communityBusinessLogicTest, "3",proposalManagerContractAddressArray[0], applicaitonCoreContractAddressArray[0]);
      break;
    case 8:
      await checkCommunityList(1,communityContractAddress,communityListManagerContractAddress);
      const param3 = "2$1$Suggestion to reward community token$1$I suggest to reward$1$https://github.com/realtakahashi/dao_oriented_protocol$1$This is test$1$"
        + communityListManagerContractAddress
        + "$1$distribution_of_rewards4communities$1$"
        + communityContractAddress + "$3$2222";
      await createProposal(communityBusinessLogicTest,proposalManagerContractAddressArray[0],applicaitonCoreContractAddressArray[0], param3);  
      break;
    case 9:
      await checkProposalList(5,"Suggestion to reward community token", applicaitonCoreContractAddressArray[0]);
      await createElection(communityBusinessLogicTest,"4",electionManagerContractAddressArray[0], applicaitonCoreContractAddressArray[0]);
      break;
    case 10:
      await voteForProposal(communityBusinessLogicTest, "4", "yes", electionManagerContractAddressArray[0], applicaitonCoreContractAddressArray[0]);      
      break;
    case 11:
      deployer = keyring.addFromUri("//Bob");
      await voteForProposal(communityBusinessLogicTest, "4", "yes", electionManagerContractAddressArray[0], applicaitonCoreContractAddressArray[0]);      
      break;
    case 12:
      deployer = keyring.addFromUri("//Alice");
      await endElection(communityBusinessLogicTest, "4", electionManagerContractAddressArray[0], applicaitonCoreContractAddressArray[0]);
      break;
    case 13:
      await executeProposal(communityBusinessLogicTest, "4",proposalManagerContractAddressArray[0], applicaitonCoreContractAddressArray[0]);
      break;
    case 14:
      await checkCommunityCoreBalance(2222,communityContractAddress);
    case 15:
      //community_token_rewards_psp22_4communities
      break;
    case 16:
      // community_sub_token__rewards_psp22_individials
      break;
    case 17:
      // community_sub_token__exchange_2_community_token
      break;
    case 18:
      // community_core_submit_contribution
    default:
      api.disconnect();
      break;
  }
  next_community_business_logic_scenario++;
  console.log("# next_community_business_logic_scenario is:",next_community_business_logic_scenario);
}

/// query functions
const checkCommunityCoreBalance = async (targetBalance:number, communityCoreAddress:string) => {
  console.log("checkCommunityCoreBalance Start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    communityCoreAbi,
    communityCoreAddress,
  );
  const { gasConsumed, result, output } = await contract.query.getCommunityBalance(
    deployer.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
  );
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response = output.toHuman().Ok;
    console.log("response: ",response);
    let numResult:number = Number(response.replace(/,/g,''));
    console.log("numResult: ",numResult);
    assert.equal(numResult,targetBalance);
    console.log("checkCommunityCoreBalance End");
  }
}

const checkCommunityList = async (targetCount:number, targetContractAddress:string, communityListManagerAddress:string) => {
  console.log("checkCommunityList Start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    communityListManagerAbi,
    communityListManagerAddress
  );
  const { gasConsumed, result, output } = await contract.query.getCommmunityList(
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
    // console.log("json_data: ",json_data);
    assert.equal(json_data.length,targetCount);
    assert.equal(json_data[targetCount-1].contractAddress,targetContractAddress);
    console.log("checkCommunityList End");
  }
}

const checkRequestListToAddCommunityList = async (targetCount:number, targetContractAddress:string, communityListManagerAddress:string) => {
  console.log("checkRequestListToAddCommunityList Start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    communityListManagerAbi,
    communityListManagerAddress
  );
  const { gasConsumed, result, output } = await contract.query.getRequestList4adding(
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
    assert.equal(json_data.length,targetCount);
    assert.equal(json_data[targetCount-1].contractAddress,targetContractAddress);
    console.log("checkRequestListToAddCommunityList End");
  }
}

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

const checkMember =async (memberCount:number, addedMemberName:string, applicaitonCoreAddress:string) => {
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
const transferNativeToken = async (callBack:()=>void) => {
  console.log("transferNativeToken start");
  // transfer tokens
  const transfer = api.tx.balances.transfer(communityListManagerContractAddress, 12345);
  //@ts-ignore
  const unsub = await transfer.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("### Transaction is failure.");
      }
      unsub();
      console.log("transferNativeToken end");
      callBack();
    }
  });
}

const callApplicationCoreInfterface = async (
  callBack: () => void,
  targetContractAddress:string,
  targetFunctionString:string,
  parameter:string,
  applicationCoreContractAddress:string,
) => {
  console.log(targetFunctionString + " start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );
  
  const { output,gasRequired } = await contract.query.executeInterface(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    targetContractAddress,
    targetFunctionString,
    parameter
  );

  //@ts-ignore
  if (output?.toHuman()?.Ok.Err != undefined) {
    //@ts-ignore
    console.log("###### Err Info is: ", output?.toHuman()?.Ok.Err);
    //return;
  }

  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired },
    targetContractAddress,
    targetFunctionString,
    parameter
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("### Transaction is failure.");
      }
      unsub();
      console.log(targetFunctionString + " end");
      callBack();
    }
  });
}

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

const configureCommunityCore = async (
  callBack:()=>void,
  updateMemberManagerAddress:string,
  proposalManagerAddress:string,
  communityListManagerAddress:string,
  communitySubTokenAddress:string,
  communityCoreAddress:string
) => {
  console.log("configureCommunityCore start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    communityCoreAbi,
    communityCoreAddress
  );
  const { gasRequired } = await contract.query.setManagerAddresses(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    updateMemberManagerAddress,
    proposalManagerAddress,
    communityListManagerAddress,
    communitySubTokenAddress
  );
  const tx = await contract.tx.setManagerAddresses(
    {
    value: 0,
    gasLimit: gasRequired,
    },
    updateMemberManagerAddress,
    proposalManagerAddress,
    communityListManagerAddress,
    communitySubTokenAddress
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("Transaction is failure.");
      }
      unsub();
      console.log("configureCommunityCore end");
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
const deployCommunitySubToken = async (
  callBack:()=>void, 
  name: string,
  symbol: string,
  decimal:number,
  communityCoreAddress:string,
  communityTokenAddress:string, 
  proposalManagerAddress:string
) => {
  console.log("Start deployCommunitySubToken");

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
        console.log("End deployCommunitySubToken:address:",communitySubTokenContractAddress);
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
  console.log("Start deployCommunity");

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
        console.log("End deployCommunity:address:",communityContractAddress);
        callBack();
      }
    }
  ); 
}

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

const deployUpdateMemberManager = async (callBack: () => void, communityCoreAddress:string) => {
  console.log("Start deployUpdateMemberManager");

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
            memberManagerContractAddressArray.push(contract.address.toString());
        }
        unsub();
        console.log("End deployUpdateMemberManager address:",memberManagerContractAddressArray[memberManagerContractAddressArray.length-1]);
        callBack();
      }
    }
  );
};

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
        console.log("End deployMemberManager address: ", memberManagerContractAddressArray[memberManagerContractAddressArray.length-1]);
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
        console.log("End deployProposalManager address: ",proposalManagerContractAddressArray[proposalManagerContractAddressArray.length-1]);
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
        console.log("End deployElectionManager address: ", electionManagerContractAddressArray[electionManagerContractAddressArray.length-1]);
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
        console.log("End deployApplicationCore address: ",applicaitonCoreContractAddressArray[applicaitonCoreContractAddressArray.length-1]);
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

  await community_list_manager_test();
  // await deploy_and_create_community_list_manager()
  // await base_dao_creating_test();
  // await deploy_and_create_community();
};

const main = () => {
  console.log("Test Start");
  executeAllTest();
};

main();
