import express, { Express, Request, Response , Application, NextFunction} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes/routes';
import db = require('./config/db');
import { json } from 'body-parser';
import cookieParser from 'cookie-parser';
dotenv.config();
declare global {
  namespace Express {
    interface Request {
      userId?: string ;
}
}}

const app: Application = express();
const PORT = process.env.PORT || 8080;
//middleware
var corsOptions = {
  origin: ["https://p2p-client-blue.vercel.app", "http://localhost:3000", "https://piyusht2411.github.io", "http://127.0.0.1:5500"],
  credentials: true
};

app.use(cors(corsOptions));
// app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/', routes);



// if any error in routes this will triggered
app.use((err: Error, req: Request, res:Response, next: NextFunction) => {
  res.status(500).json({message: err.message});  
});

//database connection function
const start = async () => {
  try {
    // connectDB
    await db.connectDB(process.env.MONGO_URL!);
    //server connection port 
    app.listen(PORT, () => console.log(`Server is connected to port : ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

//calling database function
start();
