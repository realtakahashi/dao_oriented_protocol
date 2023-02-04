# dao4.commons.2.0
## Rough Design
### Default Proposal Manager
```
|------------------------
| Proposal Manager
|  - Have proposal datas
|  - Interface which someone add a proposal
|   * Someone who want to add a proposal have to ask whether they can add it to rights manager
|-------------------------
```
### Default Rights Manager
```
|------------------------
| Rights Manager
| - Manage DAO rights in general
| - Right to propose, vote, manage elections, etc.
|------------------------
```
### Default Voting Manager
```
|------------------------
| Voting Manager
| - Have functions related voting
|------------------------
```
## Relation
```
|------------------| 
| Proposal Manager |
|------------------|
   |
 Get Rights
   |
   v
|-----------------|
| Rights Manager  |
|-----------------|

```