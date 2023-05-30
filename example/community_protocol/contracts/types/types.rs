#![cfg_attr(not(feature = "std"), no_std)]
pub mod types {
    use ink::storage::traits::StorageLayout;
    use ink::prelude::string::{String};
    use ink::prelude::vec::Vec;
    use openbrush::traits::AccountId;
    use openbrush::traits::Balance;

    #[derive(Default, Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub struct CommunityInfoWithId {
        pub id: u128,
        pub name:String,
        pub contract_address:Option<AccountId>,
        pub contents:String,
        pub community_sub_token_contract_address:Option<AccountId>,
    }

    #[derive( Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub struct RewardInfo {
        pub address:AccountId,
        pub amount:Balance,
    }

    #[derive( Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub struct RewardInfoType2 {
        pub address:AccountId,
        pub amount:String,
    }

}