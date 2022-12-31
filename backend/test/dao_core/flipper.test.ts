import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import DaoCoreFactory from "./typedContract/constructors/dao_core";
import DaoCore from "./typedContract/contracts/dao_core";
import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";

use(chaiAsPromised);

// Create a new instance of contract
const wsProvider = new WsProvider("ws://127.0.0.1:9944");
// Create a keyring instance
const keyring = new Keyring({ type: "sr25519" });

describe("dao_core test", () => {
  let dao_coreFactory: DaoCoreFactory;
  let api: ApiPromise;
  let deployer: KeyringPair;
  
  let contract: DaoCore;
  const initialState = true;

  before(async function setup(): Promise<void> {
    api = await ApiPromise.create({ provider: wsProvider });
    deployer = keyring.addFromUri("//Alice");

    dao_coreFactory = new DaoCoreFactory(api, deployer);

    contract = new DaoCore(
      (await dao_coreFactory.new(initialState)).address,
      deployer,
      api
    );
  });

  after(async function tearDown() {
    await api.disconnect();
  });

  it("Sets the initial state", async () => {
    expect((await contract.query.get()).value).to.equal(initialState);
  });

  it("Can flip the state", async () => {
    const { gasRequired } = await contract.withSigner(deployer).query.flip();

    await contract.withSigner(deployer).tx.flip({
      gasLimit: gasRequired,
    });

    await expect((await contract.query.get()).value).to.be.equal(!initialState);
  });
});
