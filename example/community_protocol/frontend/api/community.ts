import { ContractPromise } from '@polkadot/api-contract';
import { CommunityInfo } from '../types/CommunityType';
import CommunityListManagerAbi from '../contract_abi/community_list_manager.json';
import CommunityAbi from '../contract_abi/community_core.json';
import { getGasLimitForNotDeploy } from './apiUtils';
import { MemberInfo } from '../types/MemberTypes';

export const getCommunityList = async (
  api: any,
  peformanceAddress: string,
  searchWord: string,
): Promise<Array<CommunityInfo>> => {
  const communityListManagerAddress =
    String(process.env.NEXT_PUBLIC_COMMUNITY_LIST_MANAGER_CONTRACT_ADDRESS) ?? '';
  let response: CommunityInfo[] = [];
  const contract = new ContractPromise(api, CommunityListManagerAbi, communityListManagerAddress);
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const { output } = await contract.query.getCommunityList(peformanceAddress, {
    value: 0,
    gasLimit: gasLimit,
  });
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    for (let i = 0; i < json_data.length; i++) {
      if (searchWord != '' && json_data[i].contents.includes(searchWord) == false) {
        continue;
      }
      let item: CommunityInfo = {
        id: json_data[i].id,
        name: json_data[i].name,
        contract_address: json_data[i].contractAddress,
        contents: json_data[i].contents,
        community_sub_token_contract_address: json_data[i].communitySubTokenContractAddress,
        application_core_contract_address: json_data[i].applicationCoreContractAddress,
      };
      response.push(item);
    }
  }
  return response;
};

export const getCommunityInfo = async (
  api: any,
  peformanceAddress: string,
): Promise<CommunityInfo> => {
  const communityAddress = sessionStorage.getItem('CommunityCoreContractAddress') ?? '';
  console.log("## communityAddress: ",communityAddress);
  let response: CommunityInfo = {
      id: '',
      name: '',
      contract_address: '',
      contents: '',
      community_sub_token_contract_address: '',
      application_core_contract_address: ''
  }
  const contract = new ContractPromise(api, CommunityAbi, communityAddress);
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const { output } = await contract.query.getCommunityInfo(peformanceAddress, {
    value: 0,
    gasLimit: gasLimit,
  });
  console.log("## output: ",output);
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    console.log("## response_json: ",response_json);
    let item: CommunityInfo = {
      id: "", 
      name: response_json.name,
      contract_address: response_json.contractAddress,
      contents: response_json.contents,
      community_sub_token_contract_address: response_json.communitySubTokenContractAddress,
      application_core_contract_address: response_json.applicationCoreContractAddress,
    };
    response = item;
  }

  return response;
};
