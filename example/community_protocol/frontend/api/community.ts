import { ContractPromise } from '@polkadot/api-contract';
import { CommunityInfo } from '../types/CommunityType';
import CommunityListManagerAbi from '../contract_abi/community_list_manager.json';
import CommunityAbi from '../contract_abi/community_core.json';
import CommunitySubTokenAbi from '../contract_abi/community_sub_token.json';
import CommunityTokenAbi from '../contract_abi/community_token.json';
import { checkEventsAndInculueError, getGasLimitForNotDeploy } from './apiUtils';
import { ContributionInfo } from '../types/ContributionType';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import ApplicationCoreAbi from '../contract_abi/application_core.json';

const storageDepositLimit = null;

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
  console.log('## communityAddress: ', communityAddress);
  let response: CommunityInfo = {
    id: '',
    name: '',
    contract_address: '',
    contents: '',
    community_sub_token_contract_address: '',
    application_core_contract_address: '',
  };
  const contract = new ContractPromise(api, CommunityAbi, communityAddress);
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const { output } = await contract.query.getCommunityInfo(peformanceAddress, {
    value: 0,
    gasLimit: gasLimit,
  });
  console.log('## output: ', output);
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    console.log('## response_json: ', response_json);
    let item: CommunityInfo = {
      id: '',
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

export const submitContribution = async (
  api: any,
  performingAccount: InjectedAccountWithMeta,
  contributionInfo: ContributionInfo,
  applicationCoreAddress: string,
  communityCoreAddress: string,
) => {
  const { web3FromSource } = await import('@polkadot/extension-dapp');

  const contract = new ContractPromise(api, ApplicationCoreAbi, applicationCoreAddress);
  const gasLimit: any = getGasLimitForNotDeploy(api);
  const injector = await web3FromSource(performingAccount.meta.source);

  const { output, gasRequired } = await contract.query.executeInterface(
    performingAccount.address,
    { value: 0, gasLimit: gasLimit, storageDepositLimit },
    communityCoreAddress,
    'submit_contribution',
    contributionInfo.contents,
  );

  //@ts-ignore
  if (output?.toHuman()?.Ok.Err != undefined) {
    // @ts-ignore
    const okErr = output?.toHuman()?.Ok.Err;
    if (okErr.Custom != undefined) {
      alert('Error is occured: ' + okErr.Custom);
    } else {
      alert('Error is occured: ' + okErr.toHuman());
    }
    return;
  }

  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired, storageDepositLimit },
    communityCoreAddress,
    'submit_contribution',
    contributionInfo.contents,
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      ({ status, events = [] }) => {
        if (status.isFinalized) {
          if (checkEventsAndInculueError(events)) {
            alert('Transaction is failure.');
          }
          unsub();
        }
      },
    );
  }
};

export const checkContribution = async (
  api: any,
  performingAccount: InjectedAccountWithMeta,
  applicationCoreAddress: string,
  communityCoreAddress: string,
) => {
  const { web3FromSource } = await import('@polkadot/extension-dapp');

  const contract = new ContractPromise(api, ApplicationCoreAbi, applicationCoreAddress);
  const gasLimit: any = getGasLimitForNotDeploy(api);
  const injector = await web3FromSource(performingAccount.meta.source);

  const { output, gasRequired } = await contract.query.executeInterface(
    performingAccount.address,
    { value: 0, gasLimit: gasLimit, storageDepositLimit },
    communityCoreAddress,
    'check_contribution',
  );

  //@ts-ignore
  if (output?.toHuman()?.Ok.Err != undefined) {
    // @ts-ignore
    const okErr = output?.toHuman()?.Ok.Err;
    if (okErr.Custom != undefined) {
      alert('Error is occured: ' + okErr.Custom);
    } else {
      alert('Error is occured: ' + okErr.toHuman());
    }
    return;
  }

  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired, storageDepositLimit },
    communityCoreAddress,
    'check_contribution',
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      ({ status, events = [] }) => {
        if (status.isFinalized) {
          if (checkEventsAndInculueError(events)) {
            alert('Transaction is failure.');
          }
          unsub();
        }
      },
    );
  }
};

export const getContributionList = async (
  api: any,
  peformanceAddress: string,
  communityCoreAddress: string
) => {
  let response: ContributionInfo[] = [];
  const contract = new ContractPromise(api, CommunityAbi, communityCoreAddress);
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const { output } = await contract.query.getContributionList(peformanceAddress, {
    value: 0,
    gasLimit: gasLimit,
  });
  if (output !== undefined && output !== null) {
    console.log('getContributionList:output:', output?.toJSON());
    // @ts-ignore
    let response_json = output?.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    for (let i = 0; i < json_data.length; i++) {
      let item: ContributionInfo = {
        id: json_data[i].id,
        contributor: json_data[i].contributor,
        contents: json_data[i].contents,
        blocktime: json_data[i].blocktime,
      };
      response.push(item);
    }
  }
  return response;
};

export const getNativeBalance = async (api:any, targetAddress:string):Promise<string> => {
  let result = "";
  let account = await api.query.system.account(targetAddress);
  const tmp = account.data.free.toHuman();
  result = tmp.replace(/,/g,'');
  return result;
}

export const getCommunitySubTokenBalance = async (
  api: any,
  peformanceAddress: string,
  communitySubTokenAddress: string,
  targetAddress: string
):Promise<string> => {
  let response = "";
  const contract = new ContractPromise(api, CommunitySubTokenAbi, communitySubTokenAddress);
  const gasLimit: any = getGasLimitForNotDeploy(api);

  console.log("## getCommunitySubTokenBalance:targetAddress",targetAddress);
  const { output } = await contract.query.balanceOf(
    peformanceAddress, 
    {
      value: 0,
      gasLimit: gasLimit,
    },
    targetAddress
  );
  if (output !== undefined && output !== null) {
    console.log('getCommunitySubTokenBalance:output:', output?.toJSON());
    // @ts-ignore
    let tmp = output.toHuman().Ok;
    response = tmp.replace(/,/g,'');

  }
  return response;
};

export const getCommunityTokenBalance = async (
  api: any,
  peformanceAddress: string,
  communityTokenAddress: string,
  targetAddress:string
):Promise<string> => {
  let response = "";
  const contract = new ContractPromise(api, CommunityTokenAbi, communityTokenAddress);
  const gasLimit: any = getGasLimitForNotDeploy(api);

  console.log("## getCommunityTokenBalance:targetAddress",targetAddress);
  const { output } = await contract.query.balanceOf(
    peformanceAddress, 
    {
      value: 0,
      gasLimit: gasLimit,
    },
    targetAddress
  );
  if (output !== undefined && output !== null) {
    console.log('getCommunityTokenBalance:output:', output?.toJSON());
    // @ts-ignore
    let tmp = output.toHuman().Ok;
    response = tmp.replace(/,/g,'');

  }
  return response;
};
