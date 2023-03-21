#![cfg_attr(not(feature = "std"), no_std)]

#[openbrush::contract]
mod default_member {
    use contract_helper::traits::contract_base::contract_base::*;
    use contract_helper::traits::types::types::*;
    use contract_helper::common::common_logics;
    use ink::prelude::string::{String, ToString};
    use ink::prelude::vec::Vec;
    use openbrush::storage::Mapping;
    use ink::storage::traits::StorageLayout;
    use communication_base::communication_base::{CommunicationBase, CommunicationBaseRef};
    use scale::{ Encode, Decode };

    #[ink(storage)]
    pub struct DefaultMember {
        member_list_with_id: Mapping<u128, MemberInfo>,
        next_member_id: u128,
        dao_address: Option<AccountId>,
        command_list: Vec<String>,
        communication_base_ref: AccountId,
    }

    impl ContractBase for DefaultMember {
        #[ink(message)]
        fn get_dao_address(&self) -> Option<AccountId> {
            self.dao_address
        }

        #[ink(message)]
        fn get_data(&self, target_function: String) -> Vec<Vec<u8>> {
            let mut result: Vec<Vec<u8>> = Vec::new();
            match target_function.as_str() {
                "get_member_list" => {
                    let list: Vec<MemberInfo> = self.get_member_list();
                    for value in list.iter() {
                        result.push(value.encode());
                    }
                }
                _ => (),
            }
            result
        }

        fn _set_dao_address_impl(
            &mut self,
            dao_address: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            self.dao_address = Some(dao_address);
            Ok(())
        }

        fn _get_command_list(&self) -> &Vec<String> {
            &self.command_list
        }

        fn _function_calling_switch(
            &mut self,
            command: String,
            vec_of_parameters: Vec<String>,
        ) -> core::result::Result<(), ContractBaseError> {
            match command.as_str() {
                "add_member" => self._add_member(vec_of_parameters),
                "delete_member" => self._delete_member(vec_of_parameters),
                _ => Err(ContractBaseError::CommnadNotFound),
            }
        }
    }

    impl DefaultMember {
        #[ink(constructor)]
        pub fn new(communication_base_ref:AccountId) -> Self {
            Self { 
                member_list_with_id: Mapping::default(),
                next_member_id: 0,
                dao_address: None,
                command_list: [
                    "add_member".to_string(),
                    "delete_member".to_string(),
                ]
                .to_vec(),
                communication_base_ref: communication_base_ref,
             }
        }

        #[ink(message)]
        pub fn get_member_list(&self) -> Vec<MemberInfo>{
            let mut result:Vec<MemberInfo> = Vec::new();
            for i in 0..self.next_member_id {
                match self.member_list_with_id.get(&i) {
                    Some(value) => result.push(value),
                    None => (),
                }
            }
            result
        }

        fn _add_member(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError> {
            match self.dao_address {
                Some(value) => {
                    if !self._modifier_only_call_from_dao(value){
                        return Err(ContractBaseError::InvalidCallingFromOrigin);
                    }
                    match vec_of_parameters.len() {
                        1 => {
                            let proposal_id = match vec_of_parameters[0].parse::<u128>(){
                                Ok(value) => value,
                                Err(_) => return Err(ContractBaseError::ParameterInvalid),
                            };
                            self._add_member_impl(proposal_id)
                        },
                        _ => Err(ContractBaseError::ParameterInvalid),
                    }
                },
                None => return Err(ContractBaseError::DaoAddressNotFound),
            }
        }

        /// Parameter csv data must have two values.
        /// <Member Name> , <Member Address>
        fn _add_member_impl(&mut self, proposal_id:u128) -> core::result::Result<(), ContractBaseError> {
            let proposal_info = match self._get_proposal_info(proposal_id) {
                Ok(value) => value,
                Err(_) => return Err(ContractBaseError::Custom("Invalid Proposal.".to_string())),
            };
            match self._valid_proposal_info_for_add(&proposal_info) {
                true => {
                    let param_vec = common_logics::change_csv_string_to_vec_of_string(proposal_info.parameters);
                    if param_vec.len() != 2 {
                        return Err(ContractBaseError::Custom("Invalid Proposal.".to_string()));
                    }
                    let member_address = match common_logics::convert_string_to_accountid(&param_vec[1]) {
                        Some(value) => value,
                        None => return Err(ContractBaseError::Custom("Invalid Proposal.".to_string())),
                    };
                    let member_info: MemberInfo = MemberInfo {
                        id: self.next_member_id,
                        name: param_vec[0].clone(),
                        address: member_address,
                    };
                    self.member_list_with_id.insert(&self.next_member_id, &member_info);
                    self.next_member_id += 1;
                    Ok(())
                },
                false => Err(ContractBaseError::Custom("Invalid Proposal.".to_string())),
            }
                
        }

        fn _valid_proposal_info_for_add(&self, proposal_info: &ProposalInfo) -> bool {
            if proposal_info.target_contract != "default_member" {
                return false;
            }
            if proposal_info.target_function != "add_member" {
                return false;
            }
            true
        }

        // todo: 
        //  どうやって、default_proposalのアドレスをこのコントラクトに連携させるか？
        //  本来はソフトウェアとしての一体感が欲しい。
        fn _get_proposal_address(&self) -> Option<AccountId> {
            None
        }


        pub fn _get_proposal_info(&self, proposal_id: u128) -> core::result::Result<ProposalInfo, ContractBaseError> {
            let proposal_address = match self._get_proposal_address() {
                Some(value) => value,
                None => return Err(ContractBaseError::Custom("Getting proposal address is failure.".to_string())),
            };
            let mut instance: CommunicationBaseRef =
                ink::env::call::FromAccountId::from_account_id(self.communication_base_ref);
            let get_value: Vec<Vec<u8>> = instance
                .get_data_from_contract(proposal_address, "get_proposal_info_list".to_string());
            for value in get_value.iter() {
                let mut array_value: &[u8] = value.as_slice().try_into().unwrap();
                match ProposalInfo::decode(&mut array_value.clone()) {
                    Ok(value) => {
                        if value.id == proposal_id {
                            return Ok(value);
                        }
                    },
                    Err(_) => return Err(ContractBaseError::Custom("Getting proposal info is failure.".to_string())),
                };
            };
            Err(ContractBaseError::Custom("No matching proposals found.".to_string()))
        }

        fn _delete_member(&self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError> {
            
            Ok(())
        }

    }

    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// We test if the default constructor does its job.
        #[ink::test]
        fn default_works() {
            let default_member = DefaultMember::default();
            assert_eq!(default_member.get(), false);
        }

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let mut default_member = DefaultMember::new(false);
            assert_eq!(default_member.get(), false);
            default_member.flip();
            assert_eq!(default_member.get(), true);
        }
    }
}
