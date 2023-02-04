pub use crate::traits::errors::contract_base::ContractBaseError;
use ink_prelude::{
    string::String,
    vec::Vec,
};

#[openbrush::wrapper]
pub type ContractBaseRef = dyn ContractBase;

#[openbrush::trait_definition]
pub trait ContractBase {
    #[ink(message)]
    fn execute_interface(&mut self, target_contract:String, command:String, parameters_csv:String) -> core::result::Result<(), ContractBaseError>;

    fn _execute_interface(&mut self, command:String, parameters_csv:String) -> core::result::Result<(), ContractBaseError>;

    fn _function_calling_switch(&mut self, command:String, vec_of_parameters:Vec<String>) -> core::result::Result<(), ContractBaseError>;
}