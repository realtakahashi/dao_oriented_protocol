#![cfg_attr(not(feature = "std"), no_std)]

#[openbrush::contract]
mod dao_core {
    use openbrush::{contracts::ownable::*, modifiers, storage::Mapping, traits::Storage};
    use ink_storage::traits::{PackedLayout, SpreadLayout};
    use ink_prelude::string::{String};
    use ink_prelude::{vec,vec::Vec};

    #[derive(Debug, Clone, scale::Encode, scale::Decode, SpreadLayout, PackedLayout, PartialEq)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub struct SoftwareInfo {
        name: String,
        contract_address: AccountId,
        description: String,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {

    }

    pub type Result<T> = core::result::Result<T, Error>;

    #[ink(storage)]
    pub struct DaoCore {
        installed_software_list_with_address: Mapping<AccountId,SoftwareInfo>,
        installed_software_list_with_id: Mapping<u128, SoftwareInfo>,
        software_id: u128,
        proposal_address: AccountId,
        member_address: AccountId,
        voting_address: AccountId,
    }

    impl DaoCore {
        #[ink(constructor)]
        pub fn new(proposal_software:SoftwareInfo, member_software:SoftwareInfo, voting_software:SoftwareInfo) -> Self {
            ink_lang::utils::initialize_contract(|instance: &mut Self| {
                self.installed_software_list_with_address.insert(&proposal_software.contract_address, &proposal_software);
                self.installed_software_list_with_address.insert(&member_software.contract_address, &member_software);
                self.installed_software_list_with_address.insert(&voting_software.contract_address, &voting_software);
                self.software_id = 0;
                self.installed_software_list_with_id.insert(&self.software_id, &proposal_software);
                self.software_id += 1;
                self.installed_software_list_with_id.insert(&self.software_id, &member_software);
                self.software_id += 1;
                self.installed_software_list_with_id.insert(&self.software_id, &voting_software);
                self.software_id += 1;
            })
        }

        #[ink(message)]
        pub fn install_software(software_info:SoftwareInfo, target_proposal_id:u128) -> Result<()> {

        }

        #[ink(message)]
        pub fn update_software(software_info:SoftwareInfo, target_proposal_id:u128) -> Result<()> {
            
        }
    }

    /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    /// module and test functions are marked with a `#[test]` attribute.
    /// The below code is technically just normal Rust code.
    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// Imports `ink_lang` so we can use `#[ink::test]`.
        use ink_lang as ink;

        /// We test if the default constructor does its job.
        #[ink::test]
        fn default_works() {
            let dao_core = DaoCore::default();
            assert_eq!(dao_core.get(), false);
        }

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let mut dao_core = DaoCore::new(false);
            assert_eq!(dao_core.get(), false);
            dao_core.flip();
            assert_eq!(dao_core.get(), true);
        }
    }
}
