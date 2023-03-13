# loopback-component-filter

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

## Installation

Install LoopbackFilterComponent using `npm`;

```sh
$ npm install loopback-deep-filter
```

## Basic Use

Configure and load LoopbackFilterComponent in the application constructor
as shown below.

```ts
import { DeepCrudRepository } from "@monkey-space/loopback-component-filter";
```

replace <code>DefaultCrudRepository</code> to <code>DeepCrudRepository</code> in folder repositories

```ts
export class TrackingRoomRepository extends DeepCrudRepository<
  TrackingRoom,
  typeof TrackingRoom.prototype.id,
  TrackingRoomRelations
> {
  // Only the Find property is affected by the base repository DeepCrudRepository
...
```

## Format filter

body example to filter format

```json
{
  "where": {
    "payments": "undefined", // Returns all entities if `payments` is different to undefined (it is required)
    "payments.name": "example",
    "payments.description": "valueToEqual"
  },
  "include": ["payments"]
  // Order, Fields, Limit remains the configuration
}
```

more examples, folder **_/src/**tests**/integration_**
