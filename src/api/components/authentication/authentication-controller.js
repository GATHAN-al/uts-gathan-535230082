const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

// Objek untuk menyimpan jumlah upaya login gagal dan waktu terakhirnya untuk setiap email
const failedLoginAttempts = {};

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    // Cek apakah email ini telah mencapai batas upaya gagal login
    if (failedLoginAttempts[email] >= 5) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Too many failed login attempts. Please try again later.'
      );
    }

    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (!loginSuccess) {
      // Jika login gagal, tambahkan satu pada jumlah upaya login gagal untuk email ini
      failedLoginAttempts[email] = (failedLoginAttempts[email] || 0) + 1;
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Wrong email or password'
      );
    }

    // Jika login berhasil, reset jumlah upaya login gagal untuk email ini
    delete failedLoginAttempts[email];

    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

// Set timer untuk menghapus counter limit jika sudah melewati 30 menit
setInterval(() => {
  const currentTime = Date.now();
  Object.keys(failedLoginAttempts).forEach(email => {
    if (currentTime - failedLoginAttempts[email].lastAttempt >= 30 * 60 * 1000) {
      delete failedLoginAttempts[email];
    }
  });
}, 1000); // Periksa setiap detik

module.exports = {
  login,
};
