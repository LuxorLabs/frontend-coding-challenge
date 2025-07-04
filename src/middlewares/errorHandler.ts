import {NextFunction, Request, Response} from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error('Error:', err);
  if (err.status) {
    res.status(err.status).json({error: err.message});
  } else {
    res.status(500).json({error: 'Internal Server Error'});
  }
}
