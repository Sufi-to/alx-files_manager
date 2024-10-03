import { ObjectId } from 'mongodb';

/**
 * Utility module for basic validation and checks
 */
const basicUtils = {
  /**
   * Validates if the provided ID is a valid MongoDB ObjectId.
   * @param {string|number} inputId The ID to be validated.
   * @return {boolean} Returns true if the ID is valid, otherwise false.
   */
  isValidId(inputId) {
    try {
      ObjectId(inputId);
    } catch (error) {
      return false;
    }
    return true;
  },
};

export default basicUtils;
