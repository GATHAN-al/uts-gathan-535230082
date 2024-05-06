const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const usersValidator = require('./users-validator');

//const transactionService = require('./transaction-service');
/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    const users = await usersService.getUsers();
    return response.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change user password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePassword(request, response, next) {
  try {
    // Check password confirmation
    if (request.body.password_new !== request.body.password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Check old password
    if (
      !(await usersService.checkPassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await usersService.changePassword(
      request.params.id,
      request.body.password_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change password'
      );
    }

    return response.status(200).json({ id: request.params.id });
  } catch (error) {
    return next(error);
  }
}



/**
 * Handle update user transaction request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {object} next - Express route middleware
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUserTransaction(req, res, next) {
  try {
    const userId = req.params.id;
    const { type, amount } = req.body;

    // Validate input
    if (!type || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update user's transaction data based on transaction type and amount
    const success = await usersService.updateUserTransaction(userId, type, amount);

    if (success) {
      return res.status(200).json({ message: 'User transaction data updated successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to update user transaction data' });
    }
  } catch (error) {
    next(error);
  }
}
// async function saveCustomerData(request, response, next) {
//   try {
//     const userId = request.body.userId;
//     const amount = request.body.amount;
//     const type = request.body.type;

//     // Panggil fungsi untuk menyimpan data nasabah
//     const success = await usersService.saveCustomerData(userId, amount, type);
    
//     if (!success) {
//       throw errorResponder(
//         errorTypes.UNPROCESSABLE_ENTITY,
//         'Gagal menyimpan data nasabah'
//       );
//     }

//     return response.status(200).json({ userId, amount, type });
//   } catch (error) {
//     return next(error);
//   }
// }
// async function createBankUser(request, response, next) {
//   try {
//     const amount = request.body.amount;
//     const type = request.body.type;
//     const userId = request.body.userId;

//     // Panggil userservice untuk membuat pengguna baru
//     const result = await usersService.createBankUser(amount, type, userId);

//     // Berikan respons sesuai dengan hasil pembuatan pengguna bank
//     if (result.success) {
//       return response.status(200).json(result);
//     } else {
//       throw errorResponder(
//         errorTypes.UNPROCESSABLE_ENTITY,
//         'Gagal membuat pengguna bank baru'
//       );
//     }
//   } catch (error) {
//     return next(error);
//   }
// }
var transactions = {};

// Fungsi untuk menambahkan transaksi
async function addTransaction(userId, type, amount) {
  try {
    // Periksa apakah pengguna memiliki entri transaksi di objek
    if (!transactions[userId]) {
      transactions[userId] = []; // Jika tidak, inisialisasikan sebagai array kosong
    }

    // Tambahkan transaksi baru ke dalam array transaksi pengguna
    transactions[userId].push({ type, amount });

    return true; // Berhasil menambahkan transaksi
  } catch (error) {
    console.error('Error adding transaction:', error);
    return false; // Gagal menambahkan transaksi
  }
}

/**
 * Add transaction for a user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Next middleware function
 */
async function tambahTransaksi(req, res, next) {
  try {
    // Dapatkan data transaksi dari body permintaan
    const { userId, type, amount } = req.body;

    // Misalkan ini adalah fungsi tambahTransaksi yang sebenarnya
    // Anda harus menggantinya dengan implementasi yang sesuai
    const success = await addTransaction(userId, type, amount);

    // Periksa apakah transaksi berhasil ditambahkan
    if (!success) {
      return res.status(422).json({ error: 'UNPROCESSABLE_ENTITY_ERROR', message: 'Failed to add transaction' });
    }

    // Jika berhasil, kirim respons berhasil
    res.status(200).json({ success: true, message: 'Transaction added successfully' });
  } catch (error) {
    // Tangani kesalahan
    next(error);
  }
}




module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  updateUserTransaction,
 // saveCustomerData,
 tambahTransaksi,
 addTransaction,
};
