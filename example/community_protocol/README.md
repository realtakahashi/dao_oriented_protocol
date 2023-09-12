# How to execute on local environment

## run the astar-collator node 
- download latest binary & ungzip.
- run the node by using local mode.
```
./astar-collator --dev --tmp -lruntime=debug
```

## run the test.ts
- go to the directory "contracts/test".
- modifying as following part.
```
  const wsProvider = new WsProvider("ws://127.0.0.1:9944");
  // const wsProvider = new WsProvider("wss://rpc.shibuya.astar.network");
```
- run the "test.ts" by using ts-node.

## Note the "community list manager address"
- when you run the test.ts, you can find the as following part.
```
Start deployCommunityListManager
# next_community_list_manager_scenario is: 14
End deployCommunityListManager:address: Xwhi8C8m6LJxKnHXfARrY1Vcm8omH1BHdhmgmCASeY4T7oE
```

## run the front-end
- go to the directory "frontend".
- create the file ".env" and write 2 settings in the file as following.
```
NEXT_PUBLIC_COMMUNITY_LIST_MANAGER_CONTRACT_ADDRESS=Xwhi8C8m6LJxKnHXfARrY1Vcm8omH1BHdhmgmCASeY4T7oE
NEXT_PUBLIC_BLOCKCHAIN_URL=ws://127.0.0.1:9944
```
- install the library by using "yarn install".
- execute frontend modules by using "yarn dev".
- access "localhost:3000".