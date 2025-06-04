import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { ContractPromise, CodePromise } from "@polkadot/api-contract";
import { BN } from "@polkadot/util";
import assert from "assert";

import ColorContract from "./contract_files/color_the_internet.contract.json";
import ColorContractAbi from "../color_the_internet/target/ink/color_the_internet.json";
import GovernanceContract from "./contract_files/governance_token.contract.json";
import GovernanceContractAbi from "../governance_token/target/ink/governance_token.json";

let api: any;
let deployer: any;
let keyring: any;
const storageDepositLimit = null;

let next_scenario: number = 1;

let colorContractAddress = "";
let governanceContractAddress = "";

const checkEventsAndInculueError = (events: any[]): boolean => {
  let ret = false;
  events.forEach(({ event: { data } }) => {
    // console.log("### data.methhod:", data.method);
    if (String(data.method) == "ExtrinsicFailed") {
      console.log("######## detail:", String(data));
      console.log("######## check ExtrinsicFailed");
      ret = true;
    }
  });
  // console.log("### ret is:", ret);
  return ret;
};

export const getGasLimitForNotDeploy = (api: any): any => {
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: new BN("100000000000"),
    proofSize: new BN("100000000000"),
    // refTime: 6219235328,
    // proofSize: 131072,
  });
  return gasLimit;
};

var functionId = 0;

const controllerFunction = async () => {
  switch (functionId){
    case 0:
      await initialize();
      await deployColorTheInternet(controllerFunction);
      break;
    case 1:
      await deployGovernanceToken(controllerFunction);
      break;
    case 2:
      await setGovernanceTokenAddress(controllerFunction);
      break;
    case 3:
      finish();
      break;
    default:
      api.disconnect();
  }
}


const initialize = async () => {
  const wsProvider = new WsProvider("ws://127.0.0.1:9944");
  api = await ApiPromise.create({ provider: wsProvider });
  keyring = new Keyring({ type: "sr25519" });
  deployer = keyring.addFromUri("//Alice");

}


const finish = async () => {
  console.log("## Finish deploy");
  api.disconnect();
}

const setGovernanceTokenAddress = async (callBack: () => void) => {
  functionId = 3;
  console.log("## Start setGovernanceTokenAddress");

  const contractWasm = ColorContract.source.wasm;
  const contract = new ContractPromise(
    api,
    ColorContractAbi,
    colorContractAddress
  );
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const { gasRequired } = await contract.query.setGovernanceTokenAddress(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    governanceContractAddress
  );
  const tx = await contract.tx.setGovernanceTokenAddress(
    { value: 0, gasLimit: gasRequired },
    governanceContractAddress
  );
  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("################# Transaction is failure.");
      }
      unsub();
      console.log("## End setGovernanceTokenAddress");
      callBack();
    }
  });
};

// deployColorTheInternet
const deployColorTheInternet = async (callBack: () => void) => {
    functionId = 1;
    console.log("## Start deployColorTheInternet");
  
    const contractWasm = ColorContract.source.wasm;
    const contract = new CodePromise(api, ColorContractAbi, contractWasm);
    const gasLimit: any = api.registry.createType("WeightV2", {
      refTime: 3219235328,
      proofSize: 131072,
    });
  
    const tx = contract.tx.new({ gasLimit, storageDepositLimit }, 1000);
  
    //@ts-ignore
    const unsub = await tx.signAndSend(
      deployer,
      //@ts-ignore
      ({ events = [], status, contract }) => {
        if (status.isFinalized) {
          if (checkEventsAndInculueError(events)) {
            console.log("Transaction is failure.");
          } else {
            colorContractAddress = contract.address.toString();
          }
          unsub();
          console.log("### colorContractAddress:", colorContractAddress);
          console.log("## End deployColorTheInternet");
          callBack();
        }
      }
    );
  };

// deployGovernanceToken
const deployGovernanceToken = async (callBack: () => void) => {
  functionId = 2;
  console.log("## Start deployGovernanceToken");

  const contractWasm = GovernanceContract.source.wasm;
  const contract = new CodePromise(api, GovernanceContractAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new(
    { gasLimit, storageDepositLimit },
    "Color Token",
    "CTI",
    999999999999999,
    colorContractAddress
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(
    deployer,
    //@ts-ignore
    ({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
          governanceContractAddress = contract.address.toString();
        }
        unsub();
        console.log(
          "### governanceContractAddress:",
          governanceContractAddress
        );
        console.log("## End deployGovernanceToken");
        callBack();
      }
    }
  );
};


controllerFunction();