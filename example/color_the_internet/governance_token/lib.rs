#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
pub mod governance_token {
    use ink::{storage::Mapping};
    use ink::prelude::string::String;

    #[ink(storage)]
    pub struct GovernanceToken {
        total_supply: u128,
        balances: Mapping<AccountId, u128>,
        allowances: Mapping<(AccountId, AccountId), u128>,
        contract_address: AccountId,
        name: String,
        symbol: String,
    }

    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        value: u128,
    }

    #[ink(event)]
    pub struct Approval {
        #[ink(topic)]
        owner: AccountId,
        #[ink(topic)]
        spender: AccountId,
        value: u128,
    }

    /// The ERC-20 error types.
    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    #[allow(clippy::cast_possible_truncation)]
    pub enum Error {
        /// Returned if not enough balance to fulfill a request is available.
        Insufficientu128,
        /// Returned if not enough allowance to fulfill a request is available.
        InsufficientAllowance,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    impl GovernanceToken {
        #[ink(constructor)]
        pub fn new(name: String, symbol: String, total_supply: u128, contract_address:AccountId) -> Self {
            let mut balances = Mapping::default();
            balances.insert(contract_address, &total_supply);
            // balances.insert(Self::env().caller(), &total_supply);
            Self::env().emit_event(Transfer {
                from: None,
                to: Some(contract_address),
                value: total_supply,
            });
            Self {
                name,
                symbol,
                total_supply,
                balances,
                allowances: Default::default(),
                contract_address,
            }
        }

        #[ink(message)]
        pub fn total_supply(&self) -> u128 {
            self.total_supply
        }

        #[ink(message)]
        pub fn balance_of(&self, owner: AccountId) -> u128 {
            self.balance_of_impl(owner)
        }

        fn balance_of_impl(&self, owner: AccountId) -> u128 {
            if self.contract_address == owner {
                ink::env::debug_println!("########## governance_token::balance_of_impl:[0]");
            }
            ink::env::debug_println!("########## governance_token::balance_of_impl:[1]");
            match self.balances.get(owner){
                Some(value) => {
                    ink::env::debug_println!("########## governance_token::balance_of_impl:[2] value:{:?}", value);
                    value
                },
                None => {
                    ink::env::debug_println!("########## governance_token::balance_of_impl:[3]");
                    0
                }
            }
        }

        #[ink(message)]
        pub fn allowance(&self, owner: AccountId, spender: AccountId) -> u128 {
            self.allowance_impl(&owner, &spender)
        }

        fn allowance_impl(&self, owner: &AccountId, spender: &AccountId) -> u128 {
            self.allowances.get((owner, spender)).unwrap_or_default()
        }

        #[ink(message)]
        pub fn transfer(&mut self, to: AccountId, value: u128) -> Result<()> {
            ink::env::debug_println!("########## governance_token::transfer:[1] ");
            let from = self.env().caller();
            // self.transfer_from_to(&from, &to, value)

            ink::env::debug_println!("########## governance_token::transfer_from_to:[1]");
            let from_balance = self.balance_of_impl(from);
            ink::env::debug_println!("########## governance_token::transfer_from_to:[2] ");
            if from_balance < value {
                ink::env::debug_println!("########## governance_token::transfer_from_to:[3] ");
                return Err(Error::Insufficientu128);
            }
            // We checked that from_balance >= value
            // #[allow(clippy::arithmetic_side_effects)]
            ink::env::debug_println!("########## governance_token::transfer_from_to:[4]. from_balance:{:?}  value:{:?}", from_balance, value);
            let sub_balance= match from_balance >= value {
                #[allow(clippy::arithmetic_side_effects)]
                true => from_balance - value,
                false => 0,
            };
            ink::env::debug_println!("########## governance_token::transfer_from_to:[5] sub_balance:{:?}", sub_balance);
            self.balances.insert(&from, &sub_balance);
            ink::env::debug_println!("########## governance_token::transfer_from_to:[6] ");
            let to_balance = self.balance_of_impl(to);
            ink::env::debug_println!("########## governance_token::transfer_from_to:[7] ");
            #[allow(clippy::arithmetic_side_effects)]
            let add_balance = to_balance + value;
            ink::env::debug_println!("########## governance_token::transfer_from_to:[7] add_balance:{:?}", add_balance);
            self.balances.insert(to, &add_balance);
            ink::env::debug_println!("########## governance_token::transfer_from_to:[9] ");
            self.env().emit_event(Transfer {
                from: Some(from),
                to: Some(to),
                value,
            });
            Ok(())
        }

        #[ink(message)]
        pub fn approve(&mut self, spender: AccountId, value: u128) -> Result<()> {
            let owner = self.env().caller();
            self.allowances.insert((&owner, &spender), &value);
            self.env().emit_event(Approval {
                owner,
                spender,
                value,
            });
            Ok(())
        }

        #[ink(message)]
        pub fn transfer_from(
            &mut self,
            from: AccountId,
            to: AccountId,
            value: u128,
        ) -> Result<()> {
            let caller = self.env().caller();
            let allowance = self.allowance_impl(&from, &caller);
            if allowance < value {
                return Err(Error::InsufficientAllowance);
            }
            self.transfer_from_to(from, to, value)?;
            // We checked that allowance >= value
            #[allow(clippy::arithmetic_side_effects)]
            self.allowances
                .insert((&from, &caller), &(allowance - value));
            Ok(())
        }

        fn transfer_from_to(
            &mut self,
            from: AccountId,
            to: AccountId,
            value: u128,
        ) -> Result<()> {
            ink::env::debug_println!("########## governance_token::transfer_from_to:[1]");
            let from_balance = self.balance_of_impl(from);
            ink::env::debug_println!("########## governance_token::transfer_from_to:[2] ");
            if from_balance < value {
                ink::env::debug_println!("########## governance_token::transfer_from_to:[3] ");
                return Err(Error::Insufficientu128);
            }
            // We checked that from_balance >= value
            // #[allow(clippy::arithmetic_side_effects)]
            ink::env::debug_println!("########## governance_token::transfer_from_to:[4]. from_balance:{:?}  value:{:?}", from_balance, value);
            let sub_balance= match from_balance >= value {
                #[allow(clippy::arithmetic_side_effects)]
                true => from_balance - value,
                false => 0,
            };
            ink::env::debug_println!("########## governance_token::transfer_from_to:[5] sub_balance:{:?}", sub_balance);
            self.balances.insert(from, &sub_balance);
            ink::env::debug_println!("########## governance_token::transfer_from_to:[6] ");
            let to_balance = self.balance_of_impl(to);
            ink::env::debug_println!("########## governance_token::transfer_from_to:[7] ");
            #[allow(clippy::arithmetic_side_effects)]
            let add_balance = to_balance + value;
            ink::env::debug_println!("########## governance_token::transfer_from_to:[7] add_balance:{:?}", add_balance);
            self.balances.insert(to, &add_balance);
            ink::env::debug_println!("########## governance_token::transfer_from_to:[9] ");
            self.env().emit_event(Transfer {
                from: Some(from),
                to: Some(to),
                value,
            });
            Ok(())
        }
    }

    /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    /// module and test functions are marked with a `#[test]` attribute.
    /// The below code is technically just normal Rust code.
    #[cfg(test)]
    mod tests {
        use super::*;

        use ink::primitives::{Clear, Hash};

        fn assert_transfer_event(
            event: &ink::env::test::EmittedEvent,
            expected_from: Option<AccountId>,
            expected_to: Option<AccountId>,
            expected_value: u128,
        ) {
            let decoded_event = <Transfer as ink::scale::Decode>::decode(&mut &event.data[..])
                .expect("encountered invalid contract event data buffer");
            let Transfer { from, to, value } = decoded_event;
            assert_eq!(from, expected_from, "encountered invalid Transfer.from");
            assert_eq!(to, expected_to, "encountered invalid Transfer.to");
            assert_eq!(value, expected_value, "encountered invalid Trasfer.value");

            let mut expected_topics = Vec::new();
            expected_topics.push(
                ink::blake2x256!("Transfer(Option<AccountId>,Option<AccountId>,u128)").into(),
            );
            if let Some(from) = expected_from {
                expected_topics.push(encoded_into_hash(from));
            } else {
                expected_topics.push(Hash::CLEAR_HASH);
            }
            if let Some(to) = expected_to {
                expected_topics.push(encoded_into_hash(to));
            } else {
                expected_topics.push(Hash::CLEAR_HASH);
            }
            expected_topics.push(encoded_into_hash(value));

            let topics = event.topics.clone();
            for (n, (actual_topic, expected_topic)) in
                topics.iter().zip(expected_topics).enumerate()
            {
                let mut topic_hash = Hash::CLEAR_HASH;
                let len = actual_topic.len();
                topic_hash.as_mut()[0..len].copy_from_slice(&actual_topic[0..len]);

                assert_eq!(
                    topic_hash, expected_topic,
                    "encountered invalid topic at {n}"
                );
            }
        }

        /// The default constructor does its job.
        #[ink::test]
        fn new_works() {
            // Constructor works.
            let _governance_token = GovernanceToken::new(100);

            // Transfer event triggered during initial construction.
            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(1, emitted_events.len());

            assert_transfer_event(
                &emitted_events[0],
                None,
                Some(AccountId::from([0x01; 32])),
                100,
            );
        }

        /// The total supply was applied.
        #[ink::test]
        fn total_supply_works() {
            // Constructor works.
            let governance_token = GovernanceToken::new(100);
            // Transfer event triggered during initial construction.
            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_transfer_event(
                &emitted_events[0],
                None,
                Some(AccountId::from([0x01; 32])),
                100,
            );
            // Get the token total supply.
            assert_eq!(governance_token.total_supply(), 100);
        }

        /// Get the actual balance of an account.
        #[ink::test]
        fn balance_of_works() {
            // Constructor works
            let governance_token = GovernanceToken::new(100);
            // Transfer event triggered during initial construction
            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_transfer_event(
                &emitted_events[0],
                None,
                Some(AccountId::from([0x01; 32])),
                100,
            );
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            // Alice owns all the tokens on contract instantiation
            assert_eq!(governance_token.balance_of(accounts.alice), 100);
            // Bob does not owns tokens
            assert_eq!(governance_token.balance_of(accounts.bob), 0);
        }

        #[ink::test]
        fn transfer_works() {
            // Constructor works.
            let mut governance_token = GovernanceToken::new(100);
            // Transfer event triggered during initial construction.
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            assert_eq!(governance_token.balance_of(accounts.bob), 0);
            // Alice transfers 10 tokens to Bob.
            assert_eq!(governance_token.transfer(accounts.bob, 10), Ok(()));
            // Bob owns 10 tokens.
            assert_eq!(governance_token.balance_of(accounts.bob), 10);

            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 2);
            // Check first transfer event related to ERC-20 instantiation.
            assert_transfer_event(
                &emitted_events[0],
                None,
                Some(AccountId::from([0x01; 32])),
                100,
            );
            // Check the second transfer event relating to the actual trasfer.
            assert_transfer_event(
                &emitted_events[1],
                Some(AccountId::from([0x01; 32])),
                Some(AccountId::from([0x02; 32])),
                10,
            );
        }

        #[ink::test]
        fn invalid_transfer_should_fail() {
            // Constructor works.
            let mut governance_token = GovernanceToken::new(100);
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            assert_eq!(governance_token.balance_of(accounts.bob), 0);

            // Set the contract as callee and Bob as caller.
            let contract = ink::env::account_id::<ink::env::DefaultEnvironment>();
            ink::env::test::set_callee::<ink::env::DefaultEnvironment>(contract);
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);

            // Bob fails to transfers 10 tokens to Eve.
            assert_eq!(
                governance_token.transfer(accounts.eve, 10),
                Err(Error::Insufficientu128)
            );
            // Alice owns all the tokens.
            assert_eq!(governance_token.balance_of(accounts.alice), 100);
            assert_eq!(governance_token.balance_of(accounts.bob), 0);
            assert_eq!(governance_token.balance_of(accounts.eve), 0);

            // Transfer event triggered during initial construction.
            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 1);
            assert_transfer_event(
                &emitted_events[0],
                None,
                Some(AccountId::from([0x01; 32])),
                100,
            );
        }

        #[ink::test]
        fn transfer_from_works() {
            // Constructor works.
            let mut governance_token = GovernanceToken::new(100);
            // Transfer event triggered during initial construction.
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            // Bob fails to transfer tokens owned by Alice.
            assert_eq!(
                governance_token.transfer_from(accounts.alice, accounts.eve, 10),
                Err(Error::InsufficientAllowance)
            );
            // Alice approves Bob for token transfers on her behalf.
            assert_eq!(governance_token.approve(accounts.bob, 10), Ok(()));

            // The approve event takes place.
            assert_eq!(ink::env::test::recorded_events().count(), 2);

            // Set the contract as callee and Bob as caller.
            let contract = ink::env::account_id::<ink::env::DefaultEnvironment>();
            ink::env::test::set_callee::<ink::env::DefaultEnvironment>(contract);
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);

            // Bob transfers tokens from Alice to Eve.
            assert_eq!(
                governance_token.transfer_from(accounts.alice, accounts.eve, 10),
                Ok(())
            );
            // Eve owns tokens.
            assert_eq!(governance_token.balance_of(accounts.eve), 10);

            // Check all transfer events that happened during the previous calls:
            let emitted_events = ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 3);
            assert_transfer_event(
                &emitted_events[0],
                None,
                Some(AccountId::from([0x01; 32])),
                100,
            );
            // The second event `emitted_events[1]` is an Approve event that we skip
            // checking.
            assert_transfer_event(
                &emitted_events[2],
                Some(AccountId::from([0x01; 32])),
                Some(AccountId::from([0x05; 32])),
                10,
            );
        }

        #[ink::test]
        fn allowance_must_not_change_on_failed_transfer() {
            let mut governance_token = GovernanceToken::new(100);
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();

            // Alice approves Bob for token transfers on her behalf.
            let alice_balance = governance_token.balance_of(accounts.alice);
            let initial_allowance = alice_balance + 2;
            assert_eq!(governance_token.approve(accounts.bob, initial_allowance), Ok(()));

            // Get contract address.
            let callee = ink::env::account_id::<ink::env::DefaultEnvironment>();
            ink::env::test::set_callee::<ink::env::DefaultEnvironment>(callee);
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(accounts.bob);

            // Bob tries to transfer tokens from Alice to Eve.
            let emitted_events_before = ink::env::test::recorded_events().count();
            assert_eq!(
                governance_token.transfer_from(accounts.alice, accounts.eve, alice_balance + 1),
                Err(Error::Insufficientu128)
            );
            // Allowance must have stayed the same
            assert_eq!(
                governance_token.allowance(accounts.alice, accounts.bob),
                initial_allowance
            );
            // No more events must have been emitted
            assert_eq!(
                emitted_events_before,
                ink::env::test::recorded_events().count()
            )
        }

        fn encoded_into_hash<T>(entity: T) -> Hash
        where
            T: ink::scale::Encode,
        {
            use ink::{
                env::hash::{Blake2x256, CryptoHash, HashOutput},
                primitives::Clear,
            };

            let mut result = Hash::CLEAR_HASH;
            let len_result = result.as_ref().len();
            let encoded = entity.encode();
            let len_encoded = encoded.len();
            if len_encoded <= len_result {
                result.as_mut()[..len_encoded].copy_from_slice(&encoded);
                return result;
            }
            let mut hash_output = <<Blake2x256 as HashOutput>::Type as Default>::default();
            <Blake2x256 as CryptoHash>::hash(&encoded, &mut hash_output);
            let copy_len = core::cmp::min(hash_output.len(), len_result);
            result.as_mut()[0..copy_len].copy_from_slice(&hash_output[0..copy_len]);
            result
        }
    }

    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        use super::*;
        use ink_e2e::ContractsBackend;

        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        #[ink_e2e::test]
        async fn e2e_transfer<Client: E2EBackend>(mut client: Client) -> E2EResult<()> {
            // given
            let total_supply = 1_000_000_000;
            let mut constructor = GovernanceTokenRef::new(total_supply);
            let governance_token = client
                .instantiate("governance_token", &ink_e2e::alice(), &mut constructor)
                .submit()
                .await
                .expect("instantiate failed");
            let mut call_builder = governance_token.call_builder::<GovernanceToken>();

            // when
            let total_supply_msg = call_builder.total_supply();
            let total_supply_res = client
                .call(&ink_e2e::bob(), &total_supply_msg)
                .dry_run()
                .await?;

            let bob_account = ink_e2e::account_id(ink_e2e::AccountKeyring::Bob);
            let transfer_to_bob = 500_000_000u128;
            let transfer = call_builder.transfer(bob_account, transfer_to_bob);
            let _transfer_res = client
                .call(&ink_e2e::alice(), &transfer)
                .submit()
                .await
                .expect("transfer failed");

            let balance_of = call_builder.balance_of(bob_account);
            let balance_of_res = client
                .call(&ink_e2e::alice(), &balance_of)
                .dry_run()
                .await?;

            // then
            assert_eq!(
                total_supply,
                total_supply_res.return_value(),
                "total_supply"
            );
            assert_eq!(transfer_to_bob, balance_of_res.return_value(), "balance_of");

            Ok(())
        }

        #[ink_e2e::test]
        async fn e2e_allowances<Client: E2EBackend>(mut client: Client) -> E2EResult<()> {
            // given
            let total_supply = 1_000_000_000;
            let mut constructor = GovernanceTokenRef::new(total_supply);
            let governance_token = client
                .instantiate("governance_token", &ink_e2e::bob(), &mut constructor)
                .submit()
                .await
                .expect("instantiate failed");
            let mut call_builder = governance_token.call_builder::<GovernanceToken>();

            // when

            let bob_account = ink_e2e::account_id(ink_e2e::AccountKeyring::Bob);
            let charlie_account = ink_e2e::account_id(ink_e2e::AccountKeyring::Charlie);

            let amount = 500_000_000u128;
            // tx
            let transfer_from = call_builder.transfer_from(bob_account, charlie_account, amount);
            let transfer_from_result = client
                .call(&ink_e2e::charlie(), &transfer_from)
                .submit()
                .await;

            assert!(
                transfer_from_result.is_err(),
                "unapproved transfer_from should fail"
            );

            // Bob approves Charlie to transfer up to amount on his behalf
            let approved_value = 1_000u128;
            let approve_call = call_builder.approve(charlie_account, approved_value);
            client
                .call(&ink_e2e::bob(), &approve_call)
                .submit()
                .await
                .expect("approve failed");

            // `transfer_from` the approved amount
            let transfer_from =
                call_builder.transfer_from(bob_account, charlie_account, approved_value);
            let transfer_from_result = client
                .call(&ink_e2e::charlie(), &transfer_from)
                .submit()
                .await;
            assert!(
                transfer_from_result.is_ok(),
                "approved transfer_from should succeed"
            );

            let balance_of = call_builder.balance_of(bob_account);
            let balance_of_res = client
                .call(&ink_e2e::alice(), &balance_of)
                .dry_run()
                .await?;

            // `transfer_from` again, this time exceeding the approved amount
            let transfer_from = call_builder.transfer_from(bob_account, charlie_account, 1);
            let transfer_from_result = client
                .call(&ink_e2e::charlie(), &transfer_from)
                .submit()
                .await;
            assert!(
                transfer_from_result.is_err(),
                "transfer_from exceeding the approved amount should fail"
            );

            assert_eq!(
                total_supply - approved_value,
                balance_of_res.return_value(),
                "balance_of"
            );

            Ok(())
        }
    }
}
