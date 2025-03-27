#![cfg_attr(not(feature = "std"), no_std)]

pub use self::community_list_manager::{CommunityListManager, CommunityListManagerRef};

#[ink::contract]
mod community_list_manager {
    use community_types::types::{ CommunityInfoWithId, RewardInfo };
    use contract_helper::common::common_logics;
    use contract_helper::traits::contract_base::contract_base::*;
    use contract_helper::traits::types::types::*;
    use contract_helper::traits::types::types::MemberInfo;
    use default_contract::default_contract::DefaultContractRef;
    use ink::prelude::string::String;
    use ink::prelude::string::ToString;
    use ink::prelude::vec::Vec;
    use ink::storage::traits::StorageLayout;
    use ink::{storage::Mapping, traits::Storage};
    use scale::{ Decode, Encode };

    // #[derive(Default, Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    // #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    // pub struct CommunityInfo {
    //     id: u128,
    //     name:String,
    //     contract_address:Option<AccountId>,
    //     contents:String,
    // }

    // #[derive( Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    // #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    // pub struct RewardInfo {
    //     address:AccountId,
    //     amount:Balance,
    // }

    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct CommunityListManager {
        community_list_with_address: Mapping<AccountId, CommunityInfoWithId>,
        community_list_with_id: Mapping<u128, CommunityInfoWithId>,
        request_list4adding_list: Mapping<u128, CommunityInfoWithId>,
        next_community_id: u128,
        next_request_id: u128,
        command_list: Vec<String>,
        application_core_address: Option<AccountId>,
        proposal_manager_address: Option<AccountId>,
    }

    impl ContractBase for CommunityListManager {
        #[ink(message)]
        fn get_application_core_address(&self) -> Option<AccountId> {
            self.application_core_address
        }

        /// get data interface
        #[ink(message)]
        fn get_data(&self, target_function: String) -> Vec<Vec<u8>> {
            let mut result: Vec<Vec<u8>> = Vec::new();
            match target_function.as_str() {
                "get_community_list" => {
                    let list: Vec<CommunityInfoWithId> = self.get_community_list();
                    for value in list.iter() {
                        result.push(value.encode());
                    }
                },
                _ => (),
            }
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
        fn _get_command_list(&self) -> &Vec<String> {
            &self.command_list
        }

        /// [private] switch of call function
        fn _function_calling_switch(
            &mut self,
            command: String,
            vec_of_parameters: Vec<String>,
            caller_eoa: AccountId
        ) -> core::result::Result<(), ContractBaseError> {
            match command.as_str() {
                "set_application_core_address" => self._set_application_core_address(vec_of_parameters),
                "add2request_list" => self._add2request_list(vec_of_parameters),
                "add_community" => self._add_community(vec_of_parameters),
                "delete_community" => self._delete_community(vec_of_parameters),
                "distribution_of_rewards4communities" => self._distribution_of_rewards4communities(vec_of_parameters),
                _ => Err(ContractBaseError::CommnadNotFound),
            }
        }
    }

    impl CommunityListManager {
        #[ink(constructor)]
        pub fn new(proposal_manager_address:AccountId) -> Self {
            let mut instance = Self::default();
            instance.command_list.push("set_application_core_address".to_string());
            instance.command_list.push("add_community".to_string());
            instance.command_list.push("delete_community".to_string());
            instance.command_list.push("distribution_of_rewards4communities".to_string());
            instance.command_list.push("add2request_list".to_string());
            instance.proposal_manager_address = Some(proposal_manager_address);
            instance
        }

        #[ink(message)]
        pub fn extarnal_get_data_interface(&self,target_function:String) -> Vec<Vec<u8>> {
            self.get_data(target_function)
        }

        #[ink(message)]
        pub fn extarnal_execute_interface(&mut self, command:String, parameters_csv:String, caller_eoa: AccountId) -> core::result::Result<(), ContractBaseError>{
            self._execute_interface(command, parameters_csv, caller_eoa)
        }

        #[ink(message)]
        pub fn get_community_list(&self) -> Vec<CommunityInfoWithId> {
            let mut result:Vec<CommunityInfoWithId> = Vec::new();
            for i in 0..self.next_community_id {
                match self.community_list_with_id.get(&i) {
                    Some(value) => result.push(value),
                    None => (),
                }
            }
            result
        }

        #[ink(message)]
        pub fn get_request_list4adding(&self) -> Vec<CommunityInfoWithId> {
            let mut result:Vec<CommunityInfoWithId> = Vec::new();
            for i in 0..self.next_request_id {
                match self.request_list4adding_list.get(&i) {
                    Some(value) => result.push(value),
                    None => (),
                }
            }
            result
        }

