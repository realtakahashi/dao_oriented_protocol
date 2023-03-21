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
    pub title: String,
    pub outline: String,
    pub description: String,
    pub github_url: String,
    pub target_contract: String,
    pub target_function: String,
    pub parameters: String,
    // status: ProposalStatus,
}
