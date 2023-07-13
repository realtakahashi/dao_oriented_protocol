import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import SelectAccount from "../../../components/SelectAccount";
import router from "next/router";
import { AppContext } from '../../../pages/_app';
import { get_selected_address } from "../../../api/accountInfoUtils";
import { getPreSoftwareList, getSoftwareList } from "../../../api/software";
import { SoftwareInfo } from "../../../types/SoftwareTypes";
import { getCommunityInfo } from "../../../api/community";
import { CommunityInfo } from "../../../types/CommunityType";

const Home = () => {
  const [showSelectAccount, setShowSelectAccount] = useState(false);
  const [applicationCoreContractAddress, setapplicationCoreContractAddress] = useState("");
  const { api } = useContext(AppContext);
  const [communityInfo, setCommunityInfo] = useState<CommunityInfo>({
    id: '',
    name: '',
    contract_address: '',
    contents: '',
    community_sub_token_contract_address: '',
    application_core_contract_address: ''
  });

  const checkSelectedAccount = () => {
    let address = sessionStorage.getItem("selected_account_address");
    console.log("## address: ",address);
    if (address == "" || address == null) {
      setShowSelectAccount(true);
    }
  };

  const getContractAddresses = async () => {
    const address = (String(router.query.address));
    console.log("## router address: ",address);
    setapplicationCoreContractAddress(address);
    const selectedAddress = get_selected_address();
    sessionStorage.setItem("ApplicaitonCoreContractAddress",address);
    let softwareList = await getPreSoftwareList(api, selectedAddress);
    console.log("## softwareList: ",softwareList);
    softwareList.forEach((software,i) => {
      switch (software.kind) {
        case "MemberManager":{
          sessionStorage.setItem("MemberManagerContractAddress",software.contractAddress);
          break;
        }
        case "ProposalManager":{
          sessionStorage.setItem("ProposalManagerContractAddress",software.contractAddress);
          break;
        }
        case "Election":{
          sessionStorage.setItem("ElectionContractAddress",software.contractAddress);
          break;
        }
        case "CommunityCore":{
          sessionStorage.setItem("CommunityCoreContractAddress",software.contractAddress);
          _getCommunityInfo();
          break;
        }
        default:
          break;
      }
    });
  }

  const _getCommunityInfo = async () => {
    const selectedAddress = get_selected_address();
    const info = await getCommunityInfo(api, selectedAddress);
    console.log("## communityInfo: ", info);
    setCommunityInfo(info);
  }

  useEffect(() => {
    checkSelectedAccount();
    getContractAddresses();
  }, []);

  return (
    <>
      <div className="bg-black flex flex-col min-h-screen">
        <div className="text-center text-100px font-extrabold leading-none tracking-tight">
          <div className="p-3"></div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-blue-500">
            {communityInfo.name}
          </span>
        </div>
        {/* {showSelectAccount ? (
          <>
            <SelectAccount
              setShowAccount={setShowSelectAccount}
            ></SelectAccount>
          </>
        ) : (
          <> */}
            <div className="p-1 text-center text-25px">
              <button className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500">
                <Link href={"../" + applicationCoreContractAddress + "/software"}>Softwares</Link>
              </button>
              <button className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500">
                <Link href={"../" + applicationCoreContractAddress + "/members"}>Members</Link>
              </button>
              <button className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500">
                <Link href={"../"+ applicationCoreContractAddress +"/proposals"}>Proposals</Link>
              </button>
              <button className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500">
                <Link href={"../" + applicationCoreContractAddress + "/elections"}>Result Of Elections</Link>
              </button>
            </div>
          {/* </>
        )} */}
      </div>
    </>
  );
};
export default Home;