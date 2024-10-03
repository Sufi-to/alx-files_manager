// eslint-disable-next-line no-unused-vars
import { Express } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const apiRoutes = (api) => {
  // endpoints for user status and stats
  api.get('/status', AppController.getStatus);
  api.get('/stats', AppController.getStats);

  // endpoints for users viewing, adding users
  api.post('/users', UsersController.postNew);
  api.get('/users/me', UsersController.getMe);

  // Authentication endpoints
  api.get('/connect', AuthController.getConnect);
  api.get('/disconnect', AuthController.getDisconnect);

  // File posting enpoint
  api.post('/files', FilesController.postUpload);
};

export default apiRoutes;
