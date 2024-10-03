import { MongoClient } from 'mongodb';

class DBClient {
  /**
   * Creates a new mogodb client
   */
  constructor() {
    this.host = 'localhost';
    this.port = process.env.DB_HOST || 27017;
    this.dB = process.env.DB_DATABASE || 'files_manager';
    this.url = `mongodb://${this.host}:${this.port}/${this.dB}`;
    this.dbClient = new MongoClient(this.url, { useUnifiedTopology: true });
    this.dbClient.connect();
  }

  /**
   * checks if the connection is active
   * @returns {boolean}
   */
  isAlive() {
    return this.dbClient.isConnected();
  }

  /**
   * Number of documents in the collection users
   * @returns {Promise<Number>}
   */
  async nbUsers() {
    return this.dbClient.db().collection('users').countDocuments();
  }

  /**
   * Number of documents in the collection files
   * @returns {Promise<Number>}
   */
  async nbFiles() {
    return this.dbClient.db().collection('files').countDocuments();
  }

  /**
   * Retrieves a reference to the `users` collection.
   * @returns {Promise<Collection>}
   */
  async usersCollection() {
    return this.dbClient.db().collection('users');
  }
}

export const dbClient = new DBClient();
export default dbClient;
