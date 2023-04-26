use ink::storage::traits::StorageLayout;
use ink::prelude::string::{String};
use openbrush::traits::AccountId;

#[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
#[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
pub struct MemberInfo {
    pub id: u128,
    pub name: String,
    pub address: AccountId,
}

#[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
#[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
pub struct ProposalInfo {
    pub id: u128,
    pub kind: ProposalKind,
    pub title: String,
    pub outline: String,
    pub description: String,
    pub github_url: String,
    pub target_contract: AccountId,
    pub target_function: String,
    pub parameters: String,
    pub status: ProposalStatus,
}

#[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
#[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
pub enum ProposalKind {
    /// initial value
    None,
    /// Reset Election Commisioner
    ResetElectionCommisioner,
    /// Other
    Other,
}

    #[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub enum ProposalStatus {
        /// initial value
        None,
        /// proposed
        Proposed,
        /// voting
        Voting,
        /// Finish Voting
        FinishVoting,
        /// executed
        Executed,
        /// denied
        Denied,
    }

    #[derive(Default, Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub struct ElectionInfo {
        id: u128,
        proposal_id: u128,
        minimum_voter_turnout_percentage: u8,
        passing_percentage: u8,
        number_of_votes: u128,
        count_of_yes: u128,
        count_of_no: u128,
        list_of_voters: Vec<AccountId>,
        list_of_electoral_commissioner: Vec<AccountId>,
        is_passed: bool,
    }
