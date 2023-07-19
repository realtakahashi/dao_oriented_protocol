import { useContext, useState } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { ContributionList } from '../../../components/ContibutionList';
import SubmitProposal from '../../../components/SubmitContribution';
import { checkContribution } from '../../../api/community';
import { AppContext } from '../../_app';
import { get_account_info, get_selected_address } from '../../../api/accountInfoUtils';
import SubmitContribution from '../../../components/SubmitContribution';

const Contributions = () => {
  const [showListButton, setShowListButton] = useState(false);
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const [showList, setShowList] = useState(true);
  const [showSubmitScreen, setShowSubmitScreen] = useState(false);
  const [showAllList, setShowAllList] = useState(true);
  const [applicationCoreContractAddress, setapplicationCoreContractAddress] = useState('');
  const { api } = useContext(AppContext);

  const setUrl = () => {
    let address = sessionStorage.getItem('ApplicaitonCoreContractAddress') ?? '';
    setapplicationCoreContractAddress(address);
  };

  const _manageShowing = (
    _listButton: boolean,
    _submitButton: boolean,
    _list: boolean,
    _submitScreen: boolean,
    _showAllList: boolean,
  ) => {
    setShowListButton(_listButton);
    setShowSubmitButton(_submitButton);
    setShowList(_list);
    setShowSubmitScreen(_submitScreen);
    setShowAllList(_showAllList);
  };

  const _checkContribution = async () => {
    const selectedAccount = await get_account_info(get_selected_address());
    const applicationCoreAddress = sessionStorage.getItem("ApplicaitonCoreContractAddress")??"";
    const communityCoreAddress = sessionStorage.getItem("CommunityCoreContractAddress")??"";
    await checkContribution(api,selectedAccount,applicationCoreAddress,communityCoreAddress);
  };

  useEffect(() => {
    setUrl();
  }, []);

  return (
    <>
      <div className='bg-black flex flex-col min-h-screen'>
        <div className='m-5 text-25px text-left text-white underline leading-none tracking-tight'>
          <Link href={'/' + applicationCoreContractAddress + '/start'}>Back to Top</Link>
        </div>
        {/* </div>
      <div className="bg-black flex flex-col min-h-screen"> */}
        <div className='flex justify-center'>
          {showListButton == true && (
            <button
              className='m-2 px-4 py-2  border-black border-2 bg-white rounded text-black  hover:bg-green-200'
              onClick={() => _manageShowing(false, true, true, false, false)}
            >
              Back To List
            </button>
          )}
          {showSubmitButton == true && (
            <div>
              <button
                className='m-2 px-4 py-2  border-black border-2 bg-white rounded text-black  hover:border-blue-500'
                onClick={() => _manageShowing(true, false, false, true, false)}
              >
                + Submit New
              </button>
              <button
                className='m-2 px-4 py-2  border-black border-2 bg-white rounded text-black  hover:border-blue-500'
                onClick={() => _checkContribution()}
              >
                Check Contribution
              </button>
            </div>
          )}
        </div>
        <div>
          {showList == true && (
            <ContributionList
              setShowSubmmitButton={setShowSubmitButton}
              setShowList={setShowList}
              setShowListButton={setShowListButton}
              setShowSubmitScreen={setShowSubmitScreen}
              showAllList={showAllList}
            />
          )}
          {showSubmitScreen == true && <SubmitContribution></SubmitContribution>}
        </div>
      </div>
    </>
  );
};

export default Contributions;
