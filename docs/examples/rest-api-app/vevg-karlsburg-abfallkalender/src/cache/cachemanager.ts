const cacheManager = require("cache-manager");
const mongoose = require("mongoose");
const mongooseStore = require("cache-manager-mongoose");

/**
 * Memory cache.
 * Use always to avoid any duplicate http or api requests.
 */
export const localCache = cacheManager.caching({
  store: "memory",
  max: 10000000,
  ttl: 604800, // 1 week
  isCacheableValue: function (value: any) {
    return value !== undefined && value !== null;
  },
});

/**
 * MongoDB cache at cloud.mongodb.com.
 * Use for more or less static data.
 */
const myConnection = mongoose.createConnection(process.env.MONGODB_URI);
export const remoteDatabaseCache = cacheManager.caching({
  store: mongooseStore,
  mongoose: mongoose,
  connection: myConnection,
  modelName: "CacheModel",
  modelOptions: {
    collection: "MongooseCache", // mongodb collection name
    versionKey: false, // do not create __v field
  },
  ttl: 604800, // 1 week
  isCacheableValue: function (value: any) {
    return value !== undefined && value !== null;
  },
});
