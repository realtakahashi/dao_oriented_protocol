#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod community_sub_token {
    use community_types::types::RewardInfo;
    use contract_helper::common::common_logics::{self, ContractBaseError};
    use contract_helper::traits::contract_base::contract_base::*;
    use default_contract::default_contract::DefaultContractRef;
    use ink::storage::Mapping;
    use ink::prelude::string::{String, ToString};
    use ink::prelude::vec::Vec;

    #[ink(storage)]
    #[derive(Default)]
    pub struct CommunitySubToken {
        name: String,
        symbol: String,
        decimals: u8,
        total_supply: Balance,
        balances: Mapping<AccountId, Balance>,
        allowances: Mapping<(AccountId, AccountId), Balance>,
        community_core_address: Option<AccountId>,
        command_list: Vec<ink::prelude::string::String>,
        application_core_address: Option<AccountId>,
        proposal_manager_address: Option<AccountId>,
        community_token_address: Option<AccountId>,
    }

    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        value: Balance,
    }

    #[ink(event)]
    pub struct Approval {
        #[ink(topic)]
        owner: AccountId,
        #[ink(topic)]
        spender: AccountId,
        value: Balance,
    }

    #[ink(event)]
    pub struct Mint {
        #[ink(topic)]
        to: AccountId,
        value: Balance,
    }

    #[ink(event)]
    pub struct Burn {
        #[ink(topic)]
        from: AccountId,
        value: Balance,
    }

    impl ContractBase for CommunitySubToken {
        #[ink(message)]
        fn get_application_core_address(&self) -> Option<AccountId> {
            self.application_core_address
        }

        /// get data interface
        #[ink(message)]
        fn extarnal_get_data_interface(&self, target_function: String) -> Vec<Vec<u8>> {
            let mut result: Vec<Vec<u8>> = Vec::new();
            result
        }

        #[ink(message)]
        fn extarnal_execute_interface(
            &mut self,
            command: String,
            parameters_csv: String,
            caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            let command_list = self._get_command_list();
            if command_list
                .iter()
                .filter(|item| *item == &command)
                .collect::<Vec<&String>>()
                .len()
                == 0
            {
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
        }
    }

    impl CommunitySubToken {
        #[ink(constructor)]
        pub fn new(
            name: String,
            symbol: String,
            decimals: u8,
            community_core_address: AccountId,
            community_token_address: AccountId,
            proposal_manager_address: AccountId,
        ) -> Self {
            let mut instance = Self::default();
            instance.name = name;
            instance.symbol = symbol;
            instance.decimals = decimals;
            instance.total_supply = 0;
            instance.balances = Mapping::default();
            instance.allowances = Default::default();
            instance
                .command_list
                .push("set_application_core_address".to_string());
            instance
                .command_list
                .push("rewards_psp22_individials".to_string());
            instance
                .command_list
                .push("mint_by_community_token".to_string());
            instance
                .command_list
                .push("exchange_2_community_token".to_string());
            instance.community_core_address = Some(community_core_address);
            instance.proposal_manager_address = Some(proposal_manager_address);
            instance.community_token_address = Some(community_token_address);
            instance
        }

        /// Returns the total token supply.
        #[ink(message)]
        pub fn total_supply(&self) -> Balance {
            self.total_supply
        }

        /// Returns the account balance for the specified `owner`.
        ///
        /// Returns `0` if the account is non-existent.
        #[ink(message)]
        pub fn balance_of(&self, owner: AccountId) -> Balance {
            self.balance_of_impl(&owner)
        }

        /// Returns the account balance for the specified `owner`.
        ///
        /// Returns `0` if the account is non-existent.
        ///
        /// # Note
        ///
        /// Prefer to call this method over `balance_of` since this
        /// works using references which are more efficient in Wasm.
        #[inline]
        fn balance_of_impl(&self, owner: &AccountId) -> Balance {
            self.balances.get(owner).unwrap_or_default()
        }

        /// Returns the amount which `spender` is still allowed to withdraw from `owner`.
        ///
        /// Returns `0` if no allowance has been set.
        #[ink(message)]
        pub fn allowance(&self, owner: AccountId, spender: AccountId) -> Balance {
            self.allowance_impl(&owner, &spender)
        }

        /// Returns the amount which `spender` is still allowed to withdraw from `owner`.
        ///
        /// Returns `0` if no allowance has been set.
        ///
        /// # Note
        ///
        /// Prefer to call this method over `allowance` since this
        /// works using references which are more efficient in Wasm.
        #[inline]
        fn allowance_impl(&self, owner: &AccountId, spender: &AccountId) -> Balance {
            self.allowances.get((owner, spender)).unwrap_or_default()
        }

        /// Transfers `value` amount of tokens from the caller's account to account `to`.
        ///
        /// On success a `Transfer` event is emitted.
        ///
        /// # Errors
        ///
        /// Returns `InsufficientBalance` error if there are not enough tokens on
        /// the caller's account balance.
        #[ink(message)]
        pub fn transfer(
            &mut self,
            to: AccountId,
            value: Balance,
        ) -> core::result::Result<(), ContractBaseError> {
            let from = self.env().caller();
            self.transfer_from_to(&from, &to, value)
        }

        /// Allows `spender` to withdraw from the caller's account multiple times, up to
        /// the `value` amount.
        ///
        /// If this function is called again it overwrites the current allowance with
        /// `value`.
        ///
        /// An `Approval` event is emitted.
        #[ink(message)]
        pub fn approve(
            &mut self,
            spender: AccountId,
            value: Balance,
        ) -> core::result::Result<(), ContractBaseError> {
            let owner = self.env().caller();
            self.allowances.insert((&owner, &spender), &value);
            self.env().emit_event(Approval {
                owner,
                spender,
                value,
            });
            Ok(())
        }

        /// Transfers `value` tokens on the behalf of `from` to the account `to`.
        ///
        /// This can be used to allow a contract to transfer tokens on ones behalf and/or
        /// to charge fees in sub-currencies, for example.
        ///
        /// On success a `Transfer` event is emitted.
        ///
        /// # Errors
        ///
        /// Returns `InsufficientAllowance` error if there are not enough tokens allowed
        /// for the caller to withdraw from `from`.
        ///
        /// Returns `InsufficientBalance` error if there are not enough tokens on
        /// the account balance of `from`.
        #[ink(message)]
        pub fn transfer_from(
            &mut self,
            from: AccountId,
            to: AccountId,
            value: Balance,
        ) -> core::result::Result<(), ContractBaseError> {
            let caller = self.env().caller();
            let allowance = self.allowance_impl(&from, &caller);
            if allowance < value {
                return Err(ContractBaseError::Custom(
                    "InsufficientAllowance.".to_string(),
                ));
            }
            self.transfer_from_to(&from, &to, value)?;
            // We checked that allowance >= value
            #[allow(clippy::arithmetic_side_effects)]
            self.allowances
                .insert((&from, &caller), &(allowance - value));
            Ok(())
        }

        /// Transfers `value` amount of tokens from the caller's account to account `to`.
        ///
        /// On success a `Transfer` event is emitted.
        ///
        /// # Errors
        ///
        /// Returns `InsufficientBalance` error if there are not enough tokens on
        /// the caller's account balance.
        fn transfer_from_to(
            &mut self,
            from: &AccountId,
            to: &AccountId,
            value: Balance,
        ) -> core::result::Result<(), ContractBaseError> {
            let from_balance = self.balance_of_impl(from);
            if from_balance < value {
                return Err(ContractBaseError::Custom(
                    "InsufficientBalance.".to_string(),
                ));
            }
            // We checked that from_balance >= value
            #[allow(clippy::arithmetic_side_effects)]
            self.balances.insert(from, &(from_balance - value));
            let to_balance = self.balance_of_impl(to);
            self.balances
                .insert(to, &(to_balance.checked_add(value).unwrap()));
            self.env().emit_event(Transfer {
                from: Some(*from),
                to: Some(*to),
                value,
            });
            Ok(())
        }

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

        fn _set_application_core_address_impl(
            &mut self,
            application_core_address: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            match self.application_core_address {
                Some(_value) => return Err(ContractBaseError::SetTheAddressOnlyOnece),
                None => self.application_core_address = Some(application_core_address),
            }
            Ok(())
        }

        /// [private] get command list
        fn _get_command_list(&self) -> &Vec<ink::prelude::string::String> {
            &self.command_list
        }

        /// [private] switch of call function
        fn _function_calling_switch(
            &mut self,
            command: ink::prelude::string::String,
            vec_of_parameters: Vec<ink::prelude::string::String>,
            caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            match command.as_str() {
                "set_application_core_address" => {
                    self._set_application_core_address(vec_of_parameters)
                }
                "rewards_psp22_individials" => self._rewards_psp22_individials(vec_of_parameters),
                "mint_by_community_token" => self._mint_by_community_token(vec_of_parameters),
                "exchange_2_community_token" => {
                    self._exchange_2_community_token(vec_of_parameters, caller_eoa)
                }
                _ => Err(ContractBaseError::CommnadNotFound),
            }
        }

        fn _rewards_psp22_individials(
            &mut self,
            vec_of_parameters: Vec<ink::prelude::string::String>,
        ) -> core::result::Result<(), ContractBaseError> {
            ink::env::debug_println!(
                "########## community_sub_token:_rewards_psp22_individials Call 1"
            );
            let mut reward_list: Vec<RewardInfo> = Vec::new();
            if self._modifier_only_call_from_proposal() == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            ink::env::debug_println!(
                "########## community_sub_token:_rewards_psp22_individials Call 2"
            );
            for param in vec_of_parameters {
                ink::env::debug_println!(
                    "########## community_sub_token:_rewards_psp22_individials Call 3"
                );
                let reward_string: Vec<ink::prelude::string::String> = param
                    .split(&"$3$".to_string())
                    .map(|col| col.to_string())
                    .collect();
                let address = match common_logics::convert_string_to_accountid(&reward_string[0]) {
                    Some(value) => value,
                    None => return Err(ContractBaseError::Custom("InvalidEoaAddress".to_string())),
                };
                ink::env::debug_println!(
                    "########## community_sub_token:_rewards_psp22_individials Call 4"
                );
                let amount = match common_logics::convert_string_to_u128(&reward_string[1]) {
                    Ok(value) => value,
                    Err(error) => return Err(error),
                };
                ink::env::debug_println!(
                    "########## community_sub_token:_rewards_psp22_individials Call 5"
                );
                let reward_info = RewardInfo {
                    address: address,
                    amount: amount,
                };
                reward_list.push(reward_info);
            }
            ink::env::debug_println!(
                "########## community_sub_token:_rewards_psp22_individials Call 6"
            );
            for reward_info in reward_list {
                ink::env::debug_println!(
                    "########## community_sub_token:_rewards_psp22_individials Call 7"
                );
                match self.transfer_from_to(
                    &self.community_core_address.unwrap(),
                    &reward_info.address,
                    reward_info.amount,
                    // "transfer_data".as_bytes().to_vec(),
                ) {
                    Ok(()) => (),
                    Err(e) => {
                        return Err(ContractBaseError::Custom(
                            "TransferFromToIsFailure.".to_string(),
                        ))
                    }
                }
            }
            ink::env::debug_println!(
                "########## community_sub_token:_rewards_psp22_individials Call 8"
            );
            Ok(())
        }

        fn _mint_to(
            &mut self,
            to: AccountId,
            amount: Balance,
        ) -> core::result::Result<(), ContractBaseError> {
            let present_balace = self.balance_of(to);
            self.balances.insert(&to, &(present_balace.saturating_add(amount)));
            self.total_supply = self.total_supply.saturating_add(amount);
            self.env().emit_event(Mint { to, value: amount });
            Ok(())
        }

        fn _mint_by_community_token(
            &mut self,
            vec_of_parameters: Vec<ink::prelude::string::String>,
        ) -> core::result::Result<(), ContractBaseError> {
            ink::env::debug_println!(
                "########## community_sub_token:_mint_by_community_token Call 1"
            );
            if self._modifier_only_call_from_community_token() == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            ink::env::debug_println!(
                "########## community_sub_token:_mint_by_community_token Call 2"
            );
            if vec_of_parameters.len() != 1 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            ink::env::debug_println!(
                "########## community_sub_token:_mint_by_community_token Call 3"
            );
            let amount = match common_logics::convert_string_to_u128(&vec_of_parameters[0]) {
                Ok(value) => value,
                Err(error) => return Err(error),
            };
            ink::env::debug_println!(
                "########## community_sub_token:_mint_by_community_token Call 4"
            );
            match self._mint_to(self.community_core_address.unwrap(), amount) {
                Ok(()) => Ok(()),
                Err(e) => Err(ContractBaseError::Custom("MintToIsFailure.".to_string())),
            }
        }

        fn _exchange_2_community_token(
            &mut self,
            vec_of_parameters: Vec<ink::prelude::string::String>,
            caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            if self._modifier_only_call_from_application_core(self.env().caller()) == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            if vec_of_parameters.len() != 1 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            let amount = match common_logics::convert_string_to_u128(&vec_of_parameters[0]) {
                Ok(value) => value,
                Err(error) => return Err(error),
            };
            if self._get_individual_balance(caller_eoa) < amount {
                return Err(ContractBaseError::Custom(
                    "YouDoNotHaveEnoughBalance".to_string(),
                ));
            }
            let mut instance: DefaultContractRef = ink::env::call::FromAccountId::from_account_id(
                self.community_token_address.unwrap(),
            );
            match instance.extarnal_execute_interface(
                "exchange_2_community_token".to_string(),
                vec_of_parameters[0].clone(),
                caller_eoa,
            ) {
                Ok(()) => {
                    self._burn_from(caller_eoa, amount);
                }
                Err(_) => {
                    return Err(ContractBaseError::Custom(
                        "exchange_2_community_token".to_string(),
                    ))
                }
            }
            Ok(())
        }

        fn _burn_from(&mut self, from: AccountId, amount: Balance)  {
            let present_balance = self.balance_of(from);
            let mut target_balance = 0;
            if present_balance > amount {
                target_balance = present_balance.saturating_sub(amount);
            }else{
                target_balance = 0;
            }
            self.balances.insert(&from, &target_balance);
            self.total_supply = self.total_supply.saturating_sub(amount);
            self.env().emit_event(Burn { from, value: amount});
        }

        fn _get_individual_balance(&self, caller_eoa: AccountId) -> Balance {
            self.balance_of(caller_eoa)
        }

        fn _modifier_only_call_from_proposal(&self) -> bool {
            self.proposal_manager_address == Some(self.env().caller())
        }

        fn _modifier_only_call_from_community_token(&self) -> bool {
            self.community_token_address == Some(self.env().caller())
        }

        fn _modifier_only_call_from_application_core(&self, caller: AccountId) -> bool {
            // ink::env::debug_println!("########## contract_base:_modifier_only_call_from_application_core get_application_core_address:{:?}",self.get_application_core_address());
            // ink::env::debug_println!("########## contract_base:_modifier_only_call_from_application_core caller:{:?}",caller);

            match self.get_application_core_address() {
                Some(value) => value == caller,
                None => false,
            }
        }
    }
}
