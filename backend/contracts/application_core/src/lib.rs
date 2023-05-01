#![cfg_attr(not(feature = "std"), no_std)]

#[openbrush::contract]
mod application_core {
    use openbrush::{ storage::Mapping, traits::Storage};
    use ink::prelude::string::{String};
    use ink::prelude::string::ToString;
    use ink::prelude::{vec::Vec};
    use ink::storage::traits::StorageLayout;
    use contract_helper::{traits::types::types::{*, ProposalInfo, ProposalStatus}, common::common_logics};
    use default_contract::default_contract::{DefaultContractRef};
    use contract_helper::traits::contract_base::contract_base::contractbase_external::ContractBase;
    use contract_helper::traits::contract_base::contract_base::*;

//     use communication_base::communication_base::CommunicationBaseRef;
    use scale::{Decode};

    #[derive(Debug, Clone, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub enum SoftwareKind {
        MemberManager,
        ProposalManager,
        Election,
        Other,
    }

    #[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]    
    pub struct SoftwareInfo {
        id: u128,
        kind: SoftwareKind,
        name: String,
        contract_address: AccountId,
        description: String,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        TheSoftwareIsAlreadyInstalled,
        TheSoftwareDoesNotExists,
        CallFromInvalidOrigin,
        UserDoesNotExists,
        TheValueCanSetOnlyOnce,
        TheApplicationCoreAddressStringMustBeSet,
        InvalidTheApplicationCoreAddressString,
        CommunicationBaseCallingError,
        Custom(String),
    }

    pub type Result<T> = core::result::Result<T, Error>;

    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct ApplicationCore {
        installed_software_list_with_address: Mapping<AccountId,SoftwareInfo>,
        installed_software_list_with_id: Mapping<u128, SoftwareInfo>,
        next_software_id: u128,
        pre_install_member_manger: Option<AccountId>,
        pre_install_proposal_manager: Option<AccountId>,
        pre_install_election: Option<AccountId>,
//        communication_base_address: Option<AccountId>,
        // appliction_core_address_string: Option<String>,
    }

    impl ApplicationCore {
        #[ink(constructor)]
        // pub fn new(pre_install_member_manger:AccountId, pre_install_proposal_manager:AccountId, pre_install_election:AccountId, 
        //     communication_base_address:AccountId) -> Self {
        pub fn new(pre_install_member_manger:AccountId, pre_install_proposal_manager:AccountId, pre_install_election:AccountId) -> Self {
            let mut instance = Self::default();
            instance.pre_install_member_manger = Some(pre_install_member_manger);
            instance.pre_install_proposal_manager = Some(pre_install_proposal_manager);
            instance.pre_install_election = Some(pre_install_election);
            instance._set_application_core_address(pre_install_member_manger);    
            instance._set_application_core_address(pre_install_proposal_manager);    
            instance._set_application_core_address(pre_install_election);    
            // instance.communication_base_address = Some(communication_base_address);

            instance
        }

        // #[ink(message)]
        // pub fn set_appliction_core_address_string(&mut self, address_string:String) -> Result<()>{
        //     match self.appliction_core_address_string{
        //         Some(_) => return Err(Error::TheValueCanSetOnlyOnce),
        //         None => self.appliction_core_address_string = Some(address_string),
        //     }
        //     // todo: preインストールのソフトウェアにset_dao_addressをコールする
        //     Ok(())
        // }

        #[ink(message)]
        pub fn get_installed_software(&self) -> Vec<SoftwareInfo> {
            let mut result:Vec<SoftwareInfo> = Vec::new();
            for i in 0..self.next_software_id {
                match self.installed_software_list_with_id.get(&i) {
                    Some(value) => result.push(value),
                    None => (),
                }
            }
            result
        }

        /// parameter_dsv: Specify the delimiter in the "$X$" format. ex1) "aaa$1$bbb" ex2) "aaa$1$bbb$1$ccc$2$ddd"
        #[ink(message)]
        pub fn execute_interface(&mut self,target_contract_address: AccountId, function_name: String, parameter_dsv: String) -> Result<()>{
            ink::env::debug_println!("########## application_core:execute_interface [0] ###############");
            // todo: install済みソフトウェアかチェクが必要
            if self._modifier_only_call_from_member_eoa() == false {
                return Err(Error::CallFromInvalidOrigin);
            }

            ink::env::debug_println!("########## application_core:execute_interface [1] ###############");
            let mut instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(target_contract_address);
            match instance.execute_interface(function_name, parameter_dsv, self.env().caller(), self.env().account_id()){
                Ok(()) => Ok(()),
                Err(_) => return Err(Error::Custom("ExecutionIsFailure".to_string())),
            }

            // let mut instance: CommunicationBaseRef =
            //     ink::env::call::FromAccountId::from_account_id(self.communication_base_address.unwrap());
            // match instance.call_execute_interface_of_function(
            //     target_contract_address,
            //     function_name,
            //     parameter_dsv,
            //     self.env().caller()
            // ){
            //     Ok(()) => Ok(()),
            //     Err(_) => return Err(Error::Custom("ExecutionIsFailure".to_string())),
            // }
        }

        /// InstallはProposalで認められた場合のみ実行出来るようにする
        #[ink(message)]
        pub fn install_software(&mut self, proposal_id:u128 ) -> Result<()> {
            if self._modifier_only_call_from_member_eoa() == false {
                return Err(Error::CallFromInvalidOrigin);
            }
            // match self._check_applicaiton_core_address_string() {
            //     Ok(()) => (),
            //     Err(error) => return Err(error),
            // }
            let software_info = match self._get_proposal_info_and_create_software_info(proposal_id) {
                Ok(value) => value,
                Err(error) => return Err(error),
            };
            
            match self.installed_software_list_with_address.get(&software_info.contract_address) {
                Some(_) => return Err(Error::TheSoftwareIsAlreadyInstalled),
                None => {
                    match software_info.kind { 
                        SoftwareKind::ProposalManager | SoftwareKind::MemberManager | SoftwareKind::Election => 
                            match self._uninstall_present_proposal_memeber_election(software_info.id){
                                Ok(()) => (),
                                Err(error) => return Err(error),
                            },
                        _ => (),
                    }
                    self.installed_software_list_with_id.insert(&self.next_software_id, &software_info);
                    self.installed_software_list_with_address.insert(&software_info.contract_address.clone(), &software_info);
                    match self._set_application_core_address(software_info.contract_address) {
                        Ok(()) => (),
                        Err(error) => return Err(error),
                    }
                    self.next_software_id += 1;
                    Ok(())
                },
            }
        }

        #[ink(message)]
        pub fn uninstall_software(&mut self, target_proposal_id:u128) -> Result<()> {
            if self._modifier_only_call_from_member_eoa() == false {
                return Err(Error::CallFromInvalidOrigin);
            }
            // match self._check_applicaiton_core_address_string() {
            //     Ok(()) => (),
            //     Err(error) => return Err(error),
            // }
            let proposal_info = match self._get_proposal_info(target_proposal_id) {
                Ok(value) => value,
                Err(error) => return Err(error),
            };
            if proposal_info.target_contract != self.env().account_id() {
                return Err(Error::Custom("InvalidProposal".to_string()));
            }
            if proposal_info.target_function != "uninstall_software" {
                return Err(Error::Custom("InvalidProposal".to_string()));
            }
            
            let params = common_logics::change_dsv_string_to_vec_of_string(proposal_info.parameters,"$1$".to_string());
            if params.len() != 1 {
                return Err(Error::Custom("InvalidProposal".to_string()));
            }
            let software_id = match common_logics::convert_string_to_u128(&params[0]){
                Ok(value) => value,
                Err(_) => return Err(Error::Custom("InvalidProposal".to_string())),
            };            
            self._uninstall_software_impl(software_id)
            
        }

        fn _uninstall_software_impl(&mut self, software_id:u128) -> Result<()> {

            let software_info = match self.installed_software_list_with_id.get(&software_id){
                Some(value) => value,
                None => return Err(Error::Custom("InvalidSoftwareId".to_string())),
            };

            self.installed_software_list_with_address.remove(&software_info.contract_address);
            self.installed_software_list_with_id.remove(&software_id);

            Ok(())
        }

        fn _uninstall_present_proposal_memeber_election(&mut self, software_id:u128) -> Result<()> {
            let software_list = self.get_installed_software();
            for software in software_list {
                if software.id == software_id {
                    self.installed_software_list_with_address.remove(&software.contract_address);
                    self.installed_software_list_with_id.remove(&software_id);
                }
            }
            Ok(())
        }

        // fn _check_software_interface(interface_list: Vec<String>) -> Result<()> {
        //     // 各softwareのexecute_interfaceの存在の有無を確認する。
        //     Ok(())
        // }

        fn _set_application_core_address(&self, target_contract_address:AccountId) -> Result<()> {
            // let address_string = match &self.appliction_core_address_string {
            //     Some(value) => value,
            //     None => return Err(Error::TheApplicationCoreAddressStringMustBeSet),
            // };
            let address_string = hex::encode(self.env().account_id());
            let mut instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(target_contract_address);
            match instance.execute_interface("set_application_core_address".to_string(), address_string.to_string(), self.env().caller(), self.env().account_id()){
                Ok(()) => Ok(()),
                Err(_) => Err(Error::CommunicationBaseCallingError),
            }

            // let mut instance: CommunicationBaseRef =
            // ink::env::call::FromAccountId::from_account_id(
            //     self.communication_base_address.unwrap(),
            // );
            // match instance.call_execute_interface_of_function(
            //     target_contract_address,
            //     "set_dao_address".to_string(),
            //     address_string.to_string(),
            //     self.env().caller()
            // ) {
            //     Ok(()) => Ok(()),
            //     Err(_) => Err(Error::CommunicationBaseCallingError),
            // }
        }

        fn _modifier_only_call_from_member_eoa(&self) -> bool {
            match self._get_member_info_list() {
                Ok(member_list) => {
                    for member_info in member_list {
                        if member_info.address == self.env().caller() {
                            return true;
                        };
                    }
                }
                Err(_) => return false,
            }
            false
        }

        fn _get_member_info_list(
            &self,
        ) -> core::result::Result<Vec<MemberInfo>, Error> {
            let member_manager_address = self._get_member_manager_address();
            let mut result: Vec<MemberInfo> = Vec::new();
            // let instance: CommunicationBaseRef =
            //     ink::env::call::FromAccountId::from_account_id(self.communication_base_address.unwrap());
            // let get_value: Vec<Vec<u8>> = instance
            //     .get_data_from_contract(member_manager_address, "get_member_list".to_string());
            let instance: DefaultContractRef = ink::env::call::FromAccountId::from_account_id(member_manager_address);
            let get_value: Vec<Vec<u8>> = instance.get_data("get_member_list".to_string());

            for value in get_value.iter() {
                let array_value: &[u8] = value.as_slice().try_into().unwrap();
                match MemberInfo::decode(&mut array_value.clone()) {
                    Ok(value) => result.push(value),
                    Err(_) => {
                        return Err(Error::Custom(
                            "GotAnErrorGettingMemberInfo".to_string(),
                        ))
                    }
                };
            }
            Ok(result)
        }

        fn _get_member_manager_address(&self) -> AccountId {
            let list = self.get_installed_software();
            for info in list {
                if info.kind == SoftwareKind::MemberManager {
                    return info.contract_address;
                }
            }
            return self.pre_install_member_manger.unwrap();
        }

        fn _get_proposal_info_and_create_software_info(&self, proposal_id:u128) -> core::result::Result<SoftwareInfo,Error> {
            match self._get_proposal_info(proposal_id){
                Ok(value) => self._create_software_info_by_proposal_info(value),
                Err(error) => Err(error),
            }
        }

        fn _get_proposal_info(&self, proposal_id:u128) -> core::result::Result<ProposalInfo,Error> {
            let proposal_manager_address = self._get_proposal_manager_address();
            // let instance: CommunicationBaseRef =
            //     ink::env::call::FromAccountId::from_account_id(self.communication_base_address.unwrap());
            // let get_value: Vec<Vec<u8>> = instance
            //     .get_data_from_contract(proposal_manager_address, "get_proposal_info_list".to_string());

            let instance: DefaultContractRef = ink::env::call::FromAccountId::from_account_id(proposal_manager_address);
            let get_value: Vec<Vec<u8>> = instance.get_data("get_proposal_info_list".to_string());

            for value in get_value.iter() {
                let array_value: &[u8] = value.as_slice().try_into().unwrap();
                match ProposalInfo::decode(&mut array_value.clone()) {
                    Ok(value) => {
                        if value.id == proposal_id {
                            if value.status != ProposalStatus::Executed {
                                return Err(Error::Custom("ThisProposalStatusIdNotExecuted.".to_string()));
                            }
                            else{
                                return Ok(value);
                            }
                        }
                    },
                    Err(_) => {
                        return Err(Error::Custom(
                            "GotAnErrorGettingProposalInfo".to_string(),
                        ))
                    }
                };
            }
            return Err(Error::Custom("TargetProposalDoesNotFind".to_string()));

        }

        fn _create_software_info_by_proposal_info(&self, proposal_info:ProposalInfo) -> core::result::Result<SoftwareInfo,Error> {
            if proposal_info.target_contract != self.env().account_id() {
                return Err(Error::Custom("InvalidProposal".to_string()));
            }
            if proposal_info.target_function != "install_software" {
                return Err(Error::Custom("InvalidProposal".to_string()));
            }
            let parameters = common_logics::change_dsv_string_to_vec_of_string(proposal_info.parameters,"$1$".to_string());
            match parameters.len() == 4 {
                true =>{
                    let contract_address = match common_logics::convert_string_to_accountid(&parameters[3]){
                        Some(value) => value,
                        None => return Err(Error::Custom("InvalidProposal".to_string())),
                    };
                    let result = SoftwareInfo{
                        id: self.next_software_id,
                        kind:self._change_string_2_software_kind(&parameters[0]),
                        name: parameters[1].clone(),
                        description: parameters[2].clone(),
                        contract_address: contract_address,
                    };
                    return Ok(result);

                },
                false => return Err(Error::Custom("InvalidProposal".to_string())),
            }
        }

        fn _change_string_2_software_kind(&self, string_value:&String) -> SoftwareKind {
            match string_value.as_str() {
                "MemberManager" => SoftwareKind::MemberManager,
                "ProposalManager" => SoftwareKind::ProposalManager,
                "Election" => SoftwareKind::Election,
                _ => SoftwareKind::Other,
            }
        }

        fn _get_proposal_manager_address(&self) -> AccountId {
            let list = self.get_installed_software();
            for info in list {
                if info.kind == SoftwareKind::ProposalManager {
                    return info.contract_address;
                }
            }
            return self.pre_install_proposal_manager.unwrap();
        }

        // fn _check_applicaiton_core_address_string(&self) -> Result<()> {
        //     let address_sting =  match &self.appliction_core_address_string  {
        //         Some(value) => value,
        //         None => return Err(Error::TheApplicationCoreAddressStringMustBeSet),
        //     };
                
        //     let tmp = match common_logics::convert_string_to_accountid(&address_sting){
        //         Some(value) => value,
        //         None => return Err(Error::Custom("MayBeInvalidAddressStringWasSet".to_string())),
        //     };
        //     match tmp == self.env().account_id() {
        //         true => Ok(()),
        //         false => return Err(Error::InvalidTheApplicationCoreAddressString),
        //     }
        // }
    }

}

