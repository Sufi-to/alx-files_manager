import Queue from 'bull';
import { ObjectId } from 'mongodb';
import { promises as fsPromises } from 'fs';
import fileUtils from './utils/file';
import userUtils from './utils/user';
import basicUtils from './utils/basic';

const imageThumbnail = require('image-thumbnail');

// Create queues for processing file and user tasks
const fileProcessingQueue = new Queue('fileProcessingQueue');
const userProcessingQueue = new Queue('userProcessingQueue');

// Process file jobs in the file queue
fileProcessingQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  // Note: To delete Bull keys in Redis:
  // redis-cli keys "bull*" | xargs redis-cli del

  // Validate the presence of userId
  if (!userId) {
    console.log('User ID is missing');
    throw new Error('User ID is missing');
  }

  // Validate the presence of fileId
  if (!fileId) {
    console.log('File ID is missing');
    throw new Error('File ID is missing');
  }

  // Validate the format of fileId and userId
  if (!basicUtils.isValidId(fileId) || !basicUtils.isValidId(userId)) {
    throw new Error('Invalid file or user ID');
  }

  // Fetch the file document from the database
  const fileDocument = await fileUtils.getFile({
    _id: ObjectId(fileId),
    userId: ObjectId(userId),
  });

  // Check if the file exists
  if (!fileDocument) {
    throw new Error('File not found');
  }

  const { localPath } = fileDocument;
  const thumbnailOptions = {};
  const thumbnailWidths = [500, 250, 100];

  // Generate and save thumbnails at specified widths
  thumbnailWidths.forEach(async (width) => {
    thumbnailOptions.width = width;
    try {
      const thumbnailImage = await imageThumbnail(localPath, thumbnailOptions);
      await fsPromises.writeFile(`${localPath}_${width}`, thumbnailImage);
      // Optional: Log the generated thumbnail
      // console.log(thumbnailImage);
    } catch (error) {
      console.error('Error creating thumbnail:', error.message);
    }
  });
});

// Process user jobs in the user queue
userProcessingQueue.process(async (job) => {
  const { userId } = job.data;

  // Note: To delete Bull keys in Redis:
  // redis-cli keys "bull*" | xargs redis-cli del

  // Validate the presence of userId
  if (!userId) {
    console.log('User ID is missing');
    throw new Error('User ID is missing');
  }

  // Validate the format of userId
  if (!basicUtils.isValidId(userId)) {
    throw new Error('Invalid user ID');
  }

  // Fetch the user document from the database
  const userDocument = await userUtils.getUser({
    _id: ObjectId(userId),
  });

  // Check if the user exists
  if (!userDocument) {
    throw new Error('User not found');
  }

  // Log a welcome message for the user
  console.log(`Welcome ${userDocument.email}!`);
});
