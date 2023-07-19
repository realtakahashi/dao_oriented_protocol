import Link from 'next/link';
import { ContributionInfo } from '../types/ContributionType';

export interface ContributionProps {
  targetContribution: ContributionInfo;
}

export const ContributionParts = (props: ContributionProps) => {
  return (
    <div className='px-6 py-4'>
      <p className='p-1 text-white text-base'>Id: {props.targetContribution.id}</p>
      <p className='p-1 text-white text-base'>Contents: {props.targetContribution.contents}</p>
      <p className='p-1 text-white text-base'>Contributor: {props.targetContribution.contributor}</p>
      <p className='p-1 text-white text-base'>Block Time: {props.targetContribution.blocktime}</p>
    </div>
  );
};
