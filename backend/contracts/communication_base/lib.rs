#![cfg_attr(not(feature = "std"), no_std)]

#[openbrush::contract]
pub mod communication_base {
    use default_contract::default_contract::{DefaultContract, DefaultContractRef};
    use contract_helper::traits::contract_base::contract_base::contractbase_external::ContractBase;
    use contract_helper::traits::contract_base::contract_base::*;
    use ink::{prelude::string::String};
    use ink::prelude::vec::Vec;

    #[ink(storage)]
    pub struct CommunicationBase {}

    impl CommunicationBase {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {}
        }

        #[ink(message)]
        pub fn get_data_from_contract(&self, target_contract:AccountId, target_function:String) -> Vec<Vec<u8>> {
            let instance: DefaultContractRef = ink::env::call::FromAccountId::from_account_id(target_contract);
            instance.get_data(target_function)
        }
    }

}
