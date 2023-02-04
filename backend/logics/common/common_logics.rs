use openbrush::traits::AccountId;
use ink_prelude::{
        vec,
        vec::Vec,
};

pub fn convert_string_to_accountid(account_str: &str)-> AccountId{
    let mut output = vec![0xFF; 35];
    bs58::decode(account_str).into(&mut output).unwrap();
    let cut_address_vec:Vec<_> = output.drain(1..33).collect();
    let mut array = [0; 32];
    let bytes = &cut_address_vec[..array.len()]; 
    array.copy_from_slice(bytes);
    let account_id:AccountId = array.into();
    account_id
}
