#![cfg_attr(not(feature = "std"), no_std)]

#[openbrush::contract]
mod default_proposal {
    use contract_helper::traits::contract_base::contract_base::*;
    use ink::prelude::string::{String, ToString};
    use ink::prelude::vec::Vec;
    use openbrush::storage::Mapping;
    use ink::storage::traits::StorageLayout;

    // #[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    // #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    // pub enum ProposalStatus {
    //     /// initial value
    //     None,
    //     /// proposed
    //     Proposed,
    //     /// voting
    //     Voting,
    //     /// Finish Voting
    //     FinishVoting,
    //     /// executed
    //     Executed,
    //     /// denied
    //     Denied,
    // }

    // #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    // #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    // pub enum Error {
    //     // IsAlreadySetDaoAddress,
    //     // OnlyFromDaoAddress,
    //     ContractBaseError(ContractBaseError),
    // }

    // impl From<ContractBaseError> for Error {
    //     fn from(error: ContractBaseError) -> Self {
    //         Error::ContractBaseError(error)
    //     }
    // }

    // pub type Result<T> = core::result::Result<T, Error>;

    #[ink(storage)]
    //    #[derive(SpreadAllocate, Storage, Default)]
    pub struct DefaultProposal {
        proposal_list_with_id: Mapping<u128, ProposalInfo>,
        next_proposal_id: u128,
        dao_address: Option<AccountId>,
        // election_address: AccountId,
        command_list: Vec<String>,
    }

    impl ContractBase for DefaultProposal {
        #[ink(message)]
        fn get_dao_address(&self) -> Option<AccountId> {
            self.dao_address
        }

        #[ink(message)]
        fn get_caller_check_specs(&self, command:String) -> Option<CallerCheckSpecs>{
            match command.as_str() {
                "add_proposal" => Some(CallerCheckSpecs::DaoMemeber),
                _ => None,
            }
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
                "add_proposal" => self._add_proposal(vec_of_parameters),
                // "change_proposal_status" => self._change_proposal_status(vec_of_parameters),
                _ => Err(ContractBaseError::CommnadNotFound),
            }
        }

    }

    impl DefaultProposal {
        #[ink(constructor)]
        pub fn new() -> Self {
        // pub fn new(election_address: AccountId) -> Self {
                Self {
                proposal_list_with_id: Mapping::default(),
                next_proposal_id: 0,
                dao_address: None,
                // election_address: election_address,
                command_list: [
                    "add_proposal".to_string(),
                    // "change_proposal_status".to_string(),
                ].to_vec(),
            }
        }

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

        fn _add_proposal(
            &mut self,
            vec_of_parameters: Vec<String>,
        ) -> core::result::Result<(), ContractBaseError> {
            if self._modifier_only_call_from_dao(self.env().caller()) == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            if vec_of_parameters.len() != 6 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            self._add_proposal_impl(
                &vec_of_parameters[0],
                &vec_of_parameters[1],
                &vec_of_parameters[2],
                &vec_of_parameters[3],
                &vec_of_parameters[4],
                &vec_of_parameters[5],
            )
        }

        fn _add_proposal_impl(
            &mut self,
            title: &String,
            outline: &String,
            github_url: &String,
            description: &String,
            target_function: &String,
            parameters: &String
        ) -> core::result::Result<(), ContractBaseError> {
            let proposal_info = ProposalInfo {
                id: self.next_proposal_id,
                title: title.to_string(),
                outline: outline.to_string(),
                github_url: github_url.to_string(),
                description: description.to_string(),
                target_function: target_function.to_string(),
                parameters: parameters.to_string(),
            };
            self.proposal_list_with_id
                .insert(&proposal_info.id, &proposal_info);
            self.next_proposal_id += 1;
            Ok(())
        }

        // fn _change_proposal_status(
        //     &mut self,
        //     vec_of_parameters: Vec<String>,
        // ) -> core::result::Result<(), ContractBaseError> {
        //     if self._modifier_only_call_from_election() == false {
        //         return Err(ContractBaseError::InvalidCallingFromOrigin);
        //     };
        //     if vec_of_parameters.len() != 2 {
        //         return Err(ContractBaseError::ParameterInvalid);
        //     };
        //     let target_proposal_id = match u128::from_str_radix(vec_of_parameters[0].as_str(), 10) {
        //         Ok(value) => value,
        //         Err(_e) => return Err(ContractBaseError::ParameterInvalid),
        //     };
        //     let to_status_u8 = match u8::from_str_radix(vec_of_parameters[1].as_str(), 10) {
        //         Ok(value) => value,
        //         Err(_e) => return Err(ContractBaseError::ParameterInvalid),
        //     };
        //     self._change_proposal_status_impl(
        //         target_proposal_id,
        //         self._change_to_status_from_u8(to_status_u8),
        //     )
        // }

        // fn _change_proposal_status_impl(
        //     &mut self,
        //     target_proposal_id: u128,
        //     to_status: ProposalStatus,
        // ) -> core::result::Result<(), ContractBaseError> {
        //     let mut proposal_info = match self.proposal_list_with_id.get(&target_proposal_id) {
        //         Some(value) => value,
        //         None => return Err(ContractBaseError::TragetDataNotFound),
        //     };
        //     if self._check_changing_status_valid(&proposal_info.status, &to_status) == false {
        //         return Err(ContractBaseError::Custom(
        //             "Changing Status Is Invalid".to_string(),
        //         ));
        //     };
        //     proposal_info.status = to_status;
        //     self.proposal_list_with_id
        //         .insert(&proposal_info.id, &proposal_info);
        //     Ok(())
        // }

        // fn _check_changing_status_valid(
        //     &self,
        //     from_status: &ProposalStatus,
        //     to_status: &ProposalStatus,
        // ) -> bool {
        //     match from_status {
        //         ProposalStatus::None => match to_status {
        //             ProposalStatus::Proposed => true,
        //             _ => false,
        //         },
        //         ProposalStatus::Proposed => match to_status {
        //             ProposalStatus::Voting | ProposalStatus::Denied => true,
        //             _ => false,
        //         },
        //         ProposalStatus::Voting => match to_status {
        //             ProposalStatus::FinishVoting => true,
        //             _ => false,
        //         },
        //         ProposalStatus::FinishVoting => match to_status {
        //             ProposalStatus::Executed | ProposalStatus::Denied => true,
        //             _ => false,
        //         },
        //         _ => false,
        //     }
        // }

        // fn _change_to_status_from_u8(&self, value: u8) -> ProposalStatus {
        //     match value {
        //         1 => ProposalStatus::Proposed,
        //         2 => ProposalStatus::Voting,
        //         3 => ProposalStatus::FinishVoting,
        //         4 => ProposalStatus::Executed,
        //         5 => ProposalStatus::Denied,
        //         _ => ProposalStatus::None,
        //     }
        // }

        // fn _modifier_only_call_from_election(&self) -> bool {
        //     self.election_address == self.env().caller()
        // }
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
                Err(ContractBaseError::IsAlreadySetDaoAddress)
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
                "title title,outline,https://github.com,This is description,add_member,address".to_string(),
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
