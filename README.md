# loopback-deep-filter

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

## Developers\*\*

Alan Mamani (creator) - [alanfernando93.am@gmail.com](mailto:alanfernando93.am@gmail.com) - [https://gitlab.com/alanfernando93](https://gitlab.com/alanfernando93)

Huáscar Miranda Martínez (collaborator) - [huascarm@gmail.com](mailto:huascarm@gmail.com) - [https://github.com/huascarmm](https://github.com/huascarmm)

## Installation

Install using `npm`;

```sh
$ npm install loopback-deep-filter
```

Install using `yarn`;

```sh
$ yarn add loopback-deep-filter
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

more examples, folder **\_/src/**tests**/integration\_**
