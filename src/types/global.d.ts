export {};

declare global {
  namespace Express {
    type UserPayload = {
      id?: string;
      // Add other user properties if needed
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/consistent-type-definitions
    interface Request {
      user?: UserPayload;
    }
  }
}
