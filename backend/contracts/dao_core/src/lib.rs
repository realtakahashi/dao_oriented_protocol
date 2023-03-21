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
    }

    impl DaoCore {
        #[ink(constructor)]
        pub fn new() -> Self {
            ink_lang::utils::initialize_contract(|instance: &mut Self| {})
        }

        // todo: hashmapの実装例を見ると改善出来る気がする。idが不要？
        #[ink(message)]
        pub fn get_installed_software(&self) -> Vec<SoftwareInfo> {
            let mut result:Vec<SoftwareInfo> = Vec::new();
            for i in 0..self.software_id {
                match self.installed_software_list_with_id.get(&i) {
                    Some(value) => result.push(value),
                    None => (),
                }
            }
            result
        }

        #[ink(message)]
        pub fn execute_interface(&mut self,){
            // アドレスがわかっている状態で、関数インターフェースの異なる他のコントラクトを呼び出せるかテストする。
        }

        #[ink(message)]
        pub fn install_software(&mut self, target_proposal_id:u128) -> Result<()> {
            Ok()
        }

        #[ink(message)]
        pub fn uninstall_software(&mut self, target_proposal_id:u128) -> Result<()> {
            Ok()
        }

        #[inline]
        fn _check_software_interface(interface_list: Vec<String>) -> Result<()> {
            // 各softwareのexecute_interfaceの存在の有無を確認する。
            Ok()
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
