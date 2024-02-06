import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken' ;
import User from '../model/schema';
import refresh from "../model/refresh";
//authentication function
export const authenticateToken = async(req: Request, res: Response, next: NextFunction) => {
    // const authToken = req.cookies.authToken ;
    // const refreshToken = req.cookies.refreshToken ;
    // const auth =req.headers.authorization;
    // const authToken = auth && auth.split(' ')[1];
    // const refreshToken =auth && auth.split('+')[1];
    const myuserId = req.params.id;
    // const decoded = jwt.verify(authToken.replace('Bearer ', ''), process.env.JWT_SECRET_KEY || " ");
    // const userdata :any = decoded;

    // const myuserId = userdata.userId;
    const tokenuser = await refresh.findOne({tokenId:myuserId})
    if(!tokenuser) {
        return res.status(400).json({ok:false,message:"Please login again."}); ;
        
    }
    const refreshToken = tokenuser.refreshToken;
    const authToken =  req.header('authorization');
    //if auth token and refersh token both doesn't exist
    if(!authToken || !refreshToken){
        return res.status(401).json({message : " Authentication Failed : No authToken or refreshToken is provided "})
    }
    //verify auth token
    // console.log("backend authToken", authToken);
    // console.log("backend referesh", refreshToken);
    // authToken = authToken.split(0, authToken.length-1);

    jwt.verify(authToken.replace('Bearer ', ''),process.env.JWT_SECRET_KEY||"",(err:any,decode:any)=>{
        
        if(err) {
            jwt.verify(refreshToken,process.env.JWT_REFRESH_SECRET_KEY||"",(refreshErr:any,refreshDecode:any)=> {
                //if refresh token gives error
                if(refreshErr){
                    return res.status(401).json({message : " Authentication Failed : Both tokens are invalid"}) ;
                }
                else{
                    //generate new auth token and refersh token
                    const newAuthToken = jwt.sign({userId : refreshDecode.userId},process.env.JWT_SECRET_KEY||"",{expiresIn : '30m'});
                    const newRefreshToken = jwt.sign({userId : refreshDecode.userId},process.env.JWT_REFRESH_SECRET_KEY||"",{expiresIn : '2h'})
                     //save auth token and referesh token in cookies
                    res.cookie('authToken',newAuthToken,{httpOnly:true}) ;
                    res.cookie('refreshToken',newRefreshToken,{httpOnly : true }) ;
                    res.header('Authorization', `Bearer ${newAuthToken}`);
                    // console.log(refreshDecode.userId,"liasd")
                    const find_user = User.findById(refreshDecode.userId);
                    if(!find_user){
                        return res.status(400).send("You are not authenticated User");
                    }else{
                        req.userId=refreshDecode.userId;
                        // console.log(refreshDecode.userId)
                        next();
                    }
                }
            })
        }
        else{
            const find_user = User.findById(decode.userId );
            if(!find_user){
                return res.status(400).send("You are not authenticated User");
            }else{
                req.userId=decode.userId;
                // console.log(decode.userId);
                next();
            }
   }
})

};