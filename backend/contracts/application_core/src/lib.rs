#![cfg_attr(not(feature = "std"), no_std)]

#[openbrush::contract]
mod application_core {
    use openbrush::{contracts::{ ownable::* }, modifiers, storage::Mapping, traits::Storage};
    use ink::prelude::string::{String};
    use ink::prelude::{vec,vec::Vec};
    use ink::storage::traits::StorageLayout;

    #[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]    
    pub struct SoftwareInfo {
        name: String,
        contract_address: AccountId,
        description: String,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        TheSoftwareIsAlreadyInstalled,
        TheSoftwareDoesNotExists,
        YouAreAlreadyInAdminGroup,
        UserDoesNotExists,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct ApplicationCore {
        installed_software_list_with_address: Mapping<AccountId,SoftwareInfo>,
        installed_software_list_with_id: Mapping<u128, SoftwareInfo>,
        software_id: u128,
    }

    impl ApplicationCore {
        #[ink(constructor)]
        pub fn new() -> Self {
            let mut instance = Self::default();
            instance
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

        /// InstallはDAOメンバーであれば誰でも実行できるようにする。
        /// Installed Softwwareはデフォルトがenable=falseで、その後、そのDAOの決め方でenable=trueにするような構成にする
        #[ink(message)]
        pub fn install_software(&mut self, software_name:String, software_description:String, contract_address:AccountId, 
            enable_member_check:bool, member_manager_address: Option<AccountId> ) -> Result<()> {
            if enable_member_check == true {
                let member_manager_address = match member_address {
                    Some(value) => value,
                    None => return Err(Error::MemberManagerAddressIsRequired),
                };
                // communication_baseを使ってコールする　※dao_coreではdefault_contractは使用しない。

            }
            // member_managerが存在することを前提にするかをどうやって決定するか？存在しなくても動作するようにする。
            match self.installed_software_list_with_address.get(&contract_address) {
                Some(_) => return Err(Error::TheSoftwareIsAlreadyInstalled),
                None => {
                    let software_info:SoftwareInfo = SoftwareInfo {
                        name: software_name,
                        description: software_description,
                        contract_address: contract_address,
                    };
                    self.installed_software_list_with_id.insert(&self.software_id, &software_info);
                    self.installed_software_list_with_address.insert(&contract_address, &software_info);
                    // todo: set_dao_addressを呼ぶ
                    // todo: change_enable_or_notを呼ぶ

                    self.software_id += 1;
                    Ok()
                },
            }
        }

        #[ink(message)]
        pub fn uninstall_software(&mut self, target_proposal_id:u128) -> Result<()> {
            Ok()
        }

        #[ink(message)]
        #[modifiers(only_role(DEFAULT_ADMIN_ROLE))]
        pub fn add_administrator(&mut self, target_account_id:AccountId) -> Result<()> {
            match self.administrator_list.get(&target_account_id) {
                Some(_) => return Err(Error::YouAreAlreadyInAdminGroup),
                None => {
                    self.grant_role(DEFAULT_ADMIN_ROLE, target_account_id).expect("Should grant Admin role");
                    self.administrator_list.insert(&target_account_id, &self.administrator_id);
                    self.administrator_id += 1;
                    Ok(())
                },
            }
        }

        #[ink(message)]
        #[modifiers(only_role(DEFAULT_ADMIN_ROLE))]
        pub fn remove_administrator(&mut self, target_account_id:AccountId) -> Result<()> {
            match self.administrator_list.get(&target_account_id) {
                Some(_) => {
                    self.administrator_list.remove(&target_account_id);
                    self.revoke_role(DEFAULT_ADMIN_ROLE, target_account_id).expect("Should grant Admin role");
                    Ok(())
                },
                None => Err(Error::UserDoesNotExists),
            }
        }

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
