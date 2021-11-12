import * as idb from 'idb-keyval';

export const TTL_DB_STORE_KEY = 'ttl-db-store-key';

function isObject(obj: any): boolean {
  return obj !== null && !['number', 'undefined', 'string', 'symbol'].includes(typeof obj);
}

export type ValueWithTTL<T = any> = {
  [TTL_DB_STORE_KEY]?: number;
  value: T;
};

export function set(
  key: IDBValidKey,
  value: any,
  options?: { ttl?: number },
): Promise<void> {
  if (typeof options?.ttl === 'number') {
    return idb.set(key, {
      value,
      [TTL_DB_STORE_KEY]: Date.now() + options.ttl * 1000,
    });
  }
  return idb.set(key, { value });
}

export function get<T = any>(key: IDBValidKey): Promise<T | undefined> {
  return idb.get<ValueWithTTL<T>>(key).then((data) => {
    if (data) {
      if (
        isObject(data) &&
        typeof data[TTL_DB_STORE_KEY] === 'number' &&
        data[TTL_DB_STORE_KEY]! < Date.now()
      ) {
        return idb.del(key).then(() => undefined);
      }
      return data?.value;
    }
    return undefined;
  });
}

export type SetManyEntries =
  | [IDBValidKey, any]
  | [IDBValidKey, any, { ttl?: number }];
export function setMany(entries: SetManyEntries[]): Promise<void> {
  return idb.setMany(
    entries.map(([key, value, options]) => {
      if (typeof options?.ttl === 'number') {
        return [key, { value, [TTL_DB_STORE_KEY]: Date.now() + options.ttl * 1000 }];
      }
      return [key, { value }];
    }),
  );
}

export function getMany<T = any>(
  keys: IDBValidKey[],
): Promise<(T | undefined)[]> {
  return idb.getMany<ValueWithTTL<T>>(keys).then((data) => {
    return Promise.all(
      data.map((item, index) => {
        if (item) {
          if (
            isObject(item) &&
            typeof item[TTL_DB_STORE_KEY] === 'number' &&
            item[TTL_DB_STORE_KEY]! < Date.now()
          ) {
            return idb.del(keys[index]).then(() => undefined);
          }
          return Promise.resolve(item?.value);
        }
        return Promise.resolve(undefined);
      }),
    );
  });
}

export function update<T = any>(
  key: IDBValidKey,
  updater: (oldValue: T | undefined) => T,
  options?: { ttl?: number },
): Promise<void> {
  return idb.update<ValueWithTTL<T>>(key, (oldValue) => {
    let nextValue: any;
    if (oldValue) {
      if (
        isObject(oldValue) &&
        typeof oldValue[TTL_DB_STORE_KEY] === 'number' &&
        oldValue[TTL_DB_STORE_KEY]! < Date.now()
      ) {
        nextValue = updater(undefined);
      } else {
        nextValue = updater(oldValue?.value);
      }
    } else {
      nextValue = updater(undefined);
    }
    return {
      value: nextValue,
      [TTL_DB_STORE_KEY]:
        typeof options?.ttl === 'number' ? Date.now() + options.ttl * 1000 : undefined,
    };
  });
}

export function del(key: IDBValidKey): Promise<void> {
  return idb.del(key);
}

export function delMany(keys: IDBValidKey[]): Promise<void> {
  return idb.delMany(keys);
}

export function clear(): Promise<void> {
  return idb.clear();
}
