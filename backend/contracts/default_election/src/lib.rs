#![cfg_attr(not(feature = "std"), no_std)]

#[openbrush::contract]
mod default_election {
    use contract_helper::common::common_logics;
    use contract_helper::traits::contract_base::contract_base::*;
    use contract_helper::traits::errors::contract_error::*;
    use core::str::FromStr;
    use ink::prelude::string::{String, ToString};
    use ink::prelude::vec::Vec;
    use ink::storage::traits::{StorageLayout};
    use openbrush::{contracts::ownable::*, modifiers, storage::Mapping, traits::Storage};

    #[derive(Default, Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub struct ElectionInfo {
        id: u128,
        proposal_id: u128,
        minimum_voter_turnout_percentage: u8,
        passing_percentage: u8,
        number_of_votes: u128,
        list_of_voters: Vec<AccountId>,
        list_of_electoral_commissioner: Vec<AccountId>,
    }

    #[ink(storage)]
    pub struct DefaultElection {
        election_list_with_proposal_id: Mapping<u128, ElectionInfo>,
        minimum_voter_turnout_percentage: u8,
        passing_percentage: u8,
        dao_address:Option<AccountId>,
        remain_term_electoral_commissioner: u8,
        list_of_electoral_commissioner: Vec<AccountId>,
        next_election_id: u128,
    }

    impl ContractBase for DefaultElection {
        #[ink(message)]
        fn get_dao_address(&self) -> Option<AccountId> {
            self.dao_address
        }

        fn _set_dao_address_impl(&mut self, dao_address:AccountId) -> core::result::Result<(), ContractBaseError>{
            self.dao_address = Some(dao_address);
            Ok(())
        }

        fn _get_command_list(&self) -> Vec<String> {
            let command_list: Vec<String> = [
                "create_election".to_string(),
                "start_election".to_string(),
                "end_election".to_string(),
                "reset_minimum_voter_turnout_percentage".to_string(),
                "reset_passing_percentage".to_string(),
            ]
            .to_vec();
            command_list
        }

        fn _function_calling_switch(
            &mut self,
            command: String,
            vec_of_parameters: Vec<String>,
        ) -> core::result::Result<(), ContractBaseError> {
            match command.as_str() {
                "create_election" => self._create_electtion(vec_of_parameters),
                "start_election" => self._start_election(vec_of_parameters),
                "end_election" => self._end_election(vec_of_parameters),
                "reset_minimum_voter_turnout_percentage" => self._reset_minimum_voter_turnout_percentage(vec_of_parameters),
                "reset_passing_percentage" => self._reset_passing_percentage(vec_of_parameters),
                _ => Err(ContractBaseError::CommnadNotFound),
            }
        }
    }

    impl DefaultElection {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new() -> Self {
            Self{
                election_list_with_proposal_id: Mapping::default(),
                minimum_voter_turnout_percentage: 70,
                passing_percentage: 70,
                dao_address: None,
                remain_term_electoral_commissioner:5,
                list_of_electoral_commissioner: Vec::default(),
                next_election_id: 0,
            }
        }

        fn _create_electtion(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>{

            Ok(())
        }

        fn _create_electtion_impl(&mut self, proposal_id: u128 ) -> core::result::Result<(), ContractBaseError>{
            Ok(())
        }

        fn _start_election(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>{
            Ok(())
        }

        fn _end_election(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>{
            Ok(())
        }

        fn _reset_minimum_voter_turnout_percentage(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>{
            Ok(())
        }

        fn _reset_passing_percentage(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>{
            Ok(())
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
