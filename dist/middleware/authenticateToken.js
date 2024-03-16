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
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const schema_1 = __importDefault(require("../model/schema"));
//authentication function
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const authToken = req.cookies.authToken ;
    const refreshToken = req.cookies.refreshToken;
    // const auth =req.headers.authorization;
    // const authToken = auth && auth.split(' ')[1];
    // const refreshToken =auth && auth.split('+')[1];
    // const mmy = req.params.id; => may check this this may be correct
    const authToken = req.header('authorization');
    if (!refreshToken) {
        return res.status(405).send('Access token not found');
    }
    // const decoded = jwt.verify(authToken.replace('Bearer ', ''), process.env.JWT_SECRET_KEY || " ");
    // const userdata :any = decoded;
    // const myuserId = userdata.userId;
    // const tokenuser = await refresh.findOne({tokenId:myuserId})
    // if(!tokenuser) {
    //     return res.status(400).json({ok:false,message:"Please login again."}); ;
    // }
    // const refreshToken = tokenuser.refreshToken;
    //if auth token and refersh token both doesn't exist
    
    if (!authToken || !refreshToken) {
        return res.status(401).json({ message: " Authentication Failed : No authToken or refreshToken is provided " });
    }
    //verify auth token
    // console.log("backend authToken", authToken);
    // console.log("backend referesh", refreshToken);
    // authToken = authToken.split(0, authToken.length-1);
    jsonwebtoken_1.default.verify(authToken.replace('Bearer ', ''), process.env.JWT_SECRET_KEY || "", (err, decode) => {
        if (err) {
            jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY || "", (refreshErr, refreshDecode) => {
                //if refresh token gives error
                if (refreshErr) {
                    return res.status(401).json({ message: " Authentication Failed : Both tokens are invalid" });
                }
                else {
                    //generate new auth token and refersh token
                    const newAuthToken = jsonwebtoken_1.default.sign({ userId: refreshDecode.userId }, process.env.JWT_SECRET_KEY || "", { expiresIn: '30m' });
                    const newRefreshToken = jsonwebtoken_1.default.sign({ userId: refreshDecode.userId }, process.env.JWT_REFRESH_SECRET_KEY || "", { expiresIn: '2h' });
                    //save auth token and referesh token in cookies
                    res.cookie('authToken', newAuthToken, { httpOnly: true });
                    res.cookie('refreshToken', newRefreshToken, { httpOnly: true });
                    res.header('Authorization', `Bearer ${newAuthToken}`);
                    // console.log(refreshDecode.userId,"liasd")
                    const find_user = schema_1.default.findById(refreshDecode.userId);
                    if (!find_user) {
                        return res.status(400).send("You are not authenticated User");
                    }
                    else {
                        req.userId = refreshDecode.userId;
                        // console.log(refreshDecode.userId)
                        next();
                    }
                }
            });
        }
        else {
            const find_user = schema_1.default.findById(decode.userId);
            if (!find_user) {
                return res.status(400).send("You are not authenticated User");
            }
            else {
                req.userId = decode.userId;
                // console.log(decode.userId);
                next();
            }
        }
    });
});
exports.authenticateToken = authenticateToken;
