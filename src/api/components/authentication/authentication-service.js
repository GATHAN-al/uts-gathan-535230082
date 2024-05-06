const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');
const { errorResponder, errorTypes } = require('../../../core/errors');

// Objek untuk menyimpan jumlah upaya login gagal dan waktu terakhirnya untuk setiap email
const failedLoginAttempts = {};

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  const user = await authenticationRepository.getUserByEmail(email);

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.
  if (user && passwordChecked) {
    // Jika login berhasil, reset jumlah upaya login gagal untuk email ini
    delete failedLoginAttempts[email];

    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  } else {
    // Jika login gagal, tambahkan satu pada jumlah upaya login gagal untuk email ini
    failedLoginAttempts[email] = (failedLoginAttempts[email] || 0) + 1;

    // Jika jumlah upaya login gagal sudah mencapai batas, kembalikan error
    if (failedLoginAttempts[email] >= 5) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Too many failed login attempts. Please try again later.'
      );
    }

    return null;
  }
}

module.exports = {
  checkLoginCredentials,
};
