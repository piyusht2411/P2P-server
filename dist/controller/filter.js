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
exports.year = exports.month = exports.week = exports.day = exports.hour = void 0;
const schema_1 = __importDefault(require("../model/schema"));
// this file is used for getting transition history by applying filters
// for hour filtering
const hour = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield schema_1.default.findById(id);
        const hourlyTransactions = user === null || user === void 0 ? void 0 : user.transition.filter(transaction => {
            const timenow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).getTime();
            const timethen = new Date(transaction.timestamp).getTime();
            const differ = timenow - timethen;
            return differ <= 60 * 60 * 1000;
        });
        res.send(hourlyTransactions);
    }
    catch (error) {
        res.status(407).json({ message: error });
    }
});
exports.hour = hour;
// for daywise filtering
const day = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield schema_1.default.findById(id);
        const dailyTransactions = user === null || user === void 0 ? void 0 : user.transition.filter(transaction => {
            const timenow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).getTime();
            const timethen = new Date(transaction.timestamp).getTime();
            const differ = timenow - timethen;
            return differ <= 24 * 60 * 60 * 1000;
        });
        res.send(dailyTransactions);
    }
    catch (error) {
        res.status(407).json({ message: error });
    }
});
exports.day = day;
// for week filtering
const week = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield schema_1.default.findById(id);
        const weeklyTransactions = user === null || user === void 0 ? void 0 : user.transition.filter(transaction => {
            const timenow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).getTime();
            const timethen = new Date(transaction.timestamp).getTime();
            const differ = timenow - timethen;
            return differ <= 7 * 24 * 60 * 60 * 1000;
        });
        res.send(weeklyTransactions);
    }
    catch (error) {
        res.status(407).json({ message: error });
    }
});
exports.week = week;
// for monthly filtering
const month = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield schema_1.default.findById(id);
        const monthlyTransactions = user === null || user === void 0 ? void 0 : user.transition.filter(transaction => {
            const timenow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).getTime();
            const timethen = new Date(transaction.timestamp).getTime();
            const differ = timenow - timethen;
            return differ <= 30 * 24 * 60 * 60 * 1000;
        });
        res.send(monthlyTransactions);
    }
    catch (error) {
        res.status(407).json({ message: error });
    }
});
exports.month = month;
// for yearly filtering
const year = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield schema_1.default.findById(id);
        const yearlyTransactions = user === null || user === void 0 ? void 0 : user.transition.filter(transaction => {
            const timenow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).getTime();
            const timethen = new Date(transaction.timestamp).getTime();
            const differ = timenow - timethen;
            return differ <= 360 * 24 * 60 * 60 * 1000;
        });
        res.send(yearlyTransactions);
    }
    catch (error) {
        res.status(407).json({ message: error });
    }
});
exports.year = year;
