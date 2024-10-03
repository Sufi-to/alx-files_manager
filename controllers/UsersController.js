/* eslint-disable import/no-named-as-default */
import sha1 from 'sha1';
import dbClient from '../utils/db';

export default class UsersController {
  static async postNew(request, response) {
    const email = request.body ? request.body.email : null;
    const password = request.body ? request.body.password : null;

    if (!email) {
      response.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      response.status(400).json({ error: 'Missing password' });
      return;
    }
    const userIndb = await (await dbClient.usersCollection()).findOne({ email });

    if (userIndb) {
      response.status(400).json({ error: 'Already exist' });
      return;
    }
    const insertUser = await (await dbClient.usersCollection())
      .insertOne({ email, password: sha1(password) });
    const userId = insertUser.insertedId.toString();

    // userQueue.add({ userId });
    response.status(201).json({ email, id: userId });
  }

  static async getMe(request, response) {
    const { user } = request;

    response.status(200).json({ email: user.email, id: user._id.toString() });
  }
}
