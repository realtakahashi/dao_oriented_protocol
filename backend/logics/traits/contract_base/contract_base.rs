#![cfg_attr(not(feature = "std"), no_std)]
// #![feature(min_specialization)]

pub use crate::traits::errors::contract_error::ContractBaseError;
pub use crate::common::common_logics;
use ink::prelude::{
    string::{ String, ToString },
    vec::Vec,
};

use openbrush::traits::AccountId;

#[openbrush::wrapper]
pub type ContractBaseRef = dyn ContractBase;

#[openbrush::trait_definition]
pub trait ContractBase {

    #[ink(message)]
    fn execute_interface(&mut self, command:String, parameters_csv:String, caller:AccountId) -> core::result::Result<(), ContractBaseError>{
        let command_list = self._get_command_list();
        if command_list.iter().filter(|item| *item == &command).collect::<Vec<&String>>().len() == 0{
            return Err(ContractBaseError::CommnadNotFound);
        }
        self._execute_interface(command, parameters_csv, caller)
    }

    fn _set_dao_address(
        &mut self,
        vec_of_parameters:Vec<String>,
    ) -> core::result::Result<(), ContractBaseError> {
        match self.get_dao_address() {
            Some(_value) => return Err(ContractBaseError::IsAlreadySetDaoAddress),
            None => {
                match vec_of_parameters.len(){
                    1 => {
                        match common_logics::convert_string_to_accountid(&vec_of_parameters[0]){
                            Some(value) => self._set_dao_address_impl(value),
                            None => return Err(ContractBaseError::ParameterInvalid),
                        }
                    },
                    _ => return Err(ContractBaseError::ParameterInvalid), 
                }
            },
        }
    }

    fn _execute_interface(&mut self, command:String, parameters_csv:String, caller:AccountId) -> core::result::Result<(), ContractBaseError>{
        let vec_of_parameters: Vec<String> = match parameters_csv.find(',') {
            Some(_index) => parameters_csv
                .split(',')
                .map(|col| col.to_string())
                .collect(),
            None => {
                let mut rec: Vec<String> = Vec::new();
                rec.push(parameters_csv);
                rec
            }
        };
        self._function_calling_switch(command, vec_of_parameters, caller)
    }

    fn _modifier_only_call_from_dao(&self,caller:AccountId) -> bool {
        match self.get_dao_address() {
            Some(value) => value == caller,
            None => false,
        }
    }

    #[ink(message)]
    fn get_dao_address(&self) -> Option<AccountId>;
    
    #[ink(message)]
    fn get_data(&self,target_function:String) -> Vec<Vec<u8>>;
    
    fn _set_dao_address_impl(&mut self, dao_address:AccountId) -> core::result::Result<(), ContractBaseError>;

    fn _get_command_list(&self) -> &Vec<String>; 

    fn _function_calling_switch(&mut self, command:String, vec_of_parameters:Vec<String>, caller:AccountId) -> core::result::Result<(), ContractBaseError>;

    fn _change_enable_or_not(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>;

}