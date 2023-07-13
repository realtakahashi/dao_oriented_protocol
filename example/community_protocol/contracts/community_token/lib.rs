#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

#[openbrush::contract]
mod community_token {
    use contract_helper::common::common_logics;
    use contract_helper::traits::contract_base::contract_base::*;
    use contract_helper::traits::types::types::*;
    use contract_helper::traits::types::types::MemberInfo;
    use default_contract::default_contract::DefaultContractRef;
    // use ink::prelude::string::String;
    use ink::prelude::string::ToString;
    use ink::prelude::vec::Vec;
    use ink::storage::traits::StorageLayout;
    use openbrush::{storage::Mapping, traits::Storage};
    use scale::Decode;
    // use openbrush::contracts::psp22::*;
    use openbrush::{
        contracts::psp22::extensions::metadata::*,
    };
    use community_types::types::{ RewardInfo, RewardInfoType2 };

    #[ink(storage)]
    #[derive(Default,Storage)]
    pub struct CommunityToken {
        #[storage_field]
        psp22: psp22::Data,
        #[storage_field]
        metadata: metadata::Data,
        community_list_manager_address: Option<AccountId>,
        command_list: Vec<ink::prelude::string::String>,
        application_core_address: Option<AccountId>,
        proposal_manager_address: Option<AccountId>,
        reward_sub_token_list: Mapping<AccountId,u128>,
        next_reward_sub_token_id: u128,
    }

    impl PSP22 for CommunityToken {}
    impl PSP22Metadata for CommunityToken {}

    impl ContractBase for CommunityToken {
        #[ink(message)]
        fn get_application_core_address(&self) -> Option<AccountId> {
            self.application_core_address
        }

        /// get data interface
        #[ink(message)]
        fn get_data(&self, target_function: ink::prelude::string::String) -> Vec<Vec<u8>> {
            let mut result: Vec<Vec<u8>> = Vec::new();
            result
        }

        fn _set_application_core_address_impl(
            &mut self,
            application_core_address: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            match self.application_core_address {
                Some(_value) => return Err(ContractBaseError::SetTheAddressOnlyOnece),
                None => self.application_core_address = Some(application_core_address),
            }
            Ok(())
        }

        /// [private] get command list
        fn _get_command_list(&self) -> &Vec<ink::prelude::string::String> {
            &self.command_list
        }

        /// [private] switch of call function
        fn _function_calling_switch(
            &mut self,
            command: ink::prelude::string::String,
            vec_of_parameters: Vec<ink::prelude::string::String>,
            caller_eoa: AccountId
        ) -> core::result::Result<(), ContractBaseError> {
            match command.as_str() {
                "set_application_core_address" => self._set_application_core_address(vec_of_parameters),
                "rewards_psp22_4communities" => self._rewards_psp22_4communities(vec_of_parameters),
                "exchange_2_community_token" => self._exchange_2_community_token(vec_of_parameters, caller_eoa),
                // "rewards_psp22_individials" => self._rewards_psp22_individials(vec_of_parameters),
                _ => Err(ContractBaseError::CommnadNotFound),
            }
        }
    }

    impl CommunityToken {
        #[ink(constructor)]
        pub fn new(
            name: Option<openbrush::traits::String>,
            symbol: Option<openbrush::traits::String>,
            decimal: u8,
            total_supply: Balance, 
            community_list_manager_address:AccountId,
            proposal_manager_address:AccountId,
        ) -> Self {
            let mut instance = Self::default();
            instance.metadata.name = name;
            instance.metadata.symbol = symbol;
            instance.metadata.decimals = decimal;
            instance
                ._mint_to(community_list_manager_address, total_supply)
                .expect("Should mint");
            instance.command_list.push("set_application_core_address".to_string());
            instance.command_list.push("rewards_psp22_4communities".to_string());
            instance.command_list.push("exchange_2_community_token".to_string());
            instance.community_list_manager_address = Some(community_list_manager_address);
            instance.proposal_manager_address = Some(proposal_manager_address);
            instance
        }

        #[ink(message)]
        pub fn extarnal_get_data_interface(&self,target_function:ink::prelude::string::String) -> Vec<Vec<u8>> {
            self.get_data(target_function)
        }

        #[ink(message)]
        pub fn extarnal_execute_interface(&mut self, command:ink::prelude::string::String, parameters_csv:ink::prelude::string::String, caller_eoa: AccountId) -> core::result::Result<(), ContractBaseError>{
            self._execute_interface(command, parameters_csv, caller_eoa)
        }

        fn _rewards_psp22_4communities(&mut self, vec_of_parameters:Vec<ink::prelude::string::String>) -> core::result::Result<(), ContractBaseError>{
            ink::env::debug_println!("########## community_token:_rewards_psp22_4communities Call 1");
            let mut reward_list:Vec<RewardInfoType2> = Vec::new();
            if self._modifier_only_call_from_proposal() == false{
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            ink::env::debug_println!("########## community_token:_rewards_psp22_4communities Call 2");
            for param in vec_of_parameters {
                ink::env::debug_println!("########## community_token:_rewards_psp22_4communities Call 3");
                let reward_string:Vec<ink::prelude::string::String> = param.split(&"$3$".to_string()).map(|col| col.to_string()).collect();
                let community_sub_token_contract_address = match common_logics::convert_string_to_accountid(&reward_string[0]) {
                    Some(value) => value,
                    None => return Err(ContractBaseError::Custom("InvalidCommunityAddress".to_string())),
                };
                ink::env::debug_println!("########## community_token:_rewards_psp22_4communities Call 4");

                let reward_info = RewardInfoType2{
                    address: community_sub_token_contract_address,
                    amount: reward_string[1].clone(),
                };
                reward_list.push(reward_info);
            }
            ink::env::debug_println!("########## community_token:_rewards_psp22_4communities Call 5");        
            for reward_info in reward_list {
                ink::env::debug_println!("########## community_token:_rewards_psp22_4communities Call 6");
                let mut instance: DefaultContractRef =
                    ink::env::call::FromAccountId::from_account_id(reward_info.address);
                match instance.extarnal_execute_interface(
                    "mint_by_community_token".to_string(),
                    reward_info.amount.clone(),
                    self.env().caller(),
                ) {
                    Ok(()) => (),
                    Err(_) => {
                        return Err(ContractBaseError::Custom(
                            "mint_by_community_token_calling_error".to_string(),
                        ))
                    }
                }
                ink::env::debug_println!("########## community_token:_rewards_psp22_4communities Call 7");
                let amount = match common_logics::convert_string_to_u128(&reward_info.amount){
                    Ok(value) => value,
                    Err(e) => return Err(e),
                };
                ink::env::debug_println!("########## community_token:_rewards_psp22_4communities Call 8");
                match self._burn_from(self.community_list_manager_address.unwrap(),amount) {
                    Ok(()) => {
                        self.reward_sub_token_list.insert(&reward_info.address, &self.next_reward_sub_token_id);
                        self.next_reward_sub_token_id += 1;
                    },
                    Err(_e) => return Err(ContractBaseError::Custom("BurnFromIsFailure.".to_string())), 
                }
            }
            ink::env::debug_println!("########## community_token:_rewards_psp22_4communities Call 9");
            Ok(())
        }

        fn _exchange_2_community_token(&mut self, vec_of_parameters:Vec<ink::prelude::string::String>, caller_eoa:AccountId) -> core::result::Result<(), ContractBaseError> {
            let caller_contract = self.env().caller();
            if self.reward_sub_token_list.get(&caller_contract) == None {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            if vec_of_parameters.len() != 1 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            let amount = match common_logics::convert_string_to_u128(&vec_of_parameters[0]){
                Ok(value) => value,
                Err(e) => return Err(e),
            };
            match self._mint_to(caller_eoa, amount){
                Ok(()) => Ok(()),
                Err(e) => Err(ContractBaseError::Custom("MintToIsFailure.".to_string())),
            }       
        }

        fn _modifier_only_call_from_proposal(&self) -> bool {
            self.proposal_manager_address == Some(self.env().caller())
        }
    }

    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// We test if the default constructor does its job.
        #[ink::test]
        fn default_works() {
            let community_token = CommunityToken::default();
            assert_eq!(community_token.get(), false);
        }

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let mut community_token = CommunityToken::new(false);
            assert_eq!(community_token.get(), false);
            community_token.flip();
            assert_eq!(community_token.get(), true);
        }
    }
}
