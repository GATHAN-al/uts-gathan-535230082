const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const usersControllers = require('./users-controller');
const usersValidator = require('./users-validator');
const route = express.Router();

module.exports = (app) => {
  app.use('/users', route);

  // Get list of users
  route.get('/', authenticationMiddleware, usersControllers.getUsers);

  // Create user
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(usersValidator.createUser),
    usersControllers.createUser
  );

  // Get user detail
  route.get('/:id', authenticationMiddleware, usersControllers.getUser);

  // Update user
  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(usersValidator.updateUser),
    usersControllers.updateUser
  );

  // Delete user
  route.delete('/:id', authenticationMiddleware, usersControllers.deleteUser);

  //Change password
  route.post(
    '/:id/change-password',
    authenticationMiddleware,
    celebrate(usersValidator.changePassword),
    usersControllers.changePassword
  );
  
 route.post(
    '/transactions',
    authenticationMiddleware,
   celebrate(usersValidator.tambahTransaksi),
   usersControllers.tambahTransaksi
  );
  route.put(
    '/:userId/transactions',
    authenticationMiddleware,
    celebrate(usersValidator.updateUserTransaction),
    usersControllers.updateUserTransaction
  );
  route.get(
    '/transactions',
    authenticationMiddleware,
    celebrate(usersValidator.tambahTransaksi),
    usersControllers.tambahTransaksi
  );
//   route.get('/transactions', authenticationMiddleware, usersControllers.addTransaction);
// 
  //route.get('/:id', authenticationMiddleware, usersControllers. getUserById);
 // route.get(' /transactions', usersControllers.tambahTransaksi);
  //route.post('/:userId/transactions', usersControllers.tambahTransaksi);

  //route.put(
   // '/:userId/transactions',
   // authenticationMiddleware,
   // celebrate(usersValidator.updateTransactionInfo), // Assuming you have a validator for updating transactions
  //  usersControllers.updateTransactionInfo
  //);
  
};
