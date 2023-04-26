#![cfg_attr(not(feature = "std"), no_std)]

#[openbrush::contract]
mod default_proposal {
    use communication_base::communication_base::CommunicationBaseRef;
    use contract_helper::common::common_logics::{self, ContractBaseError};
    use contract_helper::traits::contract_base::contract_base::*;
    use contract_helper::traits::types::types::{*, MemberInfo};
    use ink::prelude::string::{String, ToString};
    use ink::prelude::vec::Vec;
    // use ink::storage::traits::StorageLayout;
    use openbrush::storage::Mapping;
    use scale::{Decode, Encode};

    enum CheckChangingStatus {
        Valid,
        InvalidCaller,
        InvalidChangingStatus,
    }

    #[ink(storage)]
    //    #[derive(SpreadAllocate, Storage, Default)]
    pub struct DefaultProposal {
        proposal_list_with_id: Mapping<u128, ProposalInfo>,
        next_proposal_id: u128,
        dao_address: Option<AccountId>,
        election_address: Option<AccountId>,
        command_list: Vec<String>,
        member_manager_address: Option<AccountId>,
        communication_base_ref: AccountId,
        is_enable: bool,
    }

    impl ContractBase for DefaultProposal {
        /// get dao address
        #[ink(message)]
        fn get_dao_address(&self) -> Option<AccountId> {
            self.dao_address
        }

        /// get data interface
        #[ink(message)]
        fn get_data(&self, target_function: String) -> Vec<Vec<u8>> {
            let mut result: Vec<Vec<u8>> = Vec::new();
            match target_function.as_str() {
                "get_proposal_info_list" => {
                    let list: Vec<ProposalInfo> = self.get_proposal_info_list();
                    for value in list.iter() {
                        result.push(value.encode());
                    }
                }
                _ => (),
            }
            result
        }

        /// [private] function set dao address
        fn _set_dao_address_impl(
            &mut self,
            dao_address: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
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
                "add_proposal" => self._add_proposal(vec_of_parameters, caller),
                "change_proposal_status" => self._change_proposal_status(vec_of_parameters, caller),
                "change_enable_or_not" => self._change_enable_or_not(vec_of_parameters),
                "execute_proposal" => self._execute_proposal(vec_of_parameters),
                "set_dao_address" => self._set_dao_address(vec_of_parameters),
                // "update_member_manager" => self._update_member_manager(vec_of_parameters),
                // "update_election" => self._update_election(vec_of_parameters),
                _ => Err(ContractBaseError::CommnadNotFound),
            }
        }

