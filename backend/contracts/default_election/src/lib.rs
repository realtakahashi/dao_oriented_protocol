#![cfg_attr(not(feature = "std"), no_std)]

#[openbrush::contract]
mod default_election {
    use communication_base::communication_base::CommunicationBaseRef;
    use contract_helper::traits::contract_base::contract_base::*;
    use contract_helper::traits::types::types::{*, ElectionInfo};
//    use contract_helper::traits::errors::contract_error::*;
    use core::str::FromStr;
    use contract_helper::common::common_logics::{self, ContractBaseError};
    use ink::prelude::string::{String, ToString};
    use ink::prelude::vec::Vec;
    use openbrush::{storage::Mapping};
    use scale::{Decode, Encode};


    #[ink(storage)]
    pub struct DefaultElection {
        election_list_with_proposal_id: Mapping<u128, ElectionInfo>,
        election_list_with_election_id: Mapping<u128, ElectionInfo>,
        minimum_voter_turnout_percentage: u64,
        passing_percentage: u64,
        dao_address:Option<AccountId>,
        remain_term_electoral_commissioner: u8,
        next_election_id: u128,
        command_list: Vec<String>,
        proposal_manager_address: Option<AccountId>,
        is_enable: bool,
        communication_base_ref: AccountId,
        member_manager_address: Option<AccountId>,
    }

    impl ContractBase for DefaultElection {
        #[ink(message)]
        fn get_dao_address(&self) -> Option<AccountId> {
            self.dao_address
        }

        /// get data interface
        #[ink(message)]
        fn get_data(&self, target_function: String) -> Vec<Vec<u8>> {
            let mut result: Vec<Vec<u8>> = Vec::new();
            // todo: 未修正
            match target_function.as_str() {
                "get_election_info_list" => {
                    let list: Vec<ElectionInfo> = self.get_election_info_list();
                    for value in list.iter() {
                        result.push(value.encode());
                    }
                }
                _ => (),
            }
            result
        }

        fn _set_dao_address_impl(&mut self, dao_address:AccountId) -> core::result::Result<(), ContractBaseError>{
            match self.dao_address {
                Some(_value) => return Err(ContractBaseError::SetTheAddressOnlyOnece),
                None => self.dao_address = Some(dao_address),
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
            caller: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            match command.as_str() {
                "create_election" => self._create_electtion(vec_of_parameters),
                // "start_election" => self._start_election(vec_of_parameters),
                "vote" => self._vote(vec_of_parameters, caller),
                "end_election" => self._end_election(vec_of_parameters),
                "reset_minimum_voter_turnout_percentage" => self._reset_minimum_voter_turnout_percentage(vec_of_parameters),
                "reset_passing_percentage" => self._reset_passing_percentage(vec_of_parameters),
                // "change_enable_or_not" => self._change_enable_or_not(vec_of_parameters),
                "set_dao_address" => self._set_dao_address(vec_of_parameters),
                "update_proposal_manager_address" => self._update_proposal_manager_address(vec_of_parameters),
                _ => Err(ContractBaseError::CommnadNotFound),
            }
        }

        // /// [private] change status whether this contract can use
        // fn _change_enable_or_not(
        //     &mut self,
        //     vec_of_parameters: Vec<String>,
        // ) -> core::result::Result<(), ContractBaseError> {
        //     match self.dao_address {
        //         Some(value) => {
        //             if !self._modifier_only_call_from_dao(value) {
        //                 return Err(ContractBaseError::InvalidCallingFromOrigin);
        //             }
        //         }
        //         None => return Err(ContractBaseError::TheAddressNotFound),
        //     };
        //     match vec_of_parameters.len() == 1 {
        //         true => {
        //             match bool::from_str(&vec_of_parameters[0]) {
        //                 Ok(value) => {
        //                     self.is_enable = value;
        //                     Ok(())
        //                 },
        //                 Err(_) => return Err(ContractBaseError::ParameterInvalid),
        //             }
        //         },
        //         false => return Err(ContractBaseError::ParameterInvalid),
        //     }
        // }

    }

    impl DefaultElection {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new(communication_base_ref:AccountId) -> Self {
            Self{
                election_list_with_proposal_id: Mapping::default(),
                election_list_with_election_id: Mapping::default(),
                minimum_voter_turnout_percentage: 70,
                passing_percentage: 70,
                dao_address: None,
                remain_term_electoral_commissioner:5,
                next_election_id: 0,
                command_list:[
                    "create_election".to_string(),
                    // "start_election".to_string(),
                    "vote".to_string(),
                    "end_election".to_string(),
                    "reset_minimum_voter_turnout_percentage".to_string(),
                    "reset_passing_percentage".to_string(),
                    // "change_enable_or_not".to_string(),
                    "set_dao_address".to_string(),
                    "update_proposal_manager_address".to_string(),
                ].to_vec(),
                is_enable: false,
                communication_base_ref: communication_base_ref,
                member_manager_address: None,
                proposal_manager_address: None,
            }
        }

        #[ink(message)]
        pub fn set_proposal_manager_address(&mut self, proposal_manager_address: AccountId) -> core::result::Result<(), ContractBaseError> {
            match self.proposal_manager_address {
                Some(_value) => return Err(ContractBaseError::SetTheAddressOnlyOnece),
                None => self.proposal_manager_address = Some(proposal_manager_address),
            }
            Ok(())
        }

        #[ink(message)]
        pub fn get_election_info_list(&self) -> Vec<ElectionInfo> {
            let mut result:Vec<ElectionInfo> = Vec::new();
            for i in 0..self.next_election_id {
                let election_info = match self.election_list_with_election_id.get(&i) {
                    Some(value) => value,
                    None => continue,
                };
                result.push(election_info);
            }
            result
        }

        /// set member manager address
        #[ink(message)]
        pub fn set_member_manager_address(&mut self, member_manager_address: AccountId)-> core::result::Result<(), ContractBaseError> {
            match self.member_manager_address {
                Some(_value) => return Err(ContractBaseError::SetTheAddressOnlyOnece),
                None => self.member_manager_address = Some(member_manager_address),
            }
            Ok(())
        }

        /// _update_proposal_manager_address
        /// parameters: proposal_manager_address: AccountId
        fn _update_proposal_manager_address(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>{
            if self._modifier_only_call_from_proposal() == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            if vec_of_parameters.len() != 1{
                return Err(ContractBaseError::ParameterInvalid);
            }
            let address = match common_logics::convert_string_to_accountid(&vec_of_parameters[0]) {
                Some(value) => value,
                None => return Err(ContractBaseError::ParameterInvalid),
            };
            self.proposal_manager_address = Some(address);
            Ok(())
        }

        /// update member manager
        pub fn _update_member_manager(&mut self, vec_of_parameters:Vec<String>) -> core::result::Result<(), ContractBaseError> {
            if vec_of_parameters.len() != 1{
                return Err(ContractBaseError::ParameterInvalid);
            }
            let address = match common_logics::convert_string_to_accountid(&vec_of_parameters[0]) {
                Some(value) => value,
                None => return Err(ContractBaseError::ParameterInvalid),
            };
            self.member_manager_address = Some(address);
            Ok(())
        }

        fn _create_electtion(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>{
            if self._modifier_only_call_from_proposal() == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            };
            match vec_of_parameters.len() == 1 {
                true => {
                    let proposal_id =
                        match common_logics::convert_string_to_u128(&vec_of_parameters[0]) {
                            Ok(value) => value,
                            Err(error) => return Err(error),
                        };
                        let proposal_info = match self._get_proposal_info(proposal_id) {
                            Some(value) => value,
                            None => return Err(ContractBaseError::Custom("InvalidProposal.".to_string())),
                        };
                        if self.remain_term_electoral_commissioner == 0 && proposal_info.kind != ProposalKind::ResetElectionCommisioner {
                            return Err(ContractBaseError::Custom("YouMutResetElectionCommisioner.".to_string()));
                        }            
                    let election_list = match self._get_election_commisioner_list() {
                        Ok(value) => value,
                        Err(error) => return Err(error),
                    };
                    let election_info:ElectionInfo = ElectionInfo {
                        id: self.next_election_id,
                        proposal_id: proposal_id,
                        minimum_voter_turnout_percentage: self.minimum_voter_turnout_percentage,
                        passing_percentage: self.passing_percentage,
                        number_of_votes: 0,
                        count_of_yes: 0,
                        count_of_no: 0,
                        list_of_voters: Vec::default(),
                        list_of_electoral_commissioner: election_list,
                        is_passed: false,                
                    };
                    self.election_list_with_proposal_id.insert(&proposal_id, &election_info);
                    self.election_list_with_election_id.insert(&self.next_election_id, &election_info);
                    self.next_election_id += 1;
                    self.remain_term_electoral_commissioner -= 0;
                },
                false => return Err(ContractBaseError::ParameterInvalid),
            };
            Ok(())
        }

        /// vote: this function is called by application_core
        /// parameter: proposal_id , yes_or_no("yes" or "no" String)
        fn _vote(&mut self, vec_of_parameters: Vec<String>, caller:AccountId) -> core::result::Result<(), ContractBaseError>{
            if self._modifier_only_call_from_dao(caller) == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            if vec_of_parameters.len() != 2 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            let proposal_id_string = vec_of_parameters[0].clone();
            let yes_or_no_string = &vec_of_parameters[1].clone();
            let proposal_id = match common_logics::convert_string_to_u128(&proposal_id_string) {
                Ok(value) => value,
                Err(error) => return Err(error),
            };
            let proposal_info = match self._get_proposal_info(proposal_id) {
                Some(value) => value,
                None => return Err(ContractBaseError::Custom("InvalidProposal.".to_string())),
            };
            if proposal_info.status != ProposalStatus::Voting {
                return Err(ContractBaseError::Custom("ProposalStatusIsInvalid".to_string()));
            } 
            let mut election_info = match self.election_list_with_proposal_id.get(&proposal_id){
                Some(value) => value,
                None => return Err(ContractBaseError::Custom("ElectionInfoNotFound".to_string())),
            };
            if election_info.list_of_voters.contains(&caller){
                return Err(ContractBaseError::Custom("YouHaveAlreadyVoted".to_string()));
            }
            match yes_or_no_string.as_str() {
                "yes" => election_info.count_of_yes += 1,
                "no" => election_info.count_of_no += 1,
                _ => return Err(ContractBaseError::ParameterInvalid),
            };
            election_info.number_of_votes += 1;
            election_info.list_of_voters.push(caller);
            self.election_list_with_proposal_id.insert(&proposal_id, &election_info);
            Ok(())
        }

        // fn _start_election(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>{
        //     Ok(())
        // }

        /// end election
        /// parameter: proposal_id, number_of_member
        fn _end_election(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>{
            if self._modifier_only_call_from_proposal() == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }

            if vec_of_parameters.len() != 2 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            let number_of_member_string = vec_of_parameters[1].clone();
            let number_of_member = match common_logics::convert_string_to_u64(&number_of_member_string) {
                Ok(value) => value,
                Err(error) => return Err(error),
            };

            let proposal_id_string = vec_of_parameters[0].clone();
            let proposal_id = match common_logics::convert_string_to_u128(&proposal_id_string) {
                Ok(value) => value,
                Err(error) => return Err(error),
            };
            let mut election_info = match self.election_list_with_proposal_id.get(&proposal_id) {
                Some(value) => value,
                None => return Err(ContractBaseError::Custom("electionDoesNotFound".to_string())),
            };
            
            match (election_info.number_of_votes / number_of_member * 100) >= election_info.minimum_voter_turnout_percentage {
                true => {
                    match (election_info.count_of_yes / election_info.number_of_votes * 100) >= election_info.passing_percentage {
                        true => {
                            election_info.is_passed = true;
                            match self._update_proposal_info(proposal_id, 6){ //6: ProposalStatus -> Finished
                                Ok(()) => (),
                                Err(error) => Err(error),
                            }
                        },
                        false => {
                            election_info.is_passed = false;
                            match self._update_proposal_info(proposal_id, 5){ //5: PropsaolStatus -> Denied
                                Ok(()) => (),
                                Err(error) => Err(error),
                            }
                        }
                    }
                },
                false => election_info.is_passed = false,
            }

            Ok(())
        }
        
        /// _update_proposal_info
        fn _update_proposal_info(&mut self, proposal_if:u128, to_status_u8:u8) -> core::result::Result<(), ContractBaseError>{
            let proposal_manager_address = match self.proposal_manager_address {
                Some(value) => value,
                None => return Err(ContractBaseError::TheAddressNotFound),
            };

            let params:String = proposal_id.to_string() + "," + to_status_u8.to_string();
            let mut instance: CommunicationBaseRef =
                ink::env::call::FromAccountId::from_account_id(self.communication_base_ref);
            match to_status {
                ProposalStatus::Proposed => {
                    return instance.call_execute_interface_of_function(
                        proposal_manager_address,
                        "change_proposal_status_from_election".to_string(),
                        params,
                    );
                }

        }

        /// _reset_minimum_voter_turnout_percentage
        /// parameter: minimum_voter_turnout_percentage
        fn _reset_minimum_voter_turnout_percentage(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>{
            if self._modifier_only_call_from_proposal() == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            if vec_of_parameters.len() != 1{
                return Err(ContractBaseError::ParameterInvalid);
            }
            let percentage = match common_logics::convert_string_to_u64(&vec_of_parameters[0]) {
                Ok(value) => value,
                Err(error) => return Err(error),
            };

            self.minimum_voter_turnout_percentage = percentage;
            Ok(())
        }

        /// _reset_passing_percentage
        /// parameter: passing_percentage
        fn _reset_passing_percentage(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>{
            if self._modifier_only_call_from_proposal() == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            if vec_of_parameters.len() != 1{
                return Err(ContractBaseError::ParameterInvalid);
            }
            let percentage = match common_logics::convert_string_to_u64(&vec_of_parameters[0]) {
                Ok(value) => value,
                Err(error) => return Err(error),
            };

            self.passing_percentage = percentage;
            Ok(())
        }

        fn _get_election_commisioner_list(&self) -> core::result::Result<Vec<AccountId>, ContractBaseError>{
            let mut result:Vec<AccountId> = Vec::new();
            let member_manager_address = match self.member_manager_address {
                Some(value) => value,
                None => return Err(ContractBaseError::TheAddressNotFound),
            };
            let instance: CommunicationBaseRef =
                ink::env::call::FromAccountId::from_account_id(self.communication_base_ref);
            let get_value: Vec<Vec<u8>> = instance.get_data_from_contract(
                member_manager_address,
                "get_election_commisioner_list".to_string(),
            );
            for value in get_value.iter() {
                let array_value: &[u8] = value.as_slice().try_into().unwrap();
                match MemberInfo::decode(&mut array_value.clone()) {
                    Ok(value) => result.push(value.address),
                    Err(_) => return Err(ContractBaseError::Custom("get_election_commisioner_list error".to_string())),
                }
            }
            Ok(result)
        }

        fn _get_proposal_info(&self, proposal_id:u128) -> Option<ProposalInfo> {
            let proposal_manager_address = match self.proposal_manager_address {
                Some(value) => value,
                None => return None,
            };
            let instance: CommunicationBaseRef =
                ink::env::call::FromAccountId::from_account_id(self.communication_base_ref);
            let get_value: Vec<Vec<u8>> = instance.get_data_from_contract(
                proposal_manager_address,
                "get_proposal_info_list".to_string(),
            );
            for value in get_value.iter() {
                let array_value: &[u8] = value.as_slice().try_into().unwrap();
                match ProposalInfo::decode(&mut array_value.clone()) {
                    Ok(value) => {
                        if value.id == proposal_id {
                            return Some(value);
                        }
                    },
                    Err(_) => return None,
                }
            }
            None
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
            let default_election = DefaultElection::default();
            assert_eq!(default_election.get(), false);
        }

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let mut default_election = DefaultElection::new(false);
            assert_eq!(default_election.get(), false);
            default_election.flip();
            assert_eq!(default_election.get(), true);
        }
    }
}
