import { useState, useContext } from "react";
import { AppContext } from "../pages/_app";
import {
  get_account_info,
  get_selected_address,
} from "../api/accountInfoUtils";
import { submitProposal } from "../api/proposal";
import { ContributionInfo } from "../types/ContributionType";
import { submitContribution } from "../api/community";

const SubmitProposal = () => {
  const [addContributionInfo, setAddContributionInfo] = useState<ContributionInfo>({
    id: "0",
    contents: "",
    contributor: "",
    blocktime: ""
  });
  const { api } = useContext(AppContext);


  const onChangeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAddContributionInfo({
      ...addContributionInfo,
      [event.target.name]: event.target.value,
    });
  };

  const _onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log("## _onSubmit 1");
    event.preventDefault();
    const applicationCoreAddress = sessionStorage.getItem("ApplicaitonCoreContractAddress")??"";
    const communityCoreAddress = sessionStorage.getItem("CommunityCoreContractAddress")??"";
    const selectedAccount = await get_account_info(get_selected_address());
    await submitContribution(api, selectedAccount,addContributionInfo,applicationCoreAddress, communityCoreAddress);
  };

  return (
    <>
      <div className="p-7"></div>
      <form className="" onSubmit={_onSubmit}>
        <div className="m-5 flex justify-center text-24px text-blue-200">
          <label>Contribution Information</label>
        </div>
        <div className="p-2 m-5 flex flex-col">
          <table>
            <tr>
              <th className="flex justify-end px-4 py-2 text-white">
                Contents:
              </th>
              <td className=" px-4 py-2">
                <textarea
                  className="appearance-none border-2 border-gray-200 rounded w-2/3 py-2 px-4 text-gray-700 
                        leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  name="contents"
                  rows={10}
                  onInput={onChangeText}
                ></textarea>
              </td>
            </tr>
          </table>
        </div>

        <div className="flex justify-center">
          <button
            className="m-2 px-4 py-2  border-black border-2 bg-blue-200 rounded text-black  hover:bg-green-200"
            onClick={() => _onSubmit}
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
};

export default SubmitProposal;