        /// [private] change status whether this contract can use
        fn _change_enable_or_not(
            &mut self,
            vec_of_parameters: Vec<String>,
        ) -> core::result::Result<(), ContractBaseError> {
            match self.dao_address {
                Some(value) => {
                    if !self._modifier_only_call_from_dao(value) {
                        return Err(ContractBaseError::InvalidCallingFromOrigin);
                    }
                }
                None => return Err(ContractBaseError::TheAddressNotFound),
            };
            match vec_of_parameters.len() == 1 {
                true => {
                    match bool::from_str(&vec_of_parameters[0]) {
                        Ok(value) => {
                            self.is_enable = value;
                            Ok(())
                        },
                        Err(_) => {
                            return Err(ContractBaseError::ParameterInvalid),
                        }
                    }
                },
                false => return Err(ContractNotFound::ParameterInvalid),
            }
        }
    }

    impl DefaultProposal {
        /// constructor
        #[ink(constructor)]
        pub fn new(communication_base_ref: AccountId) -> Self {
            Self {
                proposal_list_with_id: Mapping::default(),
                next_proposal_id: 0,
                dao_address: None,
                election_address: None,
                command_list: [
                    "add_proposal".to_string(),
                    "change_proposal_status".to_string(),
                    "change_enable_or_not".to_string(),
                    "execute_proposal".to_string(),
                    "set_dao_address".to_string(),
                    "update_member_manager".to_string(),
                    "update_election".to_string(),
                ]
                .to_vec(),
                member_manager_address: None,
                communication_base_ref: communication_base_ref,
            }
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

        /// set election address
        #[ink(message)]
        pub fn set_election_address(&mut self, election_address: AccountId) -> core::result::Result<(), ContractBaseError>{
            match self.election_address {
                Some(_value) => return Err(ContractBaseError::SetTheAddressOnlyOnece),
                None => self.election_address = Some(election_address),
            }
            Ok(())
        }

        /// update member manager
        pub fn _update_member_manager(&mut self, vec_of_parameters:Vec<String>) -> core::result::Result<(), ContractBaseError> {
            if vec_of_parameters.len() != 1{
                return Err(ContractBaseError::ParameterInvalid);
            }
            let address = match common_logics::convert_string_to_accountid(vec_of_parameters[0]) {
                Some(value) => value,
                None => return Err(ContractBaseError::ParameterInvalid),
            };
            self.member_manager_address = Some(address);
            Ok(())
        }

        /// update election
        pub fn _update_election(&mut self, vec_of_parameters:Vec<String>)  -> core::result::Result<(), ContractBaseError>{
            if vec_of_parameters.len() != 1{
                return Err(ContractBaseError::ParameterInvalid);
            }
            let address = match common_logics::convert_string_to_accountid(vec_of_parameters[0]) {
                Some(value) => value,
                None => return Err(ContractBaseError::ParameterInvalid),
            };
            self.election_address = Some(address);
            Ok(())
        }

        /// get proposal list
        #[ink(message)]
        pub fn get_proposal_info_list(&self) -> Vec<ProposalInfo> {
            let mut result: Vec<ProposalInfo> = Vec::new();
            for i in 0..self.next_proposal_id {
                match self.proposal_list_with_id.get(&i) {
                    Some(value) => result.push(value),
                    None => (),
                }
            }
            result
        }

        /// execute proposal
        fn _execute_proposal(
            &mut self,
            vec_of_parameters: Vec<String>,
        ) -> core::result::Result<(), ContractBaseError> {
            if self._modifier_only_call_from_dao(self.env().caller()) == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            match vec_of_parameters.len() {
                1 => {
                    let proposal_id =
                        match common_logics::convert_string_to_u128(&vec_of_parameters[0]) {
                            Ok(value) => value,
                            Err(error) => return Err(error),
                        };
                    let proposal_info: ProposalInfo =
                        match self.proposal_list_with_id.get(&proposal_id) {
                            Some(value) => value,
                            None => return Err(ContractBaseError::ParameterInvalid),
                        };
                    if proposal_info.status == ProposalStatus::Executed {
                        return Err(ContractBaseError::Custom("TheProposalIsNotPassed"));
                    }
                    match proposal_info.target_contract == self.env().account_id() {
                        true =>{
                            match proposal_info.target_function.as_str() {
                                "update_member_manager" => return self._update_member_manager(proposal_info.parameters.clone()),
                                "update_election" => return self._update_election(proposal_info.parameters.clone()),
                                _ => return Err(ContractBaseError::Custom("TheProposalIsInvalid")),
                            }
                        },
                        false => {
                            let mut instance: CommunicationBaseRef =
                                ink::env::call::FromAccountId::from_account_id(self.communication_base_ref);
                            instance.call_execute_interface_of_function(
                                proposal_info.target_contract.clone(),
                                proposal_info.target_function.clone(),
                                proposal_info.parameters.clone(),
                            );    
                        }
                    }
                }
                _ => return Err(ContractBaseError::ParameterInvalid),
            }
            Ok(())
        }

        /// add proposal
        fn _add_proposal(
            &mut self,
            vec_of_parameters: Vec<String>,
            caller: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            if self._modifier_only_call_from_dao(self.env().caller()) == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            if self._modifier_only_call_from_member_eoa(caller) == false {
                return Err(ContractBaseError::Custom("Only Member does.".to_string()));
            }
            if vec_of_parameters.len() != 8 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            self._add_proposal_impl(
                &vec_of_parameters[0],
                &vec_of_parameters[1],
                &vec_of_parameters[2],
                &vec_of_parameters[3],
                &vec_of_parameters[4],
                &vec_of_parameters[5],
                &vec_of_parameters[6],
                &vec_of_parameters[7],
            )
        }

        /// add proposal impl
        fn _add_proposal_impl(
            &mut self,
            kind: &String,
            title: &String,
            outline: &String,
            github_url: &String,
            description: &String,
            target_contract: &String,
            target_function: &String,
            parameters: &String,
        ) -> core::result::Result<(), ContractBaseError> {
            let contract_address = match common_logics::convert_string_to_accountid(target_contract)
            {
                Some(value) => value,
                None => {
                    return Err(ContractBaseError::Custom(
                        "Target contract is invalid.".to_string(),
                    ))
                }
            };
            let proposal_kind = match u8::from_str_radix(kind.as_str(), 10) {
                Ok(value) => self._change_to_kind_from_u8(value),
                Err(_e) => return Err(ContractBaseError::ParameterInvalid),
            };

            let proposal_info = ProposalInfo {
                kind: proposal_kind,
                id: self.next_proposal_id,
                title: title.to_string(),
                outline: outline.to_string(),
                github_url: github_url.to_string(),
                description: description.to_string(),
                target_contract: contract_address,
                target_function: target_function.to_string(),
                parameters: parameters.to_string(),
                status: ProposalStatus::Proposed,
            };
            self.proposal_list_with_id
                .insert(&proposal_info.id, &proposal_info);
            
            match self._create_vote_or_election(self.next_proposal_id, ProposalStatus::Proposed) {
                Ok(())=> {
                    self.next_proposal_id += 1;
                    Ok(())
                },
                Err(error) => Err(error),
            }
        }

        fn _change_proposal_status(
            &mut self,
            vec_of_parameters: Vec<String>,
            caller: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            if self._modifier_only_call_from_dao(self.env().caller()) == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            if self._modifier_only_call_from_election_commisioner(caller) == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }

            // if self._modifier_only_call_from_election() == false {
            //     return Err(ContractBaseError::InvalidCallingFromOrigin);
            // };
            if vec_of_parameters.len() != 2 {
                return Err(ContractBaseError::ParameterInvalid);
            };
            let target_proposal_id = match u128::from_str_radix(vec_of_parameters[0].as_str(), 10) {
                Ok(value) => value,
                Err(_e) => return Err(ContractBaseError::ParameterInvalid),
            };
            let to_status_u8 = match u8::from_str_radix(vec_of_parameters[1].as_str(), 10) {
                Ok(value) => value,
                Err(_e) => return Err(ContractBaseError::ParameterInvalid),
            };
            self._change_proposal_status_impl(
                target_proposal_id,
                self._change_to_status_from_u8(to_status_u8),
                caller,
            )
        }

        fn _change_proposal_status_impl(
            &mut self,
            target_proposal_id: u128,
            to_status: ProposalStatus,
            caller: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            let mut proposal_info = match self.proposal_list_with_id.get(&target_proposal_id) {
                Some(value) => value,
                None => return Err(ContractBaseError::TragetDataNotFound),
            };
            match self._check_changing_status_valid(&proposal_info.status, &to_status, caller) {
                CheckChangingStatus::Valid => (),
                _ => {
                    return Err(ContractBaseError::Custom(
                        "Changing Status Is Invalid".to_string(),
                    ))
                }
            };
            proposal_info.status = to_status.clone();
            self.proposal_list_with_id
                .insert(&proposal_info.id, &proposal_info);

            self._create_vote_or_election(proposal_info.id, to_status)
        }

        fn _check_changing_status_valid(
            &self,
            from_status: &ProposalStatus,
            to_status: &ProposalStatus,
            caller: AccountId,
        ) -> CheckChangingStatus {
            match from_status {
                ProposalStatus::None => match to_status {
                    ProposalStatus::Proposed => {
                        if self._modifier_only_call_from_member_eoa(caller) == false {
                            return CheckChangingStatus::InvalidCaller;
                        } else {
                            return CheckChangingStatus::Valid;
                        }
                    }
                    _ => CheckChangingStatus::InvalidChangingStatus,
                },
                ProposalStatus::Proposed => match to_status {
                    ProposalStatus::Voting | ProposalStatus::Denied => {
                        if self._modifier_only_call_from_member_eoa(caller) == false {
                            return CheckChangingStatus::InvalidCaller;
                        } else {
                            return CheckChangingStatus::Valid;
                        }
                    }
                    _ => CheckChangingStatus::InvalidChangingStatus,
                },
                ProposalStatus::Voting => match to_status {
                    ProposalStatus::FinishVoting => {
                        if self._modifier_only_call_from_member_eoa(caller) == false {
                            return CheckChangingStatus::InvalidCaller;
                        } else {
                            return CheckChangingStatus::Valid;
                        }
                    }
                    _ => CheckChangingStatus::InvalidChangingStatus,
                },
                ProposalStatus::FinishVoting => match to_status {
                    ProposalStatus::Executed | ProposalStatus::Denied => CheckChangingStatus::Valid,
                    _ => CheckChangingStatus::InvalidChangingStatus,
                },
                _ => CheckChangingStatus::InvalidChangingStatus,
            }
        }

        fn _change_to_status_from_u8(&self, value: u8) -> ProposalStatus {
            match value {
                1 => ProposalStatus::Proposed,
                2 => ProposalStatus::Voting,
                3 => ProposalStatus::FinishVoting,
                4 => ProposalStatus::Executed,
                5 => ProposalStatus::Denied,
                _ => ProposalStatus::None,
            }
        }

        fn _change_to_kind_from_u8(&self, value: u8) -> ProposalKind {
            match value {
                1 => ProposalKind::ResetElectionCommisioner,
                2 => ProposalKind::Other,
                _ => ProposalKind::None,
            }
        }

        /// create vote or election
        fn _create_or_end_election_(
            &self,
            proposal_id: u128,
            to_status: ProposalStatus,
        ) -> core::result::Result<(), ContractBaseError> {
            let mut instance: CommunicationBaseRef =
                ink::env::call::FromAccountId::from_account_id(self.communication_base_ref);
            match to_status {
                ProposalStatus::Proposed => {
                    return instance.call_execute_interface_of_function(
                        self.election_address,
                        "create_election",
                        proposal_id.to_string(),
                    );            
                },
                ProposalStatus::FinishVoting => {
                    let member_count = match self._get_member_info_list() {
                        Ok(member_list) => member_list.len(),
                        Err(error) => Err(error),
                    };
                    let parameter = proposal_id.to_string() + "," + member_count.to_string();

                    return instance.call_execute_interface_of_function(
                        self.election_address,
                        "end_election",
                        parameter,
                    );            
                },
                _ => (),
            }
            Ok(())
        }

        fn _modifier_only_call_from_election(&self) -> bool {
            match self.election_address {
                Some(value) => value == self.env().caller(),
                None => false,
            }
        }

        fn _modifier_only_call_from_election_commisioner(&self, caller: AccountId) -> bool {
            let member_manager_address = match self.member_manager_address {
                Some(value) => value,
                None => return false,
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
                    Ok(value) => {
                        if value.address == caller {
                            return true;
                        }
                    }
                    Err(_) => return false,
                };
            }
            false
        }

        fn _modifier_only_call_from_member_eoa(&self, caller: AccountId) -> bool {
            match self._get_member_info_list() {
                Ok(member_list) => member_list.contains(&caller),
                Err(_) => false,
            }

            let member_manager_address = match self.member_manager_address {
                Some(value) => value,
                None => return false,
            };
            let instance: CommunicationBaseRef =
                ink::env::call::FromAccountId::from_account_id(self.communication_base_ref);
            let get_value: Vec<Vec<u8>> = instance
                .get_data_from_contract(member_manager_address, "get_member_list".to_string());
            for value in get_value.iter() {
                let array_value: &[u8] = value.as_slice().try_into().unwrap();
                match MemberInfo::decode(&mut array_value.clone()) {
                    Ok(value) => {
                        if value.address == caller {
                            return true;
                        }
                    }
                    Err(_) => return false,
                };
            }
            false
        }

        fn _get_member_info_list(&self) -> core::result::Result<Vec<MemberInfo>, ContractBaseError> {
            let member_manager_address = match self.member_manager_address {
                Some(value) => value,
                None => Err(ContractBaseError::Custom("MemberManagerAddressIsNotSet")),
            };
            let mut result:Vec<MemberInfo> = Vec::new();
            let instance: CommunicationBaseRef =
                ink::env::call::FromAccountId::from_account_id(self.communication_base_ref);
            let get_value: Vec<Vec<u8>> = instance
                .get_data_from_contract(member_manager_address, "get_member_list".to_string());
            for value in get_value.iter() {
                let array_value: &[u8] = value.as_slice().try_into().unwrap();
                match MemberInfo::decode(&mut array_value.clone()) {
                    Ok(value) => result.push(value),
                    Err(_) => return Err(ContractBaseError::Custom("GotAnErrorGettingMemberInfo")),
                };
            }
            Ok(result)
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use contract_helper::common::common_logics;

        #[ink::test]
        fn set_dao_address_works() {
            let election_address = common_logics::convert_string_to_accountid(
                "ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR",
            );
            let mut default_proposal = DefaultProposal::new();
            let dao_address = common_logics::convert_string_to_accountid(
                "ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8",
            );
            assert_eq!(default_proposal.set_dao_address(dao_address), Ok(()));
            // set_dao_address twice is error
            assert_eq!(
                default_proposal.set_dao_address(dao_address),
                Err(ContractBaseError::SetTheAddressOnlyOnece)
            );
        }

        // get dao_address
        #[ink::test]
        fn get_dao_address_works() {
            let election_address = common_logics::convert_string_to_accountid(
                "ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR",
            );
            let mut default_proposal = DefaultProposal::new();
            let dao_address = common_logics::convert_string_to_accountid(
                "ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8",
            );
            assert_eq!(default_proposal.set_dao_address(dao_address), Ok(()));
            assert_eq!(default_proposal.get_dao_address().unwrap(), dao_address);
        }

        // add proposal works
        #[ink::test]
        fn add_proposal_works() {
            let election_address = common_logics::convert_string_to_accountid(
                "ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR",
            );
            let mut default_proposal = DefaultProposal::new();
            let dao_address = common_logics::convert_string_to_accountid(
                "ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8",
            );
            assert_eq!(default_proposal.set_dao_address(dao_address), Ok(()));
            ink::env::test::set_caller::<Environment>(dao_address);
            let result = default_proposal.execute_interface(
                "add_proposal".to_string(),
                "title title,outline,https://github.com,This is description,add_member,address"
                    .to_string(),
            );
            assert_eq!(result, Ok(()));

            let list = default_proposal.get_proposal_info_list();
            assert_eq!(list.len(), 1);
        }

        // change status
        // #[ink::test]
        // fn change_status_works(){
        //     let election_address = common_logics::convert_string_to_accountid("ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR");
        //     let mut default_proposal = DefaultProposal::new(election_address);
        // }

        // command_not_found
        #[ink::test]
        fn command_not_found_is_error() {
            let election_address = common_logics::convert_string_to_accountid(
                "ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR",
            );
            let mut default_proposal = DefaultProposal::new();
            let dao_address = common_logics::convert_string_to_accountid(
                "ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8",
            );
            assert_eq!(default_proposal.set_dao_address(dao_address), Ok(()));
            let mut default_proposal = DefaultProposal::new();
            assert_eq!(
                default_proposal.execute_interface(
                    "this_command_is_not_found".to_string(),
                    "ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8,aaaaaa".to_string(),
                ),
                Err(ContractBaseError::CommnadNotFound)
            );
        }
    }
}
