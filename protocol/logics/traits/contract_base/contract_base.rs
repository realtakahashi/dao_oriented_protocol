#![cfg_attr(not(feature = "std"), no_std)]
// #![feature(min_specialization)]

pub use crate::traits::errors::contract_error::ContractBaseError;
pub use crate::common::common_logics;
use ink::prelude::{
    string::{ String },
    vec::Vec,
};

use ink::primitives::AccountId;

// pub type ContractBaseRef = dyn ContractBase;

#[ink::trait_definition]
pub trait ContractBase {

    #[ink(message)]
    fn extarnal_execute_interface(&mut self, command:String, parameters_csv:String, caller_eoa:AccountId) -> core::result::Result<(), ContractBaseError>;

    #[ink(message)]
    fn get_application_core_address(&self) -> Option<AccountId>;
    
    #[ink(message)]
    fn extarnal_get_data_interface(&self,target_function:String) -> Vec<Vec<u8>>;

    // todo: 全ての関数インタフェースかつパラメータの説明付き文を取得出来る関数を実装する
    
    // fn _change_enable_or_not(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>;

}