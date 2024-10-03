import express from 'express';
import applicationController from '../controllers/AppController';
import usersController from '../controllers/UsersController';
import authController from '../controllers/AuthController';
import filesController from '../controllers/FilesController';

function setupControllerRoutes(app) {
  const router = express.Router();
  app.use('/', router);

  // Application Controller

  // Returns the status of Redis and the database connection
  router.get('/status', (request, response) => {
    applicationController.getStatus(request, response);
  });

  // Returns the count of users and files in the database
  router.get('/stats', (request, response) => {
    applicationController.getStats(request, response);
  });

  // User Controller

  // Creates a new user in the database
  router.post('/users', (request, response) => {
    usersController.postNew(request, response);
  });

  // Retrieves the current user based on the token provided
  router.get('/users/me', (request, response) => {
    usersController.getMe(request, response);
  });

  // Authentication Controller

  // Signs in the user by generating a new authentication token
  router.get('/connect', (request, response) => {
    authController.getConnect(request, response);
  });

  // Signs out the user based on the token provided
  router.get('/disconnect', (request, response) => {
    authController.getDisconnect(request, response);
  });

  // Files Controller

  // Creates a new file in the database and saves it to disk
  router.post('/files', (request, response) => {
    filesController.postUpload(request, response);
  });

  // Retrieves the file document based on the provided ID
  router.get('/files/:id', (request, response) => {
    filesController.getShow(request, response);
  });

  // Retrieves all user file documents for a specific parentId with pagination
  router.get('/files', (request, response) => {
    filesController.getIndex(request, response);
  });

  // Sets isPublic to true on the file document based on the provided ID
  router.put('/files/:id/publish', (request, response) => {
    filesController.putPublish(request, response);
  });

  // Sets isPublic to false on the file document based on the provided ID
  router.put('/files/:id/unpublish', (request, response) => {
    filesController.putUnpublish(request, response);
  });

  // Returns the content of the file document based on the provided ID
  router.get('/files/:id/data', (request, response) => {
    filesController.getFile(request, response);
  });
}

export default setupControllerRoutes;
