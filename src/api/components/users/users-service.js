const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const { getFilteredUsers } = require('./users-repository');
const { getTransactionsByUserId } = require('./users-repository');


/**
 * Get list of users with pagination
 * @param {object} filters - Pagination filters
 * @returns {object} - Formatted list of users with pagination metadata
 */
async function getUsers(filters = {}) {
  const defaultFilters = {
    skip: 0,
    limit: 100,
    query: {},
  };

  // Merge default filters with user-provided filters
  filters = { ...defaultFilters, ...filters };

  try {
    const users = await getFilteredUsers(filters);

    const { skip, limit } = filters;
    const total_count = await usersRepository.countFilteredUsers({});
    const total_pages = Math.ceil(total_count / limit);

    const has_previous_page = skip > 0;
    const has_next_page = skip + limit < total_count;

    const response = {
      page_number: Math.floor(skip / limit) + 1,
      page_size: limit,
      count: users.length,
      total_pages,
      has_previous_page,
      has_next_page,
      data: users,
    };

    return response;
  } catch (error) {
    console.error("Error getting users with pagination:", error);
    throw error;
  }
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}
/**
 * Update user's transaction data (e.g., balance) based on transaction type and amount
 * @param {string} userId - User ID
 * @param {string} type - Transaction type (e.g., "credit" or "debit")
 * @param {number} amount - Transaction amount
 * @returns {Promise<boolean>} - Indicates whether the user's transaction data was updated successfully
 */
async function updateUserTransaction(userId, type, amount) {
  try {
    // Retrieve user's current transaction data (e.g., balance)
    const user = await usersRepository.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user's transaction data based on transaction type and amount
    if (type === 'credit') {
      user.balance += amount; // Credit the user's balance
    } else if (type === 'debit') {
      if (user.balance < amount) {
        throw new Error('Insufficient balance');
      }
      user.balance -= amount; // Debit the user's balance
    } else {
      throw new Error('Invalid transaction type');
    }

    // Save the updated user data
    await user.save();

    return true; // User's transaction data updated successfully
  } catch (error) {
    console.error("Error updating user's transaction data:", error);
    return false; // Failed to update user's transaction data
  }
}
async function saveCustomerData(userId, amount, type) {
  try {
    // Get the user by ID from the repository
    const user = await usersRepository.getUserById(userId);
    
    // If user is not found, return false
    if (!user) {
      return false;
    }

    // Add customer data to the user object
    user.customerData = user.customerData || [];
    user.customerData.push({ amount, type });

    // Update the user in the repository
    await usersRepository.updateUser(user);

    // Return true to indicate success
    return true;
  } catch (error) {
    // If an error occurs, log it and return false
    console.error('Failed to save customer data:', error);
    return false;
  }
}
async function createBankUser(amount, type, userId) {
  try {
    // Lakukan sesuatu dengan amount, type, dan userId, misalnya validasi
    
    // Panggil fungsi createUser dari usersRepository untuk membuat pengguna baru
    const success = await usersRepository.createBankUser(amount, type, userId);
    
    // Jika pengguna berhasil dibuat, kembalikan true
    if (success) {
      return true;
    } else {
      // Jika gagal, lemparkan kesalahan
      throw new Error('Gagal membuat pengguna baru');
    }
  } catch (error) {
    // Tangani kesalahan jika ada
    console.error('Gagal membuat pengguna baru:', error.message);
    return false;
  }
}


module.exports = {
  
  createUser,
  getUser,
  updateUser,
  deleteUser,
  changePassword,
  getUsers,
  emailIsRegistered,
  updateUserTransaction,
  saveCustomerData,
  createBankUser,
};
