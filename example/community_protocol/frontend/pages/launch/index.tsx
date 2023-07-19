import { useEffect, useState, useContext } from 'react';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { checkAndCreateApiObject } from '../../api/apiUtils';
import { AppContext } from '../../pages/_app';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface AccountInfo {
  string2display: string;
  account: InjectedAccountWithMeta;
  address: string;
}

const SelectAccount = () => {
  const [showStartLink, setShowStartLink] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const { api, setApi } = useContext(AppContext);
  const [address, setAddress] = useState('');
  // const router = useRouter();

  const extensionSetup = async () => {
    const { web3Accounts, web3Enable } = await import('@polkadot/extension-dapp');
    const extensions = await web3Enable('Polk4NET');
    console.log('index: extensions:', extensions);
    if (extensions.length === 0) {
      return;
    }
    const account = await web3Accounts();

    let account_info_array: Array<AccountInfo> = [];
    const empty_data: AccountInfo = {
      string2display: '',
      address: '',
      account: { address: '', meta: { genesisHash: '', name: '', source: '' } },
    };
    account_info_array.push(empty_data);
    for (let i = 0; i < account.length; i++) {
      let account_info: AccountInfo = {
        string2display: account[i].address + ' [' + account[i].meta.name + ']',
        account: account[i],
        address: account[i].address,
      };
      account_info_array.push(account_info);
    }
    setAccounts(account_info_array);
  };

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
  };

  const _onSubmit = async () => {
    await checkAndCreateApiObject(api, setApi);
    if (selectedAccount == '') {
      alert('Please select valid account.');
      return;
    }
    sessionStorage.setItem('selected_account_address', selectedAccount);
    setShowStartLink(true);
    // router.push("start/index.tsx");
  };

  const _onConnectWallet = async () => {
    console.log('index: _onConnectWallet');
    await extensionSetup();
  };

  return (
    <>
      <div className='bg-black min-h-screen'>
        <div className='text-center text-100px font-extrabold leading-none tracking-tight'>
          <div className='p-3'></div>
          {/* <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-blue-500">
            Example:DAO Flip By DAO Oriented Protocol
          </span> */}
        </div>
        <div className='m-10'></div>
        <div className='flex justify-center p-3'>
          <button
            className='px-4 py-2 border-double border-white border-2 bg-black rounded text-30px text-white  hover:border-blue-500'
            onClick={_onConnectWallet}
          >
            Connect Wallet
          </button>
        </div>

        {/* <form className="" onSubmit={_onSubmit}> */}

        <div className='flex justify-center px-2 py-3 text-white text-30px'>
          Select your account:{' '}
        </div>
        <div className='flex justify-center px-2 py-3 text-black'>
          <select
            className='font-bold'
            name='Status'
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            {accounts.map((account_info) => (
              <option key={account_info.address} value={account_info.address}>
                {account_info.string2display}
              </option>
            ))}{' '}
          </select>
        </div>

        <div className='flex justify-center p-3'>
          <button
            className='px-4 py-2 border-double border-white border-2 bg-black rounded text-20px text-white  hover:border-blue-500'
            onClick={_onSubmit}
          >
            Ok
          </button>
        </div>

        <div className='p-5'></div>

        <div className='m-10'></div>

        {showStartLink == true && (
          <>
            <div className='py-5 text-30px text-center text-white'>Input Your Application Core Contract Address</div>
            <div className='text-center'>
              <input
                className='appearance-none rounded w-2/3 py-2 px-4 text-gray-700 
                      leading-tight focus:outline-none focus:bg-white focus:border-blue-200'
                name='address'
                type='text'
                onChange={onChangeInput}
              ></input>
            </div>
            <div className='text-center'>
              <button className='m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-blue-500'>
                {/* <Link href="/start">Start</Link> */}
                <Link href={address + '/start'}>Start</Link>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SelectAccount;
