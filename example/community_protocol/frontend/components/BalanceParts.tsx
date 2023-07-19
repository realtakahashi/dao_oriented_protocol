import { useContext, useEffect, useState } from 'react';
import { get_selected_address } from '../api/accountInfoUtils';
import {
  getCommunitySubTokenBalance,
  getCommunityTokenBalance,
  getNativeBalance,
} from '../api/community';
import { AppContext } from '../pages/_app';

export interface BalanceProps {
//   communitySubTokenAddress: string;
//   communityTokenAddress: string;
  targetCommunityAddress: string;
}

export const BalanceParts = (propos: BalanceProps) => {
  const [indivialNative, setIndivialNative] = useState('');
  const [indivialSubToken, setIndivialSubToken] = useState('');
  const [indivialToken, setIndivialToken] = useState('');
  const [communityNative, setCommunityNative] = useState('');
  const [communitySubToken, setCommunitySubToken] = useState('');
  const [communityToken, setCommunityToken] = useState('');
  const { api } = useContext(AppContext);

  const getBalance = async () => {
    console.log("### getBalance: prpos.targetCommunityAddress:",propos.targetCommunityAddress);

    const communitySubTokenAddress = sessionStorage.getItem("CommunitySubTokenContractAddress")??"";
    const communityTokenAddress = sessionStorage.getItem("CommunityTokenContractAddress")??"";
    console.log("### CommunitySubTokenContractAddress:",communitySubTokenAddress);
    console.log("### CommunityTokenContractAddress:",communityTokenAddress);
    
    const selectedAddress = get_selected_address();
    const indiNative = await getNativeBalance(api, selectedAddress);
    const indiSubToken = await getCommunitySubTokenBalance(
      api,
      selectedAddress,
      communitySubTokenAddress,
      selectedAddress
    );
    const indiToken = await getCommunityTokenBalance(
      api,
      selectedAddress,
      communityTokenAddress,
      selectedAddress
    );
    const comNative = await getNativeBalance(api, propos.targetCommunityAddress);
    const comSubToken = await getCommunitySubTokenBalance(
      api,
      selectedAddress,
      communitySubTokenAddress,
      propos.targetCommunityAddress
    );
    const comToken = await getCommunityTokenBalance(
      api,
      selectedAddress,
      communityTokenAddress,
      propos.targetCommunityAddress
    );
    setIndivialNative(indiNative);
    setIndivialSubToken(indiSubToken);
    setIndivialToken(indiToken);
    setCommunityNative(comNative);
    setCommunitySubToken(comSubToken);
    setCommunityToken(comToken);
  };

  useEffect(() => {
    getBalance();
  }, []);

  return (
    <>
      <div className='px-6 py-4 text-center'>
        <div className='p-1 text-white'>
          <span>{'Native Token Balance(Community): ' + communityNative}</span>
          <span className='px-10'>{'Native Token Balance(individual): ' + indivialNative}</span>
        </div>
        <div className='p-1 text-white'>
          <span>{'Community Sub Token Balance(Community): ' + communitySubToken}</span>
          <span className='px-10'>{'Community Sub Token Balance(individual): ' + indivialSubToken}</span>
        </div>
        <div className='p-1 text-white'>
          <span>{'Community Token Balance(Community): ' + communityToken}</span>
          <span className='px-10'>{'Community Token Balance(individual): ' + indivialToken}</span>
        </div>
      </div>
    </>
  );
};
