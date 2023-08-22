import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import User from "./Models/User.js";
import Post from "./Models/Post.js";
import {users, posts} from './data/index.js';


/**imports from local created folders */
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js'
import {register} from './controller/auth.js';
import {createPost} from './controller/posts.js';
import { verifyToken } from "./middleware/auth.js";


/* Configration of backend and all middleware*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
//going to set directory for our assets
app.use("/assets" , express.static(path.join(__dirname, "public/assets"))); 

/* File Storage */

const storage = multer.diskStorage({
    destination : function (req, file, cb){
        cb(null , 'public/assets');
    },
    filename : function(req, file , cb){
        cb(null , 'file.origianlname');
    }
});

const upload = multer({storage});

/* Routes with files*/
app.post('/auth/register' , upload.single('picture') , register);
app.post('/posts', verifyToken, upload.single('picture') , createPost);

/** Routes */
app.use('/auth' , authRoutes);
app.use('/users' , userRoutes);
app.use('/posts', postRoutes);

/* MongoDb Connection */

const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL , {
    useNewUrlParser : true ,
    useUnifiedTopology : true,
}).then(()=>{
    app.listen(PORT , ()=> console.log(`Port Server: http://localhost:${PORT}`))

    /** ADD DATA ONLY ONCE */
    // User.insertMany(users);
    // Post.insertMany(posts); 


}).catch((error)=> console.log(`${error} : did not connect`))