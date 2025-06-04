const {body} = require('express-validator')

exports.registerValidation = [
    body('username')
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters'),
    
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be valid'),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 4 }).withMessage('Password must be atleast 6 characters')
];


exports.loginValidation = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email'),
    
    body('password')
        .notEmpty().withMessage('Password is required')
];