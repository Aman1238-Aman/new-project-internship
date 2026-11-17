import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import employeeRoutes from './routes/employeeRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { dashboard } from './controllers/dashboardController.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { asyncHandler } from './utils/asyncHandler.js';

const app=express();
const origins=(process.env.CLIENT_URL||'http://localhost:5173').split(',').map(x=>x.trim()).filter(Boolean);
app.disable('x-powered-by');app.use(helmet());app.use(cors({origin(origin,cb){if(!origin||origins.includes('*')||origins.includes(origin))return cb(null,true);return cb(new Error('Origin is not allowed by CORS'));},methods:['GET','POST','PUT','DELETE','OPTIONS'],allowedHeaders:['Content-Type','Authorization']}));
app.use(express.json({limit:'64kb'}));app.use(morgan(process.env.NODE_ENV==='production'?'combined':'dev'));
app.get('/api/health',(_req,res)=>res.json({success:true,data:{status:'ok',time:new Date().toISOString()}}));
app.use('/api/employees',employeeRoutes);app.use('/api/tasks',taskRoutes);app.get('/api/dashboard',asyncHandler(dashboard));app.use(notFound);app.use(errorHandler);

const port=Number(process.env.PORT)||5000;
if(process.env.NODE_ENV!=='test')connectDB().then(()=>app.listen(port,'0.0.0.0',()=>console.log(`Roots API listening on ${port}`))).catch(error=>{console.error('Database connection failed:',error.message);process.exit(1);});
export default app;
