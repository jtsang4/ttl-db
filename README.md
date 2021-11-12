# ttl-db

A key-value store which supports expiration time based on IndexedDB.

Powered by [idb-keyval](https://github.com/jakearchibald/idb-keyval).

## Installation

Install dependencies,

```bash
$ npm i ttl-db --save
```
## API

All APIs return a promise because all of them is asynchronous operation.

### `set`:

Set value by key, support expiration time.

```ts
import { set } from 'ttl-db';

set(key, value); // won't expire
// or
set(key, value, { ttl: 60 }); // expires after 60 seconds
```

### `get`:

Get value by key.

```ts
import { get } from 'ttl-db';

get(key);
```

### `setMany`:

Set batch of key-value parallelly for speed up, support expiration time.

```ts
import { setMany } from 'ttl-db';

setMany([
  [key1, value1], // won't expire
  [key2, value2, { ttl: 60 }], // expires after 60 seconds
]);
```

### `getMany`:

Get batch of value parallelly for speed up.

```ts
import { getMany } from 'ttl-db';

get([key1, key2]);
```

### `update`:

Update value of key.

```ts
import { update } from 'ttl-db';

update(key, (oldValue) => oldValue + 1); // won't expire
// or
update(key, (oldValue) => oldValue + 1, { ttl: 60 }); // expires after 60 seconds
```

### `del`:

Delete key.

```ts
import { del } from 'ttl-db';

del(key);
```

### `delMany`:

Delete keys.

```ts
import { delMany } from 'ttl-db';

delMany([key1, key2]);
```

### `clear`:

Clear entire store.

```ts
import { clear } from 'ttl-db';

clear();
```
