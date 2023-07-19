#![cfg_attr(not(feature = "std"), no_std)]

#[openbrush::contract]
mod community_core {
    use contract_helper::common::common_logics::{self, ContractBaseError};
    use contract_helper::traits::contract_base::contract_base::*;
    use contract_helper::traits::types::types::*;
    use core::str::FromStr;
    use default_contract::DefaultContractRef;
    use ink::prelude::borrow::ToOwned;
    use ink::prelude::string::{String, ToString};
    use ink::prelude::vec::Vec;
    use ink::storage::traits::StorageLayout;
    use openbrush::{storage::Mapping, traits::Storage};
    use scale::Decode;
    use community_types::types::RewardInfo;

    #[derive(Default, Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub struct CommunityInfo {
        name: String,
        constract_address: Option<AccountId>,
        contents: String,
        sub_token_contract_address: Option<AccountId>,
        application_core_contract_address: Option<AccountId>
    }

    // #[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    // #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    // pub struct RewardInfo {
    //     eoa_address: AccountId,
    //     amount: Balance,
    // }

    #[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub struct ContributionInfo {
        id: u128,
        contributor: AccountId,
        contents: String,
        blocktime: BlockNumber,
    }

    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct CommunityCore {
        application_core_address: Option<AccountId>,
        community_list_manager_address: Option<AccountId>,
        // community_token_address: Option<AccountId>,
        command_list: Vec<String>,
        contribution_list: Mapping<u128, ContributionInfo>,
        checked_blocktime: BlockNumber,
        checked_contribution_id: Option<u128>,
        check_interval_of_blocktime: BlockNumber,
        next_contribution_id: u128,
        community_info: CommunityInfo,
        member_manager_address: Option<AccountId>,
        proposal_manager_address: Option<AccountId>,
    }

    impl ContractBase for CommunityCore {
        #[ink(message)]
        fn get_application_core_address(&self) -> Option<AccountId> {
            self.application_core_address
        }

        /// get data interface
        #[ink(message)]
        fn get_data(&self, target_function: String) -> Vec<Vec<u8>> {
            let mut result: Vec<Vec<u8>> = Vec::new();
            result
        }

        fn _set_application_core_address_impl(
            &mut self,
            application_core_address: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            match self.application_core_address {
                Some(_value) => return Err(ContractBaseError::SetTheAddressOnlyOnece),
                None => {
                    self.application_core_address = Some(application_core_address);
                    self.community_info.application_core_contract_address = Some(application_core_address);
                }
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
            caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            match command.as_str() {
                "set_application_core_address" => {
                    self._set_application_core_address(vec_of_parameters)
                }
                "submit_contribution" => self._submit_contribution(vec_of_parameters, caller_eoa),
                "check_contribution" => self._check_contribution(vec_of_parameters),
                "propose_adding_community_list" => {
                    self._propose_adding_community_list(vec_of_parameters)
                }
                "rewards_by_native_token" => {
                    self._rewards_by_native_token(vec_of_parameters)
                }
                "set_manager_addresses" => {
                    self._set_manager_addresses(vec_of_parameters)
                }
                _ => Err(ContractBaseError::CommnadNotFound),
            }
        }
    }

    impl CommunityCore {
        #[ink(constructor)]
        pub fn new(
            // community_list_manager_address: AccountId,
            // community_token_address: AccountId,
            check_interval_of_blocktime: BlockNumber,
            name: String,
            contents: String,
            // community_sub_token_address: AccountId,
            // proposal_manager_address: AccountId,
            // member_manager_address: AccountId,
        ) -> Self {
            // Self {
            //     application_core_address: None,
            //     community_list_manager_address: Some(community_list_manager_address),
            //     command_list: [
            //         "set_application_core_address".to_string(),
            //         "submit_contribution".to_string(),
            //         "check_contribution".to_string(),
            //         "propose_adding_community_list".to_string()
            //     ].to_vec(),
            //     contribution_list: Mapping::default(),
            //     checked_blocktime: BlockNumber::default(),
            //     check_interval_of_blocktime: BlockNumber::default(),
            //     next_contribution_id: 0,
            // }
            let mut instance = Self::default();
            instance
                .command_list
                .push("set_application_core_address".to_string());
            instance
                .command_list
                .push("submit_contribution".to_string());
            instance.command_list.push("check_contribution".to_string());
            instance
                .command_list
                .push("propose_adding_community_list".to_string());
            instance
                .command_list
                .push("rewards_by_native_token".to_string());
            instance.command_list.push("set_manager_addresses".to_string());
            // instance
            //     .command_list
            //     .push("rewards_by_community_token".to_string());
            // instance.community_list_manager_address = Some(community_list_manager_address);
            // instance.community_token_address = Some(community_token_address);
            instance.check_interval_of_blocktime = check_interval_of_blocktime; //7200 * 30 = 216000,
            instance.community_info = CommunityInfo {
                name: name,
                contents: contents,
                constract_address: Some(instance.env().account_id()),
                sub_token_contract_address: None,
                application_core_contract_address: None,
            };
            // instance.proposal_manager_address = Some(proposal_manager_address);
            // instance.member_manager_address = Some(member_manager_address);
            instance
        }

        #[ink(message)]
        pub fn extarnal_get_data_interface(&self, target_function: String) -> Vec<Vec<u8>> {
            self.get_data(target_function)
        }

        #[ink(message)]
        pub fn extarnal_execute_interface(
            &mut self,
            command: String,
            parameters_csv: String,
            caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            self._execute_interface(command, parameters_csv, caller_eoa)
        }

        #[ink(message)]
        pub fn get_contribution_list(&self) -> Vec<ContributionInfo> {
            let mut result: Vec<ContributionInfo> = Vec::new();
            for i in 0..self.next_contribution_id {
                match self.contribution_list.get(&i) {
                    Some(value) => result.push(value),
                    None => (),
                }
            }
            result
        }

        #[ink(message)]
        pub fn get_checked_blocktime_of_contribution(&self) -> BlockNumber {
            self.checked_blocktime
        }

        #[ink(message)]
        pub fn get_community_info(&self) -> CommunityInfo {
            self.community_info.clone()
        }

        #[ink(message)]
        pub fn get_community_balance(&self) -> Balance {
            self.env().balance()
        }

        #[ink(message)]
        pub fn get_community_list_manager_address(&self) -> Option<AccountId> {
            self.community_list_manager_address
        }

        
        fn _set_manager_addresses(
            &mut self,
            vec_of_parameters: Vec<String>
        ) -> core::result::Result<(), ContractBaseError> {
            if self._modifier_only_call_from_application_core(self.env().caller()) == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            if vec_of_parameters.len() != 4 {
                return Err(ContractBaseError::ParameterInvalid);
            }

            let update_member_manager_address = match common_logics::convert_hexstring_to_accountid(vec_of_parameters[0].clone()){
                Some(value) => value,
                None => return Err(ContractBaseError::ParameterInvalid),
            };
            let proposal_manager_address = match common_logics::convert_hexstring_to_accountid(vec_of_parameters[1].clone()){
                Some(value) => value,
                None => return Err(ContractBaseError::ParameterInvalid),
            };
            let community_list_manager_address = match common_logics::convert_hexstring_to_accountid(vec_of_parameters[2].clone()){
                Some(value) => value,
                None => return Err(ContractBaseError::ParameterInvalid),
            };
            let community_sub_token_address = match common_logics::convert_hexstring_to_accountid(vec_of_parameters[3].clone()){
                Some(value) => value,
                None => return Err(ContractBaseError::ParameterInvalid),
            };


            self.member_manager_address = Some(update_member_manager_address);
            self.proposal_manager_address = Some(proposal_manager_address);
            self.community_list_manager_address = Some(community_list_manager_address);
            self.community_info.sub_token_contract_address = Some(community_sub_token_address);

            Ok(())
        }

        fn _submit_contribution(
            &mut self,
            vec_of_parameters: Vec<String>,
            caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            if self._modifier_only_call_from_application_core(self.env().caller()) == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            // already checked by application_core
            if vec_of_parameters.len() != 1 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            let contribution_info = ContributionInfo {
                id: self.next_contribution_id,
                contributor: caller_eoa,
                contents: vec_of_parameters[0].clone(),
                blocktime: self.env().block_number(),
            };
            self.contribution_list
                .insert(&self.next_contribution_id, &contribution_info);
            self.next_contribution_id += 1;
            Ok(())
        }

        fn _check_contribution(
            &mut self,
            _vec_of_parameters: Vec<String>,
        ) -> core::result::Result<(), ContractBaseError> {
            if self._modifier_only_call_from_application_core(self.env().caller()) == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            let check_limit = self.checked_blocktime + self.check_interval_of_blocktime;
            if self.env().block_number() < check_limit {
                return Err(ContractBaseError::Custom("CheckTimingIsEarly.".to_string()));
            }
            let mut contribution_people: Vec<AccountId> = Vec::new();
            for i in (0..self.next_contribution_id).rev() {
                let contribution_info = match self.contribution_list.get(&i) {
                    Some(value) => value,
                    None => continue,
                };
                match self.checked_contribution_id {
                    Some(value) => {
                        if i <= value {
                            break;
                        }
                    }
                    None => (),
                }
                contribution_people.push(contribution_info.contributor);
                self.checked_blocktime = contribution_info.blocktime;
            }
            self.checked_contribution_id = Some(self.next_contribution_id - 1);
            match self._delete_member(contribution_people.clone()) {
                Ok(()) => (),
                Err(error) => return Err(error),
            }

            if contribution_people.len() == 0 {
                let mut instance: DefaultContractRef =
                    ink::env::call::FromAccountId::from_account_id(
                        self.community_list_manager_address.unwrap(),
                    );
                match instance.extarnal_execute_interface(
                    "delete_community".to_string(),
                    hex::encode(self.env().caller()),
                    self.env().caller(),
                ) {
                    Ok(()) => (),
                    Err(_) => {
                        return Err(ContractBaseError::Custom(
                            "delete_community_calling_error".to_string(),
                        ))
                    }
                }
            }
            Ok(())
        }

        fn _delete_member(
            &mut self,
            contribution_people: Vec<AccountId>,
        ) -> core::result::Result<(), ContractBaseError> {
            let mut delete_member_list: Vec<AccountId> = Vec::new();
            let member_manager_address = match self.member_manager_address {
                Some(value) => value,
                None => {
                    return Err(ContractBaseError::Custom(
                        "MemberManagerAddressIsNotSet".to_string(),
                    ))
                }
            };
            let mut instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(member_manager_address);
            let get_value: Vec<Vec<u8>> =
                instance.extarnal_get_data_interface("get_member_list".to_string());

            for value in get_value.iter() {
                let array_value: &[u8] = value.as_slice().try_into().unwrap();
                match MemberInfo::decode(&mut array_value.clone()) {
                    Ok(value) => {
                        if contribution_people.contains(&value.address) == false {
                            delete_member_list.push(value.address);
                        }
                    }
                    Err(_) => (),
                };
            }
            ink::env::debug_println!(
                "########## community_core:_delete_member [1]:contribution_people:{:?}",
                contribution_people
            );
            ink::env::debug_println!(
                "########## community_core:_delete_member [2]:delete_member_list:{:?}",
                delete_member_list
            );
            for delete_member_address in delete_member_list.iter() {
                match instance.extarnal_execute_interface(
                    "delete_member_from_commucation_protocol".to_string(),
                    hex::encode(delete_member_address),
                    self.env().caller(),
                ) {
                    Ok(()) => (),
                    Err(_) => {
                        return Err(ContractBaseError::Custom("ExecutionIsFailure".to_string()))
                    }
                }
            }
            Ok(())
        }

        fn _propose_adding_community_list(
            &mut self,
            _vec_of_parameters: Vec<String>,
        ) -> core::result::Result<(), ContractBaseError> {
            ink::env::debug_println!("########## community_core:_propose_adding_community_list call 1"); 
            if self._modifier_only_call_from_application_core(self.env().caller()) == false {
                ink::env::debug_println!("########## community_core:_propose_adding_community_list InvalidCallingFromOrigin");    
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            let parameter = self.community_info.name.as_str().to_owned()
                + "$1$" + &hex::encode(self.env().account_id())
                + "$1$" + &self.community_info.contents
                + "$1$" + &hex::encode(self.community_info.sub_token_contract_address.unwrap())
                + "$1$" + &hex::encode(self.community_info.application_core_contract_address.unwrap());
            let mut instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(
                    self.community_list_manager_address.unwrap(),
                );
            ink::env::debug_println!("########## community_core:_propose_adding_community_list call 2"); 
            match instance.extarnal_execute_interface(
                "add2request_list".to_string(),
                parameter,
                self.env().caller(),
            ) {
                Ok(()) => (),
                Err(e) => {
                    ink::env::debug_println!("########## community_core:_propose_adding_community_list add2request_list_calling_error: {:?}",e);    
                    return Err(ContractBaseError::Custom(
                        "add2request_list_calling_error".to_string(),
                    ))
                }
            }
            Ok(())
        }

        fn _rewards_by_native_token(
            &mut self,
            vec_of_parameters: Vec<String>,
        ) -> core::result::Result<(), ContractBaseError> {
            let mut reward_list: Vec<RewardInfo> = Vec::new();
            if self._modifier_only_call_from_proposal() == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            for param in vec_of_parameters {
                let reward_string: Vec<String> = param
                    .split(&"$3$".to_string())
                    .map(|col| col.to_string())
                    .collect();
                let eoa_address =
                    match common_logics::convert_string_to_accountid(&reward_string[0]) {
                        Some(value) => value,
                        None => {
                            return Err(ContractBaseError::Custom("InvalidEoaAddress".to_string()))
                        }
                    };
                let amount = match common_logics::convert_string_to_u128(&reward_string[1]) {
                    Ok(value) => value,
                    Err(error) => return Err(error),
                };
                let reward_info = RewardInfo {
                    address: eoa_address,
                    amount: amount,
                };
                reward_list.push(reward_info);
            }
            let member_list = match self._get_member_info_list() {
                Ok(value) => value,
                Err(error) => return Err(error),
            };
            for reward_info in reward_list {
                if self._check_vaild_transfer_eoa(member_list.clone(), reward_info.address)
                    == false
                {
                    return Err(ContractBaseError::Custom("TheyIsNotAMember".to_string()));
                }
                match self
                    .env()
                    .transfer(reward_info.address, reward_info.amount)
                {
                    Ok(()) => (),
                    Err(_e) => {
                        return Err(ContractBaseError::Custom(
                            "TransferingContractBalanceIsFailure".to_string(),
                        ))
                    }
                }
            }
            Ok(())
        }

        fn _check_vaild_transfer_eoa(
            &self,
            member_list: Vec<MemberInfo>,
            target_eoa: AccountId,
        ) -> bool {
            for member in member_list.iter() {
                if member.address == target_eoa {
                    return true;
                }
            }
            false
        }

        // fn _modifier_only_call_from_member_eoa(&self, caller_eoa: AccountId) -> bool {
        //     ink::env::debug_println!("########## community_core:_modifier_only_call_from_member_eoa caller_eoa is {:?}", caller_eoa);
        //     ink::env::debug_println!("########## community_core:_modifier_only_call_from_member_eoa _get_member_info_list is {:?}", self._get_member_info_list());
        //     match self._get_member_info_list() {
        //         Ok(member_list) => {
        //             for member_info in member_list {
        //                 if member_info.address == caller_eoa {
        //                     return true;
        //                 };
        //             }
        //         }
        //         Err(_) => return false,
        //     }
        //     false
        // }

        fn _get_member_info_list(
            &self,
        ) -> core::result::Result<Vec<MemberInfo>, ContractBaseError> {
            ink::env::debug_println!("########## community_core::_get_member_info_list:[1] ");
            let member_manager_address = match self.member_manager_address {
                Some(value) => value,
                None => {
                    return Err(ContractBaseError::Custom(
                        "MemberManagerAddressIsNotSet".to_string(),
                    ))
                }
            };
            ink::env::debug_println!("########## community_core::_get_member_info_list:[2] ");
            let mut result: Vec<MemberInfo> = Vec::new();

            let instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(member_manager_address);
            let get_value: Vec<Vec<u8>> =
                instance.extarnal_get_data_interface("get_member_list".to_string());

            ink::env::debug_println!(
                "########## community_core::_get_member_info_list:[3]:{:?}",
                get_value
            );
            for value in get_value.iter() {
                let array_value: &[u8] = value.as_slice().try_into().unwrap();
                match MemberInfo::decode(&mut array_value.clone()) {
                    Ok(value) => result.push(value),
                    Err(_) => {
                        return Err(ContractBaseError::Custom(
                            "GotAnErrorGettingMemberInfo".to_string(),
                        ))
                    }
                };
            }
            ink::env::debug_println!("########## community_core::_get_member_info_list:[4] ");

            Ok(result)
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
            let community_core = CommunityCore::default();
            assert_eq!(community_core.get(), false);
        }

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let mut community_core = CommunityCore::new(false);
            assert_eq!(community_core.get(), false);
            community_core.flip();
            assert_eq!(community_core.get(), true);
        }
    }
}
