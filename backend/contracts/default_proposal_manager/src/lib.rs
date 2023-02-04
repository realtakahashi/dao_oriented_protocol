#![cfg_attr(not(feature = "std"), no_std)]

#[openbrush::contract]
mod default_proposal_manager {
    use contract_helper::traits::contract_base::contract_base::*;
    use contract_helper::traits::errors::contract_base::*;
    use ink_prelude::string::{String, ToString};
    use ink_prelude::{vec::Vec};
    use ink_storage::traits::{PackedLayout, SpreadLayout, StorageLayout, SpreadAllocate};
    use openbrush::{contracts::ownable::*, modifiers, storage::Mapping, traits::Storage};
    use contract_helper::common::common_logics;
    use core::str::FromStr;

    #[derive(Debug, Clone, scale::Encode, scale::Decode, SpreadLayout, PackedLayout, PartialEq)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub struct ProposalInfo {
        id: u128,
        title: String,
        outline: String,
        description: String,
        github_url: String,
        status: ProposalStatus,
    }

    #[derive(
        Debug, PartialEq, Eq, scale::Encode, scale::Decode, Clone, SpreadLayout, PackedLayout,
    )]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub enum ProposalStatus {
        /// initial value
        None,
        /// proposed
        Proposed,
        /// voting
        Voting,
        /// Finish Voting
        FinishVoting,
        /// executed
        Executed,
        /// denied
        Denied,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        // IsAlreadySetDaoAddress,
        // OnlyFromDaoAddress,
        ContractBaseError(ContractBaseError),
    }

    impl From<ContractBaseError> for Error {
        fn from(error: ContractBaseError) -> Self {
            Error::ContractBaseError(error)
        }
    }

    pub type Result<T> = core::result::Result<T, Error>;

    const COMMAND_LIST: [&str; 3] = [
        "set_dao_address",
        "add_proposal",
        "change_proposal_status",
    ];

    impl ContractBase for DefaultProposalManager {
        #[ink(message)]
        fn execute_interface(
            &mut self,
            _target_contract: String,
            command: String,
            parameters_csv: String,
        ) -> core::result::Result<(), ContractBaseError> {
            if COMMAND_LIST
                .iter()
                .filter(|item| *item == &command)
                .collect::<Vec<&&str>>()
                .len()
                == 0
            {
                return Err(ContractBaseError::CommnadNotFound);
            };
            self._execute_interface(command, parameters_csv)
        }

        fn _execute_interface(
            &mut self,
            command: String,
            parameters_csv: String,
        ) -> core::result::Result<(), ContractBaseError> {
            let vec_of_parameters:Vec<String> = match parameters_csv.find(',') {
                Some(_index) => parameters_csv.split(',').map(|col| col.to_string()).collect(),
                None => {
                    let mut rec:Vec<String> = Vec::new();
                    rec.push(parameters_csv);
                    rec
                }
            };
            self._function_calling_switch(command, vec_of_parameters)
        }

        fn _function_calling_switch(&mut self, command:String, vec_of_parameters:Vec<String>) -> core::result::Result<(), ContractBaseError> {
            match command.as_str() {
                "set_dao_address" => self._set_dao_address(vec_of_parameters), // dao_coreへのインストールコマンドで必ず呼ぶ
                "add_proposal" => self._add_proposal(vec_of_parameters),
                "change_proposal_status" => self._change_proposal_status(vec_of_parameters),
                _ => Err(ContractBaseError::CommnadNotFound), 
            }
        }
    }

    #[ink(storage)]
    #[derive(SpreadAllocate, Storage, Default)]
    pub struct DefaultProposalManager {
        proposal_list_with_id: Mapping<u128, ProposalInfo>,
        next_proposal_id: u128,
        dao_address: AccountId,
        is_set_dao_address: bool,
        election_address: AccountId
    }

    impl DefaultProposalManager {
        #[ink(constructor)]
        pub fn new(election_address:AccountId) -> Self {
            ink_lang::utils::initialize_contract(|instance: &mut Self| {
                instance.election_address = election_address;
                // let caller = instance.env().caller();
                // instance._init_with_owner(caller);
            })
        }

        #[ink(message)]
        pub fn get_dao_address(&self) -> AccountId {
            self.dao_address
        }

        #[ink(message)]
        pub fn get_proposal_info_list(&self) -> Vec<ProposalInfo> {
            let mut result:Vec<ProposalInfo> = Vec::new();
            for i in 0..self.next_proposal_id {
                match self.proposal_list_with_id.get(&i) {
                    Some(value) => result.push(value),
                    None => (),
                }
            }
            result
        }

        fn _set_dao_address(&mut self, vec_of_parameters:Vec<String>) -> core::result::Result<(), ContractBaseError> {
            if vec_of_parameters.len() != 1 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            self._set_dao_address_impl(&vec_of_parameters[0])
        }

        fn _set_dao_address_impl(&mut self, dao_address:&String) -> core::result::Result<(), ContractBaseError> {
            match self.is_set_dao_address {
                true => Err(ContractBaseError::IsAlreadySetDaoAddress),
                false => {
                    self.is_set_dao_address = true;
                    self.dao_address = common_logics::convert_string_to_accountid(&dao_address);
                    Ok(())
                }
            }
        }

        fn _add_proposal(&mut self, vec_of_parameters:Vec<String>) -> core::result::Result<(), ContractBaseError> {
            if self._modifier_only_call_from_dao() == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            if vec_of_parameters.len() != 4 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            self._add_proposal_impl(&vec_of_parameters[0], &vec_of_parameters[1], &vec_of_parameters[2], &vec_of_parameters[3])
        }

        fn _add_proposal_impl(&mut self, title:&String, outline:&String, github_url:&String, description:&String) -> core::result::Result<(), ContractBaseError> {
            let proposal_info = ProposalInfo {
                id: self.next_proposal_id,
                title: title.to_string(),
                outline: outline.to_string(),
                github_url: github_url.to_string(),
                description: description.to_string(),
                status: ProposalStatus::Proposed,
            };
            self.proposal_list_with_id.insert(&proposal_info.id, &proposal_info);
            self.next_proposal_id += 1;
            Ok(())
        }

        fn _change_proposal_status(&mut self, vec_of_parameters:Vec<String>) -> core::result::Result<(), ContractBaseError>{
            if vec_of_parameters.len() != 2 {
                return Err(ContractBaseError::ParameterInvalid);
            };
            let target_proposal_id = match u128::from_str_radix(vec_of_parameters[0].as_str(),10) {
                Ok(value) => value,
                Err(_e) => return Err(ContractBaseError::ParameterInvalid),
            };   
            let to_status_u8 = match u8::from_str_radix(vec_of_parameters[1].as_str(),10) {
                Ok(value) => value,
                Err(_e) => return Err(ContractBaseError::ParameterInvalid),
            };
            self._change_proposal_status_impl(target_proposal_id, self._change_to_status_from_u8(to_status_u8)) 
        }

        fn _change_proposal_status_impl(&mut self, target_proposal_id:u128, to_status:ProposalStatus) -> core::result::Result<(), ContractBaseError>{
            if self._modifier_only_call_from_election() == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            };
            let mut proposal_info = match self.proposal_list_with_id.get(&target_proposal_id){
                Some(value) => value,
                None => return Err(ContractBaseError::TragetDataNotFound),
            };
            if self._check_changing_status_valid(&proposal_info.status, &to_status) == false {
                return Err(ContractBaseError::Custom("Changing Status Is Invalid".to_string()));
            };
            proposal_info.status = to_status;
            self.proposal_list_with_id.insert(&proposal_info.id, &proposal_info);
            Ok(())
        }

        fn _check_changing_status_valid(&self, from_status:&ProposalStatus, to_status:&ProposalStatus) -> bool {
            match from_status {
                ProposalStatus::None => {
                    match to_status {
                        ProposalStatus::Proposed => true,
                        _ => false,
                    }
                },
                ProposalStatus::Proposed => {
                    match to_status {
                        ProposalStatus::Voting | ProposalStatus::Denied => true,
                        _ => false, 
                    }
                },
                ProposalStatus::Voting => {
                    match to_status {
                        ProposalStatus::FinishVoting => true,
                        _ => false,
                    }
                },
                ProposalStatus::FinishVoting => {
                    match to_status {
                        ProposalStatus::Executed | ProposalStatus::Denied => true,
                        _ => false,
                    }
                },
                _ => false,
            }
        }

        fn _change_to_status_from_u8(&self, value:u8) -> ProposalStatus {
            match value {
                1 => ProposalStatus::Proposed,
                2 => ProposalStatus::Voting,
                3 => ProposalStatus::FinishVoting,
                4 => ProposalStatus::Executed,
                5 => ProposalStatus::Denied,
                _ => ProposalStatus::None,
            }
        }

        fn _modifier_only_call_from_dao(&self) -> bool {
            self.dao_address == self.env().caller()
        }

        fn _modifier_only_call_from_election(&self) -> bool {
            self.election_address == self.env().caller()
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink_lang as ink;
        use contract_helper::common::common_logics;

        #[ink::test]
        fn set_dao_address_works() {
            let mut default_proposal_manager = DefaultProposalManager::new();
            assert_eq!(
                default_proposal_manager.execute_interface(
                    "test_contract".to_string(),
                    "set_dao_address".to_string(),
                    "ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8".to_string(),
                ),
                Ok(())
            );
            // set_dao_address twice is error
            assert_eq!(
                default_proposal_manager.execute_interface(
                    "test_contract".to_string(),
                    "set_dao_address".to_string(),
                    "ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8".to_string(),
                ),
                Err(ContractBaseError::IsAlreadySetDaoAddress)
            );
        }

        #[ink::test]
        fn set_dao_address_has_only_one_param() {
            let mut default_proposal_manager = DefaultProposalManager::new();
            assert_eq!(
                default_proposal_manager.execute_interface(
                    "test_contract".to_string(),
                    "set_dao_address".to_string(),
                    "ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8,this_is_not_needed".to_string(),
                ),
                Err(ContractBaseError::ParameterInvalid)
            );
        }

        // get dao_address
        #[ink::test]
        fn get_dao_address_works(){
            let mut default_proposal_manager = DefaultProposalManager::new();
            assert_eq!(
                default_proposal_manager.execute_interface(
                    "test_contract".to_string(),
                    "set_dao_address".to_string(),
                    "ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8".to_string(),
                ),
                Ok(())
            );
            let dao_address = common_logics::convert_string_to_accountid("ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8");
            assert_eq!(default_proposal_manager.get_dao_address(), dao_address);           
        }

        // add proposal works
        #[ink::test]
        fn add_proposal_works(){
            let mut default_proposal_manager = DefaultProposalManager::new();
            assert_eq!(
                default_proposal_manager.execute_interface(
                    "test_contract".to_string(),
                    "set_dao_address".to_string(),
                    "ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8".to_string(),
                ),
                Ok(())
            );
            let dao_address = common_logics::convert_string_to_accountid("ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8");
            ink_env::test::set_caller::<Environment>(dao_address);
            let result = default_proposal_manager.execute_interface(
                "test_contract".to_string(),
                "add_proposal".to_string(),
                "title title,outline,This is description".to_string(),
            );
            assert_eq!(result, Ok(()));

            let list = default_proposal_manager.get_proposal_info_list();
            assert_eq!(list.len(), 1);
        }

        // command_not_found
        #[ink::test]
        fn command_not_found_is_error(){
            let mut default_proposal_manager = DefaultProposalManager::new();
            assert_eq!(
                default_proposal_manager.execute_interface(
                    "test_contract".to_string(),
                    "this_command_is_not_found".to_string(),
                    "ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8,aaaaaa".to_string(),
                ),
                Err(ContractBaseError::CommnadNotFound)
            );
        }
    }
}
