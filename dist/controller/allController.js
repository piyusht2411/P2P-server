"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMailApi = exports.addMoney = exports.sendMoney = exports.signout = exports.userInfo = exports.signIn = exports.register = void 0;
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const schema_1 = __importDefault(require("../model/schema"));
const emailer_1 = require("../util/emailer");
const generateUniqueId = () => {
    const v4options = {
        random: [
            0x10, 0x91, 0x56, 0xbe, 0xc4, 0xfb, 0xc1, 0xea, 0x71, 0xb4, 0xef, 0xe1, 0x67, 0x1c, 0x58, 0x36,
        ],
    };
    return (0, uuid_1.v4)(v4options);
};
//for sign up
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phone, password, pin } = req.body;
        //for validation
        const expression = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        const pass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/;
        // check input for validation
        if (!pass.test(password.toString())) {
            return res.status(407).json({ message: 'Enter valid password with uppercase, lowercase, number & @' });
        }
        if (!expression.test(email.toString())) {
            return res.status(407).json({ message: 'Enter valid email' });
        }
        if (typeof phone !== 'number' && ("" + phone).length !== 10) {
            return res.status(407).json({ message: 'Phone number should only have 10 digits, No character allowed.' });
        }
        const existinguser = yield schema_1.default.findOne({ email });
        //if user is already exist
        if (existinguser) {
            return res.status(400).json({ ok: false, message: 'User already Exist' });
        }
        //hashing password
        const salt = (0, bcrypt_1.genSaltSync)(10);
        const hashPassword = (0, bcrypt_1.hashSync)(password, salt);
        const hashPin = (0, bcrypt_1.hashSync)(pin, salt);
        const newUser = new schema_1.default({
            name,
            email,
            phone,
            password: hashPassword,
            pin: hashPin
        });
        //save new user
        yield newUser.save();
        res.status(200).json({ message: 'registred successfully' });
    }
    catch (err) {
        res.status(407).json({ message: err });
    }
});
exports.register = register;
//for signing in
const signIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield schema_1.default.findOne({ email });
        // Checking if the email exists in database 
        if (!user) {
            return res.status(400).json({ ok: false, message: "User not found" });
        }
        // comapring password entered with database hashed Password
        const isPasswordMatch = yield (0, bcrypt_1.compareSync)(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ ok: false, message: "Invalid Credentials" });
        }
        // Generating tokens
        const authToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET_KEY || " ", { expiresIn: '30m' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET_KEY || " ", { expiresIn: '2h' });
        // Saving tokens in cookies 
        // res.cookie('authToken',authToken,({httpOnly : true})) ;
        res.cookie('authToken', authToken, ({ httpOnly: true }));
        res.cookie('refreshToken', refreshToken, ({ httpOnly: true }));
        res.header('Authorization', `Bearer ${authToken}`);
        return res.status(200).json({ ok: true, message: "Login Successful", userid: user.id, user, authToken: authToken, refreshToken: refreshToken });
    }
    catch (err) {
        next(err);
    }
});
exports.signIn = signIn;
// for checking balance of a user
const userInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield schema_1.default.findById(id);
        if (!user) {
            return res.status(400).json({ ok: false, message: "Invalid Credentials" });
        }
        return res.status(200).json({ ok: true, user });
    }
    catch (err) {
        res.status(407).json({ message: err });
    }
});
exports.userInfo = userInfo;
//for sign out
const signout = (req, res, next) => {
    try {
        //clearing cookies
        res.clearCookie('authToken');
        res.clearCookie('refreshToken');
        return res.status(200).json({ ok: true, message: "User has been logged out" });
    }
    catch (err) {
        next(err);
    }
};
exports.signout = signout;
//send money to other users
const sendMoney = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //sender id => user who want to send money he 
        // receiver id => in which user we want to send money
        // amount => how much money do want to send in reciever's wallet
        // sender id will be send in parameter and reciever id and amount will be sent by body
        const senderId = req.params.id;
        // const receiverId = req.body.receiverId;
        const receiverMail = req.body.receiverMail;
        const amount = req.body.amount;
        const pin = req.body.pin;
        // find sender and reciever in database
        const sender = yield schema_1.default.findOne({ _id: senderId });
        const receiver = yield schema_1.default.findOne({ email: receiverMail });
        // if sender is not in database
        if (!sender) {
            return res.status(400).json({ ok: false, message: "sender not found" });
        }
        //if reciecver is not in database
        if (!receiver) {
            return res.status(400).json({ ok: false, message: "receiver not found" });
        }
        // if the sender id and receiver id are same
        if (sender.email === receiver.email) {
            return res.status(400).json({ message: "Cannot transfer to the same account" });
        }
        const isPinMatch = yield (0, bcrypt_1.compareSync)(pin, sender.pin);
        if (!isPinMatch) {
            return res.status(400).json({ ok: false, message: "Wrong Pin Number" });
        }
        let senderBalance = sender.wallet;
        //if sender's balance is less than the sending amount
        if (senderBalance < amount) {
            return res.status(400).json({ ok: false, message: "Insufficient Funds" });
        }
        sender.wallet = Number(sender.wallet) - amount;
        receiver.wallet = Number(receiver.wallet) + Number(amount);
        // sender's transaction data 
        const sendertransactiondata = {
            id: generateUniqueId(),
            status: "Sent money",
            amount: amount,
            wallet: sender.wallet,
            timestamp: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        };
        // receiver's transaction data
        const receivertransactiondata = {
            id: generateUniqueId(),
            status: "Received money",
            amount: amount,
            wallet: receiver.wallet,
            timestamp: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        };
        // push sender's transaction data and reciever's data to their recpective transition array
        sender.transition.push(sendertransactiondata);
        receiver.transition.push(receivertransactiondata);
        // update sender and reciecver's wallet
        yield schema_1.default.findByIdAndUpdate(sender._id, { wallet: sender.wallet }, { new: true });
        const data = yield schema_1.default.findByIdAndUpdate(receiver._id, { wallet: receiver.wallet }, { new: true });
        yield sender.save();
        yield receiver.save();
        let Senderemail = sender.email;
        let Receiveremail = receiver.email;
        // for sending mail to sender and reciever that they have recieved the money
        (0, emailer_1.sendMail)(Senderemail, "Money transferred", `You transfered Rs. ${amount} in ${receiver.name}'s wallet`);
        (0, emailer_1.sendMail)(Receiveremail, "Money Received", `${sender.name} trasnfered Rs. ${amount} in your wallet`);
        res.status(200).json({ ok: true, message: "money sent successfully", transitionId: sendertransactiondata.id });
    }
    catch (error) {
        res.status(407).json({ message: error });
    }
});
exports.sendMoney = sendMoney;
const addMoney = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const senderId = req.params.id;
        const amount = req.body.amount;
        const pin = req.body.pin;
        const user = yield schema_1.default.findById(senderId);
        if (!user) {
            return res.status(400).json({ ok: false, message: "user not found" });
        }
        const isPinMatch = yield (0, bcrypt_1.compareSync)(pin, user.pin);
        if (!isPinMatch) {
            return res.status(400).json({ ok: false, message: "Wrong Pin Number" });
        }
        user.wallet = Number(user.wallet) + Number(amount);
        const transactiondata = {
            id: generateUniqueId(),
            status: "Added money",
            amount: amount,
            wallet: user.wallet,
            timestamp: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        };
        user.transition.push(transactiondata);
        const result = yield schema_1.default.findByIdAndUpdate(user._id, { wallet: user.wallet }, { new: true });
        yield user.save();
        res.status(200).json({ ok: true, message: "money added successfully", transitionId: transactiondata.id });
        (0, emailer_1.sendMail)(user.email, "Money added", `${user.name} Rs. ${amount} in added in your wallet`);
    }
    catch (error) {
        res.status(407).json({ message: error });
    }
});
exports.addMoney = addMoney;
const sendMailApi = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, subject, message } = req.body;
        (0, emailer_1.sendMail)("piyushthakur241199@gmail.com", `subject ${subject}`, `A user named - ${name} with email - ${email} send you this message  - ${message}`);
    }
    catch (error) {
        res.status(407).json({ message: error });
    }
});
exports.sendMailApi = sendMailApi;
