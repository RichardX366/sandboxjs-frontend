import React from 'react';
import { globalName, globalIsAdmin } from './state';
import { useHookstate } from '@hookstate/core';
import { socket } from './socket';
import Admin from './Admin';
import User from './User';

const App: React.FC = () => {
  const name = useHookstate(globalName);
  const { value: isAdmin } = useHookstate(globalIsAdmin);

  return (
    <div className='pt-16'>
      <div className='fixed inset-x-0 top-0 bg-gray-800 h-16 p-3 flex justify-between'>
        <h1 className='text-3xl text-white'>Sandbox JS</h1>
        <input
          placeholder='Name'
          type='text'
          className='rounded-xl'
          value={name.value}
          onChange={(e) => {
            name.set(e.target.value);
            socket.emit('name', { name: e.target.value, id: socket.id });
          }}
        />
      </div>
      {isAdmin ? <Admin /> : <User />}
    </div>
  );
};

export default App;
