import Link from "next/link";
import { useContext, useState } from "react";
import { useEffect } from "react";
import { PROPOSAL_FINISHED, PROPOSAL_REJECTED, PROPOSAL_VOTING, ProposalInfo } from "../types/ProposalTypes";
import { AppContext } from "../pages/_app";
import { get_selected_address } from "../api/accountInfoUtils";
import { getProposalList } from "../api/proposal";
import ProposalParts from "./ProposalParts";
import ProposalDetails from "./ProposalDetails";
import { ContributionInfo } from "../types/ContributionType";
import { getContributionList } from "../api/community";
import { ContributionParts } from "./ContributionParts";

interface ProposalListProps {
  setShowSubmmitButton: (flg: boolean) => void;
  setShowListButton: (flg: boolean) => void;
  setShowList: (flg: boolean) => void;
  setShowSubmitScreen: (flg: boolean) => void;
  showAllList: boolean;
}

export const ContributionList = (props: ProposalListProps) => {
  const [contributionList, setContributionList] = useState<Array<ContributionInfo>>();
  const [showList, setShowList] = useState(true);
  const [showListButton, setShowListButton] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [targetContribution, setTargetContribution] = useState<ContributionInfo>({
    id: "0",
    contributor: "",
    contents: "",
    blocktime: "",
  });

  const _setShowAndSetTargetProposal = (
    _showList: boolean,
    _showDetails: boolean,
    _showListButton: boolean,
    _backToList: boolean,
    _targetContribution: ContributionInfo
  ) => {
    _setShow(
      _showList,
      _showDetails,
      _showListButton,
      _backToList
    );
    setTargetContribution(_targetContribution);
  };

  const _setShow = (
    _showList: boolean,
    _showDetails: boolean,
    _showListButton: boolean,
    _backToList: boolean
  ) => {
    setShowList(_showList);
    _getContiributionList();
    setShowListButton(_showListButton);
    setShowDetails(_showDetails);
    if (_backToList) {
      props.setShowSubmmitButton(true);
      props.setShowList(true);
      props.setShowListButton(false);
      props.setShowSubmitScreen(false);
    } else {
      props.setShowSubmmitButton(false);
    }
  };

  const {api} = useContext(AppContext);
  
  const _getContiributionList = async () => {
    const selectedAddress = get_selected_address();
    const communityAddress = sessionStorage.getItem('CommunityCoreContractAddress') ?? '';
    const result = await getContributionList(api, selectedAddress, communityAddress);
    setContributionList(result);
  };

  useEffect(() => {
    _getContiributionList();
  }, []);

  return (
    <>
      {showListButton == true && (
        <div className="flex justify-center">
          <button
            className="m-2 px-4 py-2  border-black border-2 bg-white rounded text-black  hover:border-blue-500"
            onClick={() => _setShow(true, false, false, true)}
          >
            Back To List
          </button>
        </div>
      )}
      <div className="p-2 flex flex-wrap justify-center mx-1 lg:-mx-4">
        {showList == true && (
          <>
            {typeof contributionList !== "undefined"
              ? contributionList.map((contribution) => {
                  return (
                    <div key={contribution.id}>
                        <div className="m-5  max-w-sm rounded overflow-hidden shadow-lg bg-black border-4 border-white">
                          <ContributionParts
                            targetContribution={contribution}
                          ></ContributionParts>
                        </div>
                    </div>
                  );
                })
              : ""}
          </>
        )}
      </div>
    </>
  );
};