        fn _add2request_list(&mut self, vec_of_parameters:Vec<String>) -> core::result::Result<(), ContractBaseError>{
            ink::env::debug_println!("########## community_list_manager:_add2request_list Call 1");
            if self.env().is_contract(&self.env().caller()) == false{
                ink::env::debug_println!("########## community_list_manager:_add2request_list InvalidCallingFromOrigin");    
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            if vec_of_parameters.len() != 5 {
                ink::env::debug_println!("########## community_list_manager:_add2request_list ParameterInvalid");    
                return Err(ContractBaseError::ParameterInvalid);
            }
            let contract_address = match common_logics::convert_hexstring_to_accountid(vec_of_parameters[1].clone()){
                Some(value) => value,
                None => {
                    ink::env::debug_println!("########## community_list_manager:_add2request_list ParameterInvalid");    
                    return Err(ContractBaseError::ParameterInvalid);
                }
            };
            if self.env().caller() != contract_address {
                ink::env::debug_println!("########## community_list_manager:_add2request_list ParameterInvalid 2");
                ink::env::debug_println!("########## _add2request_list caller: {:?}", self.env().caller());
                ink::env::debug_println!("########## _add2request_list contract_address: {:?}", contract_address);
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            if self.community_list_with_address.get(&contract_address) != None {
                ink::env::debug_println!("########## community_list_manager:_add2request_list TheCommunityIsAlreadyAdded");    
                return Err(ContractBaseError::Custom("TheCommunityIsAlreadyAdded".to_string()));
            }
            let community_sub_token_address = match common_logics::convert_hexstring_to_accountid(vec_of_parameters[3].clone()){
                Some(value) => value,
                None => {
                    ink::env::debug_println!("########## community_list_manager:_add2request_list ParameterInvalid 3"); 
                    return Err(ContractBaseError::ParameterInvalid);
                }
            };
            let applicaiton_core_address = match common_logics::convert_hexstring_to_accountid(vec_of_parameters[4].clone()){
                Some(value) => value,
                None => {
                    ink::env::debug_println!("########## community_list_manager:_add2request_list ParameterInvalid 4"); 
                    return Err(ContractBaseError::ParameterInvalid);
                }
            };
            ink::env::debug_println!("########## community_list_manager:_add2request_list Call 2");
            let community_info = CommunityInfoWithId {
                id: self.next_request_id,
                name:vec_of_parameters[0].clone(),
                contract_address:Some(contract_address),
                contents:vec_of_parameters[2].clone(),
                community_sub_token_contract_address:Some(community_sub_token_address),
                application_core_contract_address:Some(applicaiton_core_address),
            };
            self.request_list4adding_list.insert(&self.next_request_id, &community_info);
            self.next_request_id += 1;
            ink::env::debug_println!("########## community_list_manager:_add2request_list Call 3");
            Ok(())
        }

        fn _add_community(&mut self, vec_of_parameters:Vec<String>) -> core::result::Result<(), ContractBaseError>{
            ink::env::debug_println!("########## community_list_manager:_add_community Call 1");
            if self._modifier_only_call_from_proposal() == false{
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            ink::env::debug_println!("########## community_list_manager:_add_community Call 2");
            if vec_of_parameters.len() != 1 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            ink::env::debug_println!("########## community_list_manager:_add_community Call 3");
            let request_id = match common_logics::convert_string_to_u128(&vec_of_parameters[0]){
                Ok(value) => value,
                Err(error) => return Err(error),
            };
            ink::env::debug_println!("########## community_list_manager:_add_community Call 4 : request_id: {:?}",request_id);
            let community_info = match self.request_list4adding_list.get(&request_id) {
                Some(value) => value,
                None => return Err(ContractBaseError::ParameterInvalid),
            };
            self.community_list_with_id.insert(&self.next_community_id, &community_info);
            self.next_community_id +=1;
            self.community_list_with_address.insert(&community_info.contract_address.unwrap(), &community_info);
            self.request_list4adding_list.remove(&request_id);
            ink::env::debug_println!("########## community_list_manager:_add_community Call 5 : community_info: {:?}", community_info);
            Ok(())
        }

        fn _delete_community(&mut self, vec_of_parameters:Vec<String>) -> core::result::Result<(), ContractBaseError>{
            ink::env::debug_println!("########## community_list_manager:_delete_community Call 1");
            if self._modifier_only_call_from_proposal() == false{
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            ink::env::debug_println!("########## community_list_manager:_delete_community Call 2");
            if vec_of_parameters.len() != 1 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            ink::env::debug_println!("########## community_list_manager:_delete_community Call 3");
            let contract_address = match common_logics::convert_string_to_accountid(&vec_of_parameters[0].clone()){
                Some(value) => value,
                None => return Err(ContractBaseError::ParameterInvalid),
            };
            // if self.env().caller() != contract_address {
            //     return Err(ContractBaseError::InvalidCallingFromOrigin);
            // };
            ink::env::debug_println!("########## community_list_manager:_delete_community Call 4");
            let community_info = match self.community_list_with_address.get(&contract_address) {
                Some(value) => value,
                None => return Err(ContractBaseError::ParameterInvalid),
            };
            self.community_list_with_id.remove(&community_info.id);
            self.community_list_with_address.remove(&contract_address);
            ink::env::debug_println!("########## community_list_manager:_delete_community Call 5");
            Ok(())
        }

        fn _distribution_of_rewards4communities(&mut self, vec_of_parameters:Vec<String>) -> core::result::Result<(), ContractBaseError>{
            let mut reward_list:Vec<RewardInfo> = Vec::new();
            if self._modifier_only_call_from_proposal() == false{
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            for param in vec_of_parameters {
                let reward_string:Vec<String> = param.split(&"$3$".to_string()).map(|col| col.to_string()).collect();
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
                if self.community_list_with_address.get(&reward_info.address) == None {
                    return Err(ContractBaseError::Custom("TheyIsNotRegisterd".to_string()));
                }
                match self.env().transfer(reward_info.address,reward_info.amount) {
                    Ok(()) => (),
                    Err(_e) => return Err(ContractBaseError::Custom("TransferingContractBalanceIsFailure".to_string())),
                }
            }
            Ok(())
        }

        fn _modifier_only_call_from_proposal(&self) -> bool {
            self.proposal_manager_address == Some(self.env().caller())
        }


    }

    /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    /// module and test functions are marked with a `#[test]` attribute.
    /// The below code is technically just normal Rust code.
    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// We test if the default constructor does its job.
        #[ink::test]
        fn default_works() {
            let community_list_manager = CommunityListManager::default();
            assert_eq!(community_list_manager.get(), false);
        }

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let mut community_list_manager = CommunityListManager::new(false);
            assert_eq!(community_list_manager.get(), false);
            community_list_manager.flip();
            assert_eq!(community_list_manager.get(), true);
        }
    }
}
