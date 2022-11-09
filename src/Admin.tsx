import { useHookstate } from '@hookstate/core';
import { useDebouncedValue } from '@mantine/hooks';
import Editor from '@monaco-editor/react';
import React, { useEffect, useState } from 'react';
import { socket } from './socket';
import { globalName, globalUsers } from './state';

const Admin: React.FC = () => {
  const users = useHookstate(globalUsers);
  const [currentlyEditing, setCurrentlyEditing] = useState({
    id: '',
    code: '',
  });
  const [debouncedCurrentlyEditing] = useDebouncedValue(currentlyEditing, 500);
  useEffect(() => {
    socket.emit('code', {
      code: debouncedCurrentlyEditing.code,
      id: debouncedCurrentlyEditing.id,
    });
  }, [debouncedCurrentlyEditing]);

  return (
    <div className='bg-gray-900 grid xl:grid-cols-3 lg:grid-cols-2 gap-4 p-4'>
      {users
        .filter(({ name }) => name.value !== globalName.value)
        .map(({ id, name, code }) => (
          <div
            className='overflow-hidden rounded-xl border-2 border-gray-500'
            key={id.value}
          >
            <div className='bg-gray-700 p-2 text-white'>
              {name.value || 'No Name'}
            </div>
            <Editor
              theme='vs-dark'
              language='javascript'
              height='40vh'
              value={code.value}
              onChange={(v) => {
                code.set(v || '');
                setCurrentlyEditing({ id: id.value, code: v || '' });
              }}
            />
          </div>
        ))}
    </div>
  );
};

export default Admin;
