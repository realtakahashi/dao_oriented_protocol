#![cfg_attr(not(feature = "std"), no_std, no_main)]

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
        fn extarnal_execute_interface(
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

            // self._execute_interface_impl(command, parameters_csv, caller_eoa)
        }

        #[ink(message)]
        fn get_application_core_address(&self) -> Option<AccountId> {
            self.application_core_address
        }

        #[ink(message)]
        fn extarnal_get_data_interface(&self, _target_function: String) -> Vec<Vec<u8>> {
            let return_value: Vec<Vec<u8>> = Vec::new();
            return_value
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

        // #[ink(message)]
        // pub fn extarnal_get_data_interface(&self, target_function: String) -> Vec<Vec<u8>> {
        //     self.get_data(target_function)
        // }

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

        fn _get_command_list(&self) -> &Vec<String> {
            &self.command_list
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
