import redisClient from './redis';
import databaseClient from './db';

/**
 * Module containing utilities for user operations
 */
const userUtilities = {
  /**
   * Retrieves the user ID and corresponding Redis key from the request.
   * @request {request_object} Express request object
   * @return {object} An object containing userId and the Redis key for the token
   */
  async retrieveUserIdAndKey(request) {
    const resultObject = { userId: null, key: null };

    const token = request.header('X-Token');

    if (!token) return resultObject;

    resultObject.key = `auth_${token}`;

    resultObject.userId = await redisClient.get(resultObject.key);

    return resultObject;
  },

  /**
   * Fetches a user document from the database.
   * @query {object} query expression to find the user
   * @return {object} The user document object
   */
  async fetchUser(query) {
    const userDocument = await databaseClient.usersCollection.findOne(query);
    return userDocument;
  },
};

export default userUtilities;
