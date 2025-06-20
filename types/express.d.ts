// Ensure it's treated as a module
export {};

declare module "express-serve-static-core" {
  interface Request {
    // Add your custom fields here, for example:
    userId?: string;
    // Or any other property you wish to attach to req
  }
}
