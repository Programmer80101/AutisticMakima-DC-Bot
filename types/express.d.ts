// make it a module
export {};

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}
