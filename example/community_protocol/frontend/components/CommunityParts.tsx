import Link from 'next/link';
import { CommunityInfo } from '../types/CommunityType';

export interface CommunityProps {
  targetCommunity: CommunityInfo;
}

export const CommunityParts = (communityProps: CommunityProps) => {
  return (
    
    <div className='px-6 py-4'>
      <Link href={`/${communityProps.targetCommunity.application_core_contract_address}/start`}>
        <div className='text-40px underline text-blue-300'>{communityProps.targetCommunity.name}</div>
      </Link>
      <p className='px-5 text-20px text-white'>{communityProps.targetCommunity.contents}</p>
    </div>
  );
};
