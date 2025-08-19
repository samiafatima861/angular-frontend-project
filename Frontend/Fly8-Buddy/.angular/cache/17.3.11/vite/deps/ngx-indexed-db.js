import {
  DOCUMENT,
  isPlatformBrowser
} from "./chunk-RI44W3PM.js";
import {
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
  PLATFORM_ID,
  assertInInjectionContext,
  inject,
  isDevMode,
  makeEnvironmentProviders,
  setClassMetadata,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵinject
} from "./chunk-BNZ4NPBZ.js";
import "./chunk-EBFZS7JW.js";
import "./chunk-5OP3PFHM.js";
import {
  Observable,
  Subject,
  __decorate,
  combineLatest,
  finalize,
  from,
  take
} from "./chunk-VERL6D47.js";
import {
  __async
} from "./chunk-ASLTLD6L.js";

// node_modules/ngx-indexed-db/fesm2022/ngx-indexed-db.mjs
var DBMode;
(function(DBMode2) {
  DBMode2["readonly"] = "readonly";
  DBMode2["readwrite"] = "readwrite";
})(DBMode || (DBMode = {}));
var CONFIG_TOKEN = new InjectionToken(null);
var INDEXED_DB = new InjectionToken("Indexed DB");
var SERVER_INDEXED_DB = new InjectionToken("Server Indexed DB");
function validateStoreName(db, storeName) {
  return db.objectStoreNames.contains(storeName);
}
function validateBeforeTransaction(db, storeName, reject) {
  if (!db) {
    reject("You need to use the openDatabase function to create a database before you query it!");
    return;
  }
  if (!validateStoreName(db, storeName)) {
    reject(`objectStore does not exists: ${storeName}`);
  }
}
function createTransaction(db, options) {
  const trans = db.transaction(options.storeName, options.dbMode);
  trans.onerror = options.error;
  trans.onabort = options.abort;
  return trans;
}
function optionsGenerator(type, storeName, reject, resolve) {
  return {
    storeName,
    dbMode: type,
    error: (e) => {
      reject(e);
    },
    abort: (e) => {
      reject(e);
    }
  };
}
var openedDatabases = [];
function openDatabase(indexedDB2, dbName, version, upgradeCallback) {
  return new Promise((resolve, reject) => {
    if (!indexedDB2) {
      reject("IndexedDB not available");
    }
    const request = indexedDB2.open(dbName, version);
    let db;
    request.onsuccess = (event) => {
      db = request.result;
      openedDatabases.push(db);
      resolve(db);
    };
    request.onerror = (event) => {
      reject(`IndexedDB error: ${request.error}`);
    };
    if (typeof upgradeCallback === "function") {
      request.onupgradeneeded = (event) => {
        upgradeCallback(event, db);
      };
    }
  });
}
function CreateObjectStore(indexedDB2, dbName, version, storeSchemas, migrationFactory) {
  return __async(this, null, function* () {
    return new Promise((resolve, reject) => {
      if (!indexedDB2) {
        return;
      }
      const request = indexedDB2.open(dbName, version);
      request.onupgradeneeded = (event) => __async(this, null, function* () {
        const database = event.target.result;
        const storeCreationPromises = storeSchemas.map((storeSchema) => __async(this, null, function* () {
          if (!database.objectStoreNames.contains(storeSchema.store)) {
            const objectStore = database.createObjectStore(storeSchema.store, storeSchema.storeConfig);
            for (const schema of storeSchema.storeSchema) {
              objectStore.createIndex(schema.name, schema.keypath, schema.options);
            }
          }
        }));
        yield Promise.all(storeCreationPromises);
        const storeMigrations = migrationFactory && migrationFactory();
        if (storeMigrations) {
          const migrationKeys = Object.keys(storeMigrations).map((k) => parseInt(k, 10)).filter((v) => v > event.oldVersion).sort((a, b) => a - b);
          for (const v of migrationKeys) {
            storeMigrations[v](database, request.transaction);
          }
        }
        database.close();
        resolve();
      });
      request.onsuccess = (e) => {
        e.target.result.close();
        resolve();
      };
      request.onerror = (error) => {
        reject(error);
      };
    });
  });
}
function DeleteObjectStore(dbName, version, storeName) {
  if (!dbName || !version || !storeName) {
    throw Error('Params: "dbName", "version", "storeName" are mandatory.');
  }
  return new Observable((obs) => {
    try {
      const newVersion = version + 1;
      const request = indexedDB.open(dbName, newVersion);
      request.onupgradeneeded = (event) => {
        const database = event.target.result;
        database.deleteObjectStore(storeName);
        database.close();
        console.log("onupgradeneeded");
        obs.next(true);
        obs.complete();
      };
      request.onerror = (e) => obs.error(e);
    } catch (error) {
      obs.error(error);
    }
  });
}
function closeDatabase(db) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error("No database to close"));
      return;
    }
    try {
      db.close();
      resolve();
    } catch (error) {
      reject(`Error closing database: ${error}`);
    }
  });
}
function CloseDbConnection() {
  return function(_target, _propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function(...args) {
      const result = originalMethod.apply(this, args);
      if (result instanceof Observable) {
        return result.pipe(finalize(() => __async(this, null, function* () {
          const promises = openedDatabases.map((db) => __async(this, null, function* () {
            yield closeDatabase(db);
          }));
          yield Promise.all(promises);
          openedDatabases.length = 0;
        })));
      }
      return result;
    };
    return descriptor;
  };
}
var NgxIndexedDBService = class _NgxIndexedDBService {
  constructor(dbConfigs, indexedDB2) {
    this.dbConfigs = dbConfigs;
    this.indexedDB = indexedDB2;
    this.defaultDatabaseName = null;
    Object.values(this.dbConfigs).forEach((dbConfig, _, ref) => this.instanciateConfig(dbConfig, ref.length === 1));
  }
  instanciateConfig(dbConfig, isOnlyConfig) {
    return __async(this, null, function* () {
      if (!dbConfig.name) {
        throw new Error("NgxIndexedDB: Please, provide the dbName in the configuration");
      }
      if (!dbConfig.version) {
        throw new Error("NgxIndexedDB: Please, provide the db version in the configuration");
      }
      if ((dbConfig.isDefault ?? false) && this.defaultDatabaseName) {
        throw new Error("NgxIndexedDB: Only one database can be set as default");
      }
      if ((dbConfig.isDefault ?? false) && !this.defaultDatabaseName || isOnlyConfig) {
        this.defaultDatabaseName = dbConfig.name;
        this.selectedDb = dbConfig.name;
      }
      yield CreateObjectStore(this.indexedDB, dbConfig.name, dbConfig.version, dbConfig.objectStoresMeta, dbConfig.migrationFactory);
      openDatabase(this.indexedDB, dbConfig.name).then((db) => {
        if (db.version !== dbConfig.version) {
          if (isDevMode()) {
            console.warn(`
            Your DB Config doesn't match the most recent version of the DB with name ${dbConfig.name}, please update it
            DB current version: ${db.version};
            Your configuration: ${dbConfig.version};
            `);
            console.warn(`Using latest version ${db.version}`);
          }
          this.dbConfigs[dbConfig.name].version = db.version;
        }
        db.close();
      });
    });
  }
  get dbConfig() {
    return this.dbConfigs[this.selectedDb];
  }
  /**
   * The function return the current version of database
   *
   * @Return the current version of database as number
   */
  getDatabaseVersion() {
    return new Observable((obs) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
        obs.next(db.version);
        obs.complete();
      }).catch((err) => obs.error(`error during get version of database => ${err} `));
    });
  }
  /**
   * Selects a database for the current context.
   * @param {string} [databaseName=undefined] Database name to select.
   */
  selectDb(databaseName) {
    databaseName = databaseName ?? this.defaultDatabaseName;
    if (!databaseName) {
      throw new Error(`No database name specified and no default database set.`);
    }
    if (!Object.keys(this.dbConfigs).includes(databaseName)) {
      throw new Error(`NgxIndexedDB: Database ${databaseName} is not initialized.`);
    }
    this.selectedDb = databaseName;
  }
  /**
   * Allows to create a new object store ad-hoc
   * @param storeName The name of the store to be created
   * @param migrationFactory The migration factory if exists
   */
  createObjectStore(storeSchema, migrationFactory) {
    return __async(this, null, function* () {
      const storeSchemas = [storeSchema];
      yield CreateObjectStore(this.indexedDB, this.dbConfig.name, ++this.dbConfig.version, storeSchemas, migrationFactory);
    });
  }
  /**
   * Adds new entry in the store and returns its key
   * @param storeName The name of the store to add the item
   * @param value The entry to be added
   * @param key The optional key for the entry
   */
  add(storeName, value, key) {
    return new Observable((obs) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
        const transaction = createTransaction(db, optionsGenerator(DBMode.readwrite, storeName, (e) => obs.error(e)));
        const objectStore = transaction.objectStore(storeName);
        const request = Boolean(key) ? objectStore.add(value, key) : objectStore.add(value);
        request.onsuccess = (evt) => __async(this, null, function* () {
          const result = evt.target.result;
          const getRequest = objectStore.get(result);
          getRequest.onsuccess = (event) => {
            obs.next(event.target.result);
            obs.complete();
          };
          getRequest.onerror = (event) => {
            obs.error(event);
          };
        });
        request.onerror = (event) => {
          obs.error(event);
        };
      }).catch((error) => obs.error(error));
    });
  }
  /**
   * Adds new entries in the store and returns its key
   * @param storeName The name of the store to add the item
   * @param values The entries to be added containing optional key attribute
   */
  bulkAdd(storeName, values) {
    const promises = new Promise((resolve, reject) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
        const transaction = createTransaction(db, optionsGenerator(DBMode.readwrite, storeName, resolve, reject));
        const objectStore = transaction.objectStore(storeName);
        const results = values.map((value) => {
          return new Promise((resolve1, reject1) => {
            const key = value.key;
            delete value.key;
            const request = Boolean(key) ? objectStore.add(value, key) : objectStore.add(value);
            request.onsuccess = (evt) => {
              const result = evt.target.result;
              resolve1(result);
            };
          });
        });
        resolve(Promise.all(results));
      }).catch((reason) => reject(reason));
    });
    return from(promises);
  }
  /**
   * Delete entries in the store and returns current entries in the store
   * @param storeName The name of the store to add the item
   * @param keys The keys to be deleted
   */
  bulkDelete(storeName, keys) {
    const promises = keys.map((key) => {
      return new Promise((resolve, reject) => {
        openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
          const transaction = createTransaction(db, optionsGenerator(DBMode.readwrite, storeName, reject, resolve));
          const objectStore = transaction.objectStore(storeName);
          objectStore.delete(key);
          transaction.oncomplete = () => {
            this.getAll(storeName).pipe(take(1)).subscribe((newValues) => {
              resolve(newValues);
            });
          };
        }).catch((reason) => reject(reason));
      });
    });
    return from(Promise.all(promises));
  }
  /**
   * Returns entry by key.
   * @param storeName The name of the store to query
   * @param key The entry key
   */
  getByKey(storeName, key) {
    return new Observable((obs) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
        const transaction = createTransaction(db, optionsGenerator(DBMode.readonly, storeName, obs.error));
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.get(key);
        request.onsuccess = (event) => {
          obs.next(event.target.result);
          obs.complete();
        };
        request.onerror = (event) => {
          obs.error(event);
        };
      }).catch((error) => obs.error(error));
    });
  }
  /**
   * Retrieve multiple entries in the store
   * @param storeName The name of the store to retrieve the items
   * @param keys The ids entries to be retrieve
   */
  bulkGet(storeName, keys) {
    const observables = keys.map((key) => this.getByKey(storeName, key));
    return new Observable((obs) => {
      combineLatest(observables).subscribe((values) => {
        obs.next(values);
        obs.complete();
      });
    });
  }
  /**
   * Returns entry by id.
   * @param storeName The name of the store to query
   * @param id The entry id
   */
  getByID(storeName, id) {
    return new Observable((obs) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
        validateBeforeTransaction(db, storeName, (e) => obs.error(e));
        const transaction = createTransaction(db, optionsGenerator(DBMode.readonly, storeName, obs.error, obs.next));
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.get(id);
        request.onsuccess = (event) => {
          obs.next(event.target.result);
        };
      }).catch((error) => obs.error(error));
    });
  }
  /**
   * Returns entry by index.
   * @param storeName The name of the store to query
   * @param indexName The index name to filter
   * @param key The entry key.
   */
  getByIndex(storeName, indexName, key) {
    return new Observable((obs) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
        validateBeforeTransaction(db, storeName, (e) => obs.error(e));
        const transaction = createTransaction(db, optionsGenerator(DBMode.readonly, storeName, obs.error));
        const objectStore = transaction.objectStore(storeName);
        const index = objectStore.index(indexName);
        const request = index.get(key);
        request.onsuccess = (event) => {
          obs.next(event.target.result);
          obs.complete();
        };
      }).catch((reason) => obs.error(reason));
    });
  }
  /**
   * Return all elements from one store
   * @param storeName The name of the store to select the items
   */
  getAll(storeName) {
    return new Observable((obs) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
        validateBeforeTransaction(db, storeName, (e) => obs.error(e));
        const transaction = createTransaction(db, optionsGenerator(DBMode.readonly, storeName, obs.error, obs.next));
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.getAll();
        request.onerror = (evt) => {
          obs.error(evt);
        };
        request.onsuccess = ({
          target: {
            result: ResultAll
          }
        }) => {
          obs.next(ResultAll);
          obs.complete();
        };
      }).catch((error) => obs.error(error));
    });
  }
  /**
   * Adds or updates a record in store with the given value and key. Return all items present in the store
   * @param storeName The name of the store to update
   * @param value The new value for the entry
   */
  update(storeName, value) {
    return new Observable((obs) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
        validateBeforeTransaction(db, storeName, (e) => obs.error(e));
        const transaction = createTransaction(db, optionsGenerator(DBMode.readwrite, storeName, (e) => obs.error(e)));
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.put(value);
        request.onsuccess = (evt) => __async(this, null, function* () {
          const result = evt.target.result;
          const getRequest = objectStore.get(result);
          getRequest.onsuccess = (event) => {
            obs.next(event.target.result);
            obs.complete();
          };
        });
      }).catch((reason) => obs.error(reason));
    });
  }
  /**
   * Adds or updates a record in store with the given value and key. Return all items present in the store
   * @param storeName The name of the store to update
   * @param items The values to update in the DB
   *
   * @Return The return value is an Observable with the primary key of the object that was last in given array
   *
   * @error If the call to bulkPut fails the transaction will be aborted and previously inserted entities will be deleted
   */
  bulkPut(storeName, items) {
    let transaction;
    return new Observable((obs) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
        validateBeforeTransaction(db, storeName, (e) => obs.error(e));
        transaction = createTransaction(db, optionsGenerator(DBMode.readwrite, storeName, (e) => obs.error(e)));
        const objectStore = transaction.objectStore(storeName);
        items.forEach((item, index) => {
          const request = objectStore.put(item);
          if (index === items.length - 1) {
            request.onsuccess = (evt) => {
              transaction.commit();
              obs.next(evt.target.result);
              obs.complete();
            };
          }
          request.onerror = (evt) => {
            transaction.abort();
            obs.error(evt);
          };
        });
      }).catch((reason) => {
        transaction?.abort();
        obs.error(reason);
      });
    });
  }
  /**
   * Returns all items from the store after delete.
   * @param storeName The name of the store to have the entry deleted
   * @param key The key of the entry to be deleted
   */
  delete(storeName, key) {
    return new Observable((obs) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
        validateBeforeTransaction(db, storeName, (e) => obs.error(e));
        const transaction = createTransaction(db, optionsGenerator(DBMode.readwrite, storeName, (e) => obs.error(e)));
        const objectStore = transaction.objectStore(storeName);
        objectStore.delete(key);
        transaction.oncomplete = () => {
          this.getAll(storeName).pipe(take(1)).subscribe((newValues) => {
            obs.next(newValues);
            obs.complete();
          });
        };
      }).catch((reason) => obs.error(reason));
    });
  }
  /**
   * Returns true from the store after a successful delete.
   * @param storeName The name of the store to have the entry deleted
   * @param key The key of the entry to be deleted
   */
  deleteByKey(storeName, key) {
    return new Observable((obs) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
        validateBeforeTransaction(db, storeName, (e) => obs.error(e));
        const transaction = createTransaction(db, optionsGenerator(DBMode.readwrite, storeName, (e) => obs.error(e)));
        const objectStore = transaction.objectStore(storeName);
        transaction.oncomplete = () => {
          obs.next(true);
          obs.complete();
        };
        objectStore.delete(key);
      }).catch((reason) => obs.error(reason));
    });
  }
  /**
   * Returns true if successfully delete all entries from the store.
   * @param storeName The name of the store to have the entries deleted
   */
  clear(storeName) {
    return new Observable((obs) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
        validateBeforeTransaction(db, storeName, (e) => obs.error(e));
        const transaction = createTransaction(db, optionsGenerator(DBMode.readwrite, storeName, (e) => obs.error(e)));
        const objectStore = transaction.objectStore(storeName);
        objectStore.clear();
        transaction.oncomplete = () => {
          obs.next(true);
          obs.complete();
        };
      }).catch((reason) => obs.error(reason));
    });
  }
  /**
   * Returns true if successfully delete the DB.
   */
  deleteDatabase() {
    return new Observable((obs) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => __async(this, null, function* () {
        yield db.close();
        const deleteDBRequest = this.indexedDB.deleteDatabase(this.dbConfig.name);
        deleteDBRequest.onsuccess = () => {
          obs.next(true);
          obs.complete();
        };
        deleteDBRequest.onerror = (error) => obs.error(error);
        deleteDBRequest.onblocked = () => {
          console.warn("Delete blocked: Ensure all tabs, instances, or connections are closed. Database name:", this.dbConfig.name);
          obs.error(new Error("Unable to delete database because it's blocked"));
        };
      })).catch((error) => obs.error(error));
    });
  }
  /**
   * Returns the open cursor event
   * @param storeName The name of the store to have the entries deleted
   * @param keyRange The key range which the cursor should be open on
   * @param direction A string telling the cursor which direction to travel. The default is next
   */
  openCursor(storeName, keyRange, direction = "next") {
    return new Observable((obs) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
        validateBeforeTransaction(db, storeName, (e) => obs.error(e));
        const transaction = createTransaction(db, optionsGenerator(DBMode.readwrite, storeName, obs.error));
        const objectStore = transaction.objectStore(storeName);
        const request = keyRange === void 0 ? objectStore.openCursor() : objectStore.openCursor(keyRange, direction);
        request.onsuccess = (event) => {
          obs.next(event);
          obs.complete();
        };
      }).catch((reason) => obs.error(reason));
    });
  }
  /**
   * Open a cursor by index filter.
   * @param storeName The name of the store to query.
   * @param indexName The index name to filter.
   * @param keyRange The range value and criteria to apply on the index.
   */
  openCursorByIndex(storeName, indexName, keyRange, direction = "next", mode = DBMode.readonly) {
    const obs = new Subject();
    openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
      validateBeforeTransaction(db, storeName, (reason) => {
        obs.error(reason);
      });
      const transaction = createTransaction(db, optionsGenerator(mode, storeName, (reason) => {
        obs.error(reason);
      }, () => {
        obs.next();
      }));
      const objectStore = transaction.objectStore(storeName);
      const index = objectStore.index(indexName);
      const request = index.openCursor(keyRange, direction);
      request.onsuccess = (event) => {
        obs.next(event);
      };
    }).catch((reason) => obs.error(reason));
    return obs;
  }
  /**
   * Returns all items by an index.
   * @param storeName The name of the store to query
   * @param indexName The index name to filter
   * @param keyRange  The range value and criteria to apply on the index.
   */
  getAllByIndex(storeName, indexName, keyRange) {
    const data = [];
    return new Observable((obs) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
        validateBeforeTransaction(db, storeName, (e) => obs.error(e));
        const transaction = createTransaction(db, optionsGenerator(DBMode.readonly, storeName, obs.error));
        const objectStore = transaction.objectStore(storeName);
        const index = objectStore.index(indexName);
        const request = index.openCursor(keyRange);
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            data.push(cursor.value);
            cursor.continue();
          } else {
            obs.next(data);
            obs.complete();
          }
        };
      }).catch((reason) => obs.error(reason));
    });
  }
  /**
   * Returns all primary keys by an index.
   * @param storeName The name of the store to query
   * @param indexName The index name to filter
   * @param keyRange  The range value and criteria to apply on the index.
   */
  getAllKeysByIndex(storeName, indexName, keyRange) {
    const data = [];
    return new Observable((obs) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
        validateBeforeTransaction(db, storeName, (e) => obs.error(e));
        const transaction = createTransaction(db, optionsGenerator(DBMode.readonly, storeName, obs.error));
        const objectStore = transaction.objectStore(storeName);
        const index = objectStore.index(indexName);
        const request = index.openKeyCursor(keyRange);
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            data.push({
              primaryKey: cursor.primaryKey,
              key: cursor.key
            });
            cursor.continue();
          } else {
            obs.next(data);
            obs.complete();
          }
        };
      }).catch((reason) => obs.error(reason));
    });
  }
  /**
   * Returns the number of rows in a store.
   * @param storeName The name of the store to query
   * @param keyRange  The range value and criteria to apply.
   */
  count(storeName, keyRange) {
    return new Observable((obs) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
        validateBeforeTransaction(db, storeName, (e) => obs.error(e));
        const transaction = createTransaction(db, optionsGenerator(DBMode.readonly, storeName, obs.error));
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.count(keyRange);
        request.onerror = (e) => obs.error(e);
        request.onsuccess = (e) => {
          obs.next(e.target.result);
          obs.complete();
        };
      }).catch((reason) => obs.error(reason));
    });
  }
  /**
   * Returns the number of rows in a store.
   * @param storeName The name of the store to query
   * @param keyRange  The range value and criteria to apply.
   */
  countByIndex(storeName, indexName, keyRange) {
    return new Observable((obs) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
        validateBeforeTransaction(db, storeName, (e) => obs.error(e));
        const transaction = createTransaction(db, optionsGenerator(DBMode.readonly, storeName, obs.error));
        const objectStore = transaction.objectStore(storeName);
        const index = objectStore.index(indexName);
        const request = index.count(keyRange);
        request.onerror = (e) => obs.error(e);
        request.onsuccess = (e) => {
          obs.next(e.target.result);
          obs.complete();
        };
      }).catch((reason) => obs.error(reason));
    });
  }
  /**
   * Delete the store by name.
   * @param storeName The name of the store to query
   */
  deleteObjectStore(storeName) {
    return DeleteObjectStore(this.dbConfig.name, ++this.dbConfig.version, storeName);
  }
  /**
   * Get all object store names.
   */
  getAllObjectStoreNames() {
    return new Observable((obs) => {
      openDatabase(this.indexedDB, this.dbConfig.name, this.dbConfig.version).then((db) => {
        obs.next([...db.objectStoreNames]);
        obs.complete();
      }).catch((reason) => obs.error(reason));
    });
  }
  static {
    this.ɵfac = function NgxIndexedDBService_Factory(t) {
      return new (t || _NgxIndexedDBService)(ɵɵinject(CONFIG_TOKEN), ɵɵinject(INDEXED_DB));
    };
  }
  static {
    this.ɵprov = ɵɵdefineInjectable({
      token: _NgxIndexedDBService,
      factory: _NgxIndexedDBService.ɵfac
    });
  }
};
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "getDatabaseVersion", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "add", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "bulkAdd", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "bulkDelete", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "getByKey", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "bulkGet", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "getByID", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "getByIndex", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "getAll", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "update", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "bulkPut", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "delete", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "deleteByKey", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "clear", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "deleteDatabase", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "openCursor", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "openCursorByIndex", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "getAllByIndex", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "getAllKeysByIndex", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "count", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "countByIndex", null);
__decorate([CloseDbConnection()], NgxIndexedDBService.prototype, "getAllObjectStoreNames", null);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NgxIndexedDBService, [{
    type: Injectable
  }], () => [{
    type: void 0,
    decorators: [{
      type: Inject,
      args: [CONFIG_TOKEN]
    }]
  }, {
    type: IDBFactory,
    decorators: [{
      type: Inject,
      args: [INDEXED_DB]
    }]
  }], {
    getDatabaseVersion: [],
    add: [],
    bulkAdd: [],
    bulkDelete: [],
    getByKey: [],
    bulkGet: [],
    getByID: [],
    getByIndex: [],
    getAll: [],
    update: [],
    bulkPut: [],
    delete: [],
    deleteByKey: [],
    clear: [],
    deleteDatabase: [],
    openCursor: [],
    openCursorByIndex: [],
    getAllByIndex: [],
    getAllKeysByIndex: [],
    count: [],
    countByIndex: [],
    getAllObjectStoreNames: []
  });
})();
var ServerIndexedDB = class {
  cmp() {
    return 0;
  }
  databases() {
    return Promise.resolve([]);
  }
  deleteDatabase() {
    return {
      onupgradeneeded: null,
      onblocked: null,
      onerror: null,
      onsuccess: null,
      error: null
    };
  }
  open() {
    return {
      onupgradeneeded: null,
      onblocked: null,
      onerror: null,
      onsuccess: null,
      error: null
    };
  }
};
function indexedDbFactory() {
  assertInInjectionContext(indexedDbFactory);
  const platformId = inject(PLATFORM_ID);
  const serverIndexedDB = inject(SERVER_INDEXED_DB, {
    optional: true
  }) ?? new ServerIndexedDB();
  return isPlatformBrowser(platformId) ? inject(DOCUMENT).defaultView.indexedDB : serverIndexedDB;
}
var provideIndexedDb = (...dbConfigs) => {
  return makeEnvironmentProviders([..._provideIndexedDb(...dbConfigs)]);
};
var _provideIndexedDb = (...dbConfigs) => {
  const configs = dbConfigs.reduce((acc, curr) => {
    acc[curr.name] = curr;
    return acc;
  }, {});
  return [NgxIndexedDBService, {
    provide: CONFIG_TOKEN,
    useValue: configs
  }, {
    provide: INDEXED_DB,
    useFactory: indexedDbFactory
  }];
};
var NgxIndexedDBModule = class _NgxIndexedDBModule {
  static forRoot(...dbConfigs) {
    return {
      ngModule: _NgxIndexedDBModule,
      providers: [..._provideIndexedDb(...dbConfigs)]
    };
  }
  static {
    this.ɵfac = function NgxIndexedDBModule_Factory(t) {
      return new (t || _NgxIndexedDBModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _NgxIndexedDBModule
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({});
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NgxIndexedDBModule, [{
    type: NgModule
  }], null, null);
})();
export {
  CONFIG_TOKEN,
  DBMode,
  INDEXED_DB,
  NgxIndexedDBModule,
  NgxIndexedDBService,
  SERVER_INDEXED_DB,
  provideIndexedDb
};
//# sourceMappingURL=ngx-indexed-db.js.map
