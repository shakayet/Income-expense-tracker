export type Proxy = {
  ip: string;
  port: number;
  username?: string;
  password?: string;
};

export const proxies: Proxy[] = [
  // Example proxy with no auth
  // { ip: '123.123.123.123', port: 8080 },

  // Example proxy with authentication
  // { ip: '111.111.111.111', port: 8000, username: 'myUser', password: 'myPass' },

  // Add more proxies here
];
