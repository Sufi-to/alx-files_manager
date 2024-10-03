import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { promises as fsPromises } from 'fs';
import databaseClient from './db';
import userUtilities from './user';
import basicUtilities from './basic';

/**
 * Module containing utilities for file operations
 */
const fileUtilities = {
  /**
   * Validates the body of the request for file creation.
   * @request {request_object} express request object
   * @return {object} An object containing an error message and validated file parameters
   */
  async validateRequestBody(request) {
    const {
      name, type, isPublic = false, data,
    } = request.body;

    let { parentId = 0 } = request.body;

    const allowedTypes = ['file', 'image', 'folder'];
    let errorMessage = null;

    if (parentId === '0') parentId = 0;

    if (!name) {
      errorMessage = 'Missing name';
    } else if (!type || !allowedTypes.includes(type)) {
      errorMessage = 'Missing type';
    } else if (!data && type !== 'folder') {
      errorMessage = 'Missing data';
    } else if (parentId && parentId !== '0') {
      let parentFile;

      if (basicUtilities.isValidId(parentId)) {
        parentFile = await this.fetchFile({
          _id: ObjectId(parentId),
        });
      } else {
        parentFile = null;
      }

      if (!parentFile) {
        errorMessage = 'Parent not found';
      } else if (parentFile.type !== 'folder') {
        errorMessage = 'Parent is not a folder';
      }
    }

    const resultObject = {
      error: errorMessage,
      fileParams: {
        name,
        type,
        parentId,
        isPublic,
        data,
      },
    };

    return resultObject;
  },

  /**
   * Retrieves a file document from the database.
   * @query {object} query used to find the file
   * @return {object} The file document
   */
  async fetchFile(query) {
    const fileDocument = await databaseClient.filesCollection.findOne(query);
    return fileDocument;
  },

  /**
   * Retrieves a list of file documents from the database belonging to a specific parent ID.
   * @query {object} query used to find files
   * @return {Array} An array of file documents
   */
  async fetchFilesByParentId(query) {
    const fileList = await databaseClient.filesCollection.aggregate(query);
    return fileList;
  },

  /**
   * Saves file information to the database and disk.
   * @userId {string} ID of the user saving the file
   * @fileParams {object} Object containing attributes of the file to save
   * @FOLDER_PATH {string} Path to save the file on disk
   * @return {object} An object containing an error (if present) and the saved file
   */
  async saveFile(userId, fileParams, FOLDER_PATH) {
    const {
      name, type, isPublic, data,
    } = fileParams;
    let { parentId } = fileParams;

    if (parentId !== 0) parentId = ObjectId(parentId);

    const query = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId,
    };

    if (fileParams.type !== 'folder') {
      const uniqueFileName = uuidv4();

      // Decode the base64 file data
      const decodedFileData = Buffer.from(data, 'base64');

      const filePath = `${FOLDER_PATH}/${uniqueFileName}`;

      query.localPath = filePath;

      try {
        await fsPromises.mkdir(FOLDER_PATH, { recursive: true });
        await fsPromises.writeFile(filePath, decodedFileData);
      } catch (error) {
        return { error: error.message, code: 400 };
      }
    }

    const result = await databaseClient.filesCollection.insertOne(query);

    const processedFile = this.transformFile(query);

    const newFile = { id: result.insertedId, ...processedFile };

    return { error: null, newFile };
  },

  /**
   * Updates a file document in the database.
   * @query {object} query to find the document to update
   * @set {object} object containing the update information for MongoDB
   * @return {object} The updated file document
   */
  async updateFile(query, set) {
    const updatedFile = await databaseClient.filesCollection.findOneAndUpdate(
      query,
      set,
      { returnOriginal: false },
    );
    return updatedFile;
  },

  /**
   * Toggles a file's visibility between public and private.
   * @request {request_object} express request object
   * @setPublish {boolean} Indicates whether to publish or unpublish the file
   * @return {object} An object containing an error (if present), status code, and the updated file
   */
  async publishUnpublish(request, setPublish) {
    const { id: fileId } = request.params;

    if (!basicUtilities.isValidId(fileId)) { return { error: 'Unauthorized', code: 401 }; }

    const { userId } = await userUtilities.getUserIdAndKey(request);

    if (!basicUtilities.isValidId(userId)) { return { error: 'Unauthorized', code: 401 }; }

    const user = await userUtilities.getUser({
      _id: ObjectId(userId),
    });

    if (!user) return { error: 'Unauthorized', code: 401 };

    const file = await this.fetchFile({
      _id: ObjectId(fileId),
      userId: ObjectId(userId),
    });

    if (!file) return { error: 'Not found', code: 404 };

    const result = await this.updateFile(
      {
        _id: ObjectId(fileId),
        userId: ObjectId(userId),
      },
      { $set: { isPublic: setPublish } },
    );

    const {
      _id: id,
      userId: resultUserId,
      name,
      type,
      isPublic,
      parentId,
    } = result.value;

    const updatedFile = {
      id,
      userId: resultUserId,
      name,
      type,
      isPublic,
      parentId,
    };

    return { error: null, code: 200, updatedFile };
  },

  /**
   * Transforms the file document by renaming _id to id and removing localPath.
   * @doc {object} document to be processed
   * @return {object} The processed document
   */
  transformFile(doc) {
    const transformedFile = { id: doc._id, ...doc };

    delete transformedFile.localPath;
    delete transformedFile._id;

    return transformedFile;
  },

  /**
   * Checks if a file is public and belongs to a specific user.
   * @file {object} file to evaluate
   * @userId {string} ID of the user to check ownership
   * @return {boolean} true if the user is the owner or if the file is public; otherwise, false
   */
  isOwnerAndPublic(file, userId) {
    if (
      (!file.isPublic && !userId)
      || (userId && file.userId.toString() !== userId && !file.isPublic)
    ) { return false; }

    return true;
  },

  /**
   * Retrieves the data of a file from the database.
   * @file {object} file to obtain data for
   * @size {string} size in case the file is an image
   * @return {object} The data of the file or an error and status code
   */
  async getFileData(file, size) {
    let { localPath } = file;
    let data;

    if (size) localPath = `${localPath}_${size}`;

    try {
      data = await fsPromises.readFile(localPath);
    } catch (error) {
      // console.log(error.message);
      return { error: 'Not found', code: 404 };
    }

    return { data };
  },
};

export default fileUtilities;
