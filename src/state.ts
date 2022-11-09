import { hookstate } from '@hookstate/core';
import { localstored } from '@hookstate/localstored';

interface User {
  id: string;
  name: string;
  code: string;
}

export const globalName = hookstate('', localstored({ key: 'name' }));
export const globalCode = hookstate('', localstored({ key: 'code' }));
export const globalUsers = hookstate<User[]>([]);
export const globalIsAdmin = hookstate(false, localstored({ key: 'isAdmin' }));
