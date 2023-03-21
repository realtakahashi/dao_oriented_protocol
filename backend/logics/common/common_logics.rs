use ink::prelude::{ vec, vec::Vec };
use ink::prelude::string::{ String, ToString };
use openbrush::traits::AccountId;

#[inline]
pub fn convert_string_to_accountid(account_str: &str) -> Option<AccountId> {
    let mut output = vec![0xFF; 35];
    match bs58::decode(account_str).into(&mut output) {
        Ok(_) => (),
        Err(_) => return None,
    };
    let cut_address_vec: Vec<_> = output.drain(1..33).collect();
    let mut array = [0; 32];
    let bytes = &cut_address_vec[..array.len()];
    array.copy_from_slice(bytes);
    let account_id: AccountId = array.into();
    Some(account_id)
}

pub fn change_csv_string_to_vec_of_string(parameters_csv: String) ->Vec<String> {
    match parameters_csv.find(',') {
        Some(_index) => parameters_csv
            .split(',')
            .map(|col| col.to_string())
            .collect(),
        None => {
            let mut rec: Vec<String> = Vec::new();
            rec.push(parameters_csv);
            rec
        }
    }
}
