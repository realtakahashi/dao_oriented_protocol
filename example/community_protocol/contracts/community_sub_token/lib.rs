#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

#[openbrush::contract]
mod community_sub_token {
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
    use community_types::types::{ RewardInfo };

    #[ink(storage)]
    #[derive(Default,Storage)]
    pub struct CommunitySubToken {
        #[storage_field]
        psp22: psp22::Data,
        #[storage_field]
        metadata: metadata::Data,
        community_core_address: Option<AccountId>,
        command_list: Vec<ink::prelude::string::String>,
        application_core_address: Option<AccountId>,
        proposal_manager_address: Option<AccountId>,
        community_token_address: Option<AccountId>,
    }

    impl PSP22 for CommunitySubToken {}
    impl PSP22Metadata for CommunitySubToken {}

    impl ContractBase for CommunitySubToken {
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
                "rewards_psp22_individials" => self._rewards_psp22_individials(vec_of_parameters),
                "mint_by_community_token" => self._mint_by_community_token(vec_of_parameters),
                "exchange_2_community_token" => self._exchange_2_community_token(vec_of_parameters,caller_eoa),
                _ => Err(ContractBaseError::CommnadNotFound),
            }
        }
    }

    impl CommunitySubToken {
        #[ink(constructor)]
        pub fn new(
            name: Option<openbrush::traits::String>,
            symbol: Option<openbrush::traits::String>,
            decimal: u8,
            // total_supply: Balance, 
            community_core_address:AccountId,
            community_token_address:AccountId,
            proposal_manager_address:AccountId,
        ) -> Self {
            let mut instance = Self::default();
            instance.metadata.name = name;
            instance.metadata.symbol = symbol;
            instance.metadata.decimals = decimal;
            // instance
            //     ._mint_to(community_core_address, total_supply)
            //     .expect("Should mint");
            instance.command_list.push("set_application_core_address".to_string());
            instance.command_list.push("rewards_psp22_individials".to_string());
            instance.command_list.push("mint_by_community_token".to_string());
            instance.command_list.push("exchange_2_community_token".to_string());
            instance.community_core_address = Some(community_core_address);
            instance.proposal_manager_address = Some(proposal_manager_address);
            instance.community_token_address = Some(community_token_address);
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

        fn _rewards_psp22_individials(&mut self, vec_of_parameters:Vec<ink::prelude::string::String>) -> core::result::Result<(), ContractBaseError>{
            let mut reward_list:Vec<RewardInfo> = Vec::new();
            if self._modifier_only_call_from_proposal() == false{
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            for param in vec_of_parameters {
                let reward_string:Vec<ink::prelude::string::String> = param.split(&"$3$".to_string()).map(|col| col.to_string()).collect();
                let address = match common_logics::convert_string_to_accountid(&reward_string[0]) {
                    Some(value) => value,
                    None => return Err(ContractBaseError::Custom("InvalidEoaAddress".to_string())),
                };
                let amount = match common_logics::convert_string_to_u128(&reward_string[1]) {
                    Ok(value) => value,
                    Err(error) => return Err(error),
                };
                let reward_info = RewardInfo{
                    address: address,
                    amount: amount 
                };
                reward_list.push(reward_info);
            }
        
            for reward_info in reward_list {
                match self._transfer_from_to(self.community_core_address.unwrap(),reward_info.address,reward_info.amount, "transfer_data".as_bytes().to_vec()) {
                    Ok(()) => (),
                    Err(e) => return Err(ContractBaseError::Custom("TransferFromToIsFailure.".to_string())),
                }
            }
            Ok(())
        }

        fn _mint_by_community_token(&mut self, vec_of_parameters:Vec<ink::prelude::string::String>) -> core::result::Result<(), ContractBaseError>{
            if self._modifier_only_call_from_community_token() == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            if vec_of_parameters.len() != 1 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            let amount = match common_logics::convert_string_to_u128(&vec_of_parameters[0]) {
                Ok(value) => value,
                Err(error) => return Err(error),
            };
            match self._mint_to(self.community_core_address.unwrap(), amount){
                Ok(()) => Ok(()),
                Err(e) => Err(ContractBaseError::Custom("MintToIsFailure.".to_string())),
            } 
        }

        fn _exchange_2_community_token(&mut self, vec_of_parameters:Vec<ink::prelude::string::String>, caller_eoa:AccountId) -> core::result::Result<(), ContractBaseError>{
            if self._modifier_only_call_from_application_core(self.env().caller()) == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            if vec_of_parameters.len() != 1 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            let mut instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(self.community_token_address.unwrap());
            match instance.extarnal_execute_interface(
                "exchange_2_community_token".to_string(),
                vec_of_parameters[0].clone(),
                caller_eoa,
            ) {
                Ok(()) => (),
                Err(_) => {
                    return Err(ContractBaseError::Custom(
                        "exchange_2_community_token".to_string(),
                    ))
                }
            }
            Ok(())
        }

        fn _modifier_only_call_from_proposal(&self) -> bool {
            self.proposal_manager_address == Some(self.env().caller())
        }

        fn _modifier_only_call_from_community_token(&self) -> bool {
            self.community_token_address == Some(self.env().caller())
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
