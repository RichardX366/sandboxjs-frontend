import { io } from 'socket.io-client';
import { globalCode, globalIsAdmin, globalName, globalUsers } from './state';

export const socket = io(
  process.env.REACT_APP_API_URL || 'https://sandboxjs.richardxiong.com',
  { auth: { name: globalName.value, code: globalCode.value } },
);

socket.on('becomeAdmin', () => globalIsAdmin.set(true));
socket.on('removeAdmin', () => globalIsAdmin.set(false));
socket.on('users', (users) => globalUsers.set(users));
socket.on('code', globalCode.set);
