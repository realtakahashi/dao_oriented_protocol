#![cfg_attr(not(feature = "std"), no_std)]

// pub use self::default_contract::{DefaultContract, DefaultContractRef};

#[ink::contract]
pub mod default_contract {
    use contract_helper::traits::contract_base::contract_base::*;
    use ink::prelude::string::{String, ToString};
    use ink::prelude::vec::Vec;

    #[ink(storage)]
    pub struct DefaultContract {
        application_core_address: Option<AccountId>,
        command_list: Vec<String>,
        is_enable: bool,
    }

    impl ContractBase for DefaultContract {
        #[ink(message)]
        fn _execute_interface(
            &mut self,
            command: String,
            parameters_csv: String,
            caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            ink::env::debug_println!(
                "########## contract_base:_execute_interface call 1: {:?}",
                command
            );
            let command_list = self._get_command_list();
            if command_list
                .iter()
                .filter(|item| *item == &command)
                .collect::<Vec<&String>>()
                .len()
                == 0
            {
                ink::env::debug_println!(
                    "########## contract_base:_execute_interface CommnadNotFound"
                );
                return Err(ContractBaseError::CommnadNotFound);
            }
            self._execute_interface_impl(command, parameters_csv, caller_eoa)
        }

        #[ink(message)]
        fn _set_application_core_address(
            &mut self,
            vec_of_parameters: Vec<String>,
        ) -> core::result::Result<(), ContractBaseError> {
            match self.get_application_core_address() {
                Some(_value) => return Err(ContractBaseError::SetTheAddressOnlyOnece),
                None => match vec_of_parameters.len() {
                    1 => {
                        match common_logics::convert_hexstring_to_accountid(
                            vec_of_parameters[0].clone(),
                        ) {
                            Some(value) => self._set_application_core_address_impl(value),
                            None => return Err(ContractBaseError::ParameterInvalid),
                        }
                    }
                    _ => return Err(ContractBaseError::ParameterInvalid),
                },
            }
        }

        #[ink(message)]
        fn _execute_interface_impl(
            &mut self,
            command: String,
            parameters_csv: String,
            caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            let vec_of_parameters: Vec<String> = match parameters_csv.find(&"$1$".to_string()) {
                Some(_index) => parameters_csv
                    .split(&"$1$".to_string())
                    .map(|col| col.to_string())
                    .collect(),
                None => {
                    let mut rec: Vec<String> = Vec::new();
                    rec.push(parameters_csv);
                    rec
                }
            };
            self._function_calling_switch(command, vec_of_parameters, caller_eoa)
        }

        #[ink(message)]
        fn _modifier_only_call_from_application_core(&self, caller: AccountId) -> bool {
            // ink::env::debug_println!("########## contract_base:_modifier_only_call_from_application_core get_application_core_address:{:?}",self.get_application_core_address());
            // ink::env::debug_println!("########## contract_base:_modifier_only_call_from_application_core caller:{:?}",caller);

            match self.get_application_core_address() {
                Some(value) => value == caller,
                None => false,
            }
        }

        #[ink(message)]
        fn get_application_core_address(&self) -> Option<AccountId> {
            self.application_core_address
        }

        #[ink(message)]
        fn get_data(&self, _target_function: String) -> Vec<Vec<u8>> {
            let return_value: Vec<Vec<u8>> = Vec::new();
            return_value
        }

        #[ink(message)]
        fn _set_application_core_address_impl(
            &mut self,
            application_core_address: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            self.application_core_address = Some(application_core_address);
            Ok(())
        }

        #[ink(message)]
        fn _get_command_list(&self) -> Vec<String> {
            self.command_list.clone()
        }

        #[ink(message)]
        fn _function_calling_switch(
            &mut self,
            command: String,
            _vec_of_parameters: Vec<String>,
            _caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            match command.as_str() {
                "test_function" => self._test_function(),
                _ => Err(ContractBaseError::CommnadNotFound),
            }
        }

        // fn _change_enable_or_not(&mut self, _vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>{
        //     self.is_enable = true;
        //     Ok(())
        // }
    }

    impl DefaultContract {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                application_core_address: None,
                command_list: ["test_function".to_string()].to_vec(),
                is_enable: false,
            }
        }

        #[ink(message)]
        pub fn extarnal_get_data_interface(&self, target_function: String) -> Vec<Vec<u8>> {
            self.get_data(target_function)
        }

        #[ink(message)]
        pub fn extarnal_execute_interface(
            &mut self,
            command: String,
            parameters_csv: String,
            caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            self._execute_interface(command, parameters_csv, caller_eoa)
        }

        fn _test_function(&self) -> core::result::Result<(), ContractBaseError> {
            ink::env::debug_println!(
                "########## source caller ############### value is {:?}",
                self.env().caller()
            );
            Ok(())
        }
    }
}
