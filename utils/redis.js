import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  /**
   * Creates a new redis client instance
   */
  constructor() {
    this.client = createClient();
    this.clientConnected = true;
    this.client.on('error', (error) => {
      console.log(`Redis client not connected to the server: ${error}`);
      this.clientConnected = false;
    });
    this.client.on('connect', () => {
      this.clientConnected = true;
    });
  }

  /**
   * checks if the connection is active
   * @returns {boolean}
   */
  isAlive() {
    return this.clientConnected;
  }

  /**
   * Gets the value of a key
   * @param {String} key for the item to be gotten
   * @returns {promise}
   */
  async get(key) {
    return promisify(this.client.GET).bind(this.client)(key);
  }

  /**
   * sets the value for a key
   * @param {String} key for the value to be stored
   * @param {String} value for the key
   * @param {Number} duration time until expiration
   * @returns {promise}
   */
  async set(key, value, duration) {
    await promisify(this.client.SETEX).bind(this.client)(key, duration, value);
  }

  /**
   * deletes the key from the redis instance
   * @param {String} key for the item to be deleted
   * @returns {Promise}
   */
  async del(key) {
    await promisify(this.client.DEL).bind(this.client)(key);
  }
}

export const redisClient = new RedisClient();
export default redisClient;
