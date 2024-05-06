const { User } = require('../../../models');
/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}


/**
 * Get filtered users with pagination and other options
 * @param {object} options - Options for filtering, sorting, and pagination
 * @returns {Promise<Array>} - Array of user objects
 */
async function getFilteredUsers({ skip, limit, query }) {
  return User.find(query).skip(skip).limit(limit);
}

/**
 * Count filtered users in the database
 * @param {object} query - Query object for filtering users
 * @returns {Promise<number>} - Total count of filtered users
 */
async function countFilteredUsers(query) {
  return User.countDocuments(query);
}

/**
 * Get formatted list of users with pagination
 * @param {object} filters - Filters for sorting, searching, and pagination
 * @returns {object} - Formatted list of users with pagination metadata
 */
async function getPaginatedUsers({ page_number, page_size }) {
  try {
    // Menghitung jumlah dokumen yang akan dilewati berdasarkan nomor halaman dan ukuran halaman
    const skip = (page_number - 1) * page_size;

    // Mengambil data pengguna dari database dengan memperhitungkan paginasi
    const users = await User.find({})
      .skip(skip)
      .limit(page_size)
      .exec();

    // Menghitung total pengguna dalam database
    const total_count = await User.countDocuments();

    // Menghitung total halaman berdasarkan total pengguna dan ukuran halaman
    const total_pages = Math.ceil(total_count / page_size);

    // Mengecek apakah terdapat halaman sebelumnya
    const has_previous_page = page_number > 1;

    // Mengecek apakah terdapat halaman berikutnya
    const has_next_page = page_number < total_pages;

    // Mengembalikan hasil dengan metadata pagination
    return {
      page_number,
      page_size,
      total_count,
      total_pages,
      has_previous_page,
      has_next_page,
      data: users,
    };
  } catch (error) {
    // Menangani kesalahan jika terjadi
    console.error("Error:", error);
    throw error;
  }
}

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}
/**
 * Get transactions by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of transactions
 */
async function getTransactionsByUserId(userId) {
  try {
    // Implement logic to fetch transactions for the given user ID
    // For example, you might fetch transactions from a database
    const transactions = await transactions.find({ userId });
    return transactions.filter(transaction => transaction.userId === userId);
  } catch (error) {
    console.error("Error fetching transactions by user ID:", error);
    throw error;
  }
}
/**
 * Get a list of users with their transactions
 * @returns {Promise<Array>} - Array of user objects with transactions
 */
async function getUsersWithTransactions() {
  try {
    // Get all users
    const users = await User.find({});

    // Fetch transactions for each user
    const usersWithTransactions = await Promise.all(users.map(async (user) => {
      const transactions = await getTransactionsByUserId(user.id);
      return { ...user.toObject(), transactions };
    }));

    return usersWithTransactions;
  } catch (error) {
    console.error("Error getting users with transactions:", error);
    throw error;
  }
}
async function deleteTransactionsByUserId(userId) {
  try {
    // Implementasikan logika untuk menghapus transaksi berdasarkan ID pengguna
    // Contoh: await Transaction.deleteMany({ userId });
    // Anda juga bisa menyesuaikan sesuai dengan struktur database Anda
    addTransaction = addTransaction.filter(transaction => transaction.userId !== userId);
    return true; // Berhasil menghapus transaksi
  } catch (error) {
    console.error('Error deleting transactions by user ID:', error);
    return false; // Gagal menghapus transaksi
  }
}
module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
  getFilteredUsers,
  countFilteredUsers,
  getPaginatedUsers,
  getTransactionsByUserId,
  getUsersWithTransactions,
  deleteTransactionsByUserId,
};