/* eslint-disable import/no-named-as-default */
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';

export default class AuthController {
  static async getConnect(request, response) {
    const { userInfo } = request;
    const tokenId = uuidv4();
    await redisClient.set(`auth_${tokenId}`, userInfo._id.toString(), 24 * 60 * 60);
    response.status(200).json({ tokenId });
  }

  static async getDisconnect(request, response) {
    const tokenId = request.headers['x-token'];

    await redisClient.del(`auth_${tokenId}`);
    response.status(204).send();
  }
}
