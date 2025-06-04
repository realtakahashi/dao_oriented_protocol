use ink::prelude::string::String;

// #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[derive(Debug, PartialEq, Eq)]
#[ink::scale_derive(Encode, Decode, TypeInfo)]
#[allow(clippy::cast_possible_truncation)]
pub enum ContractBaseError {
    CommnadNotFound,
    ParameterInvalid,
    InvalidCallingFromOrigin,
    TragetDataNotFound,
    ContractNotFound,
    TheAddressNotFound,
    SetTheAddressOnlyOnece,
    Custom(String),
}
