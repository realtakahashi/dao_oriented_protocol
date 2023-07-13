import { useContext, useEffect, useState } from 'react';
import { CommunityInfo } from '../types/CommunityType';
import { AppContext } from '../pages/_app';
import { get_selected_address } from '../api/accountInfoUtils';
import { getCommunityList } from '../api/community';
import { CommunityParts } from './CommunityParts';

export interface CommunitySearchProps {
  searchWord: string;
}

const CommunitySearchResult = (communitySearchProps: CommunitySearchProps) => {
  const { api } = useContext(AppContext);
  const [communityList, setCommunityList] = useState<Array<CommunityInfo>>();
  const callSearch = async () => {
    const selectedAddress = get_selected_address();
    const cList = await getCommunityList(api, selectedAddress, communitySearchProps.searchWord);
    setCommunityList(cList);
    console.log('community list: ', cList);
  };
  useEffect(() => {
    callSearch();
  }, []);

  return (
    <>
      <div className='p-2 grid grid-col-2 mx-1 lg:-mx-4'>
        {typeof communityList !== 'undefined'
          ? communityList.map((community) => {
              return (
                <>
                  <div className='w-1/6 col-span-1'></div>
                  <div key={community.id}>
                    <div className='col-span-2 text-left p-20 break-words whitespace-pre-wrap w-5/6 rounded overflow-hidden shadow-lg bg-black '>
                      <CommunityParts targetCommunity={community}></CommunityParts>
                    </div>
                  </div>
                </>
              );
            })
          : ''}
      </div>
    </>
  );
};

export default CommunitySearchResult;
