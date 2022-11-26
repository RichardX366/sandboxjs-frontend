import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useDebouncedValue, useViewportSize } from '@mantine/hooks';
import { globalCode } from './state';
import { createState, useHookstate } from '@hookstate/core';
import { socket } from './socket';
import { Button } from '@bctc/components';
import classNames from 'classnames';

interface ConsoleEntry {
  type: 'log' | 'error' | 'warn';
  message: any;
}

const globalFakeConsole = createState<ConsoleEntry[]>([]);
console.log = (...args: any[]) => {
  globalFakeConsole.merge(
    args.map(
      (arg) =>
        ({
          type: 'log',
          message: arg instanceof Error ? arg.stack : arg,
        } as ConsoleEntry),
    ),
  );
};
console.error = (...args: any[]) => {
  globalFakeConsole.merge(
    args.map(
      (arg) =>
        ({
          type: 'error',
          message: arg instanceof Error ? arg.stack : arg,
        } as ConsoleEntry),
    ),
  );
};
console.warn = (...args: any[]) => {
  globalFakeConsole.merge(
    args.map(
      (arg) =>
        ({
          type: 'warn',
          message: arg instanceof Error ? arg.stack : arg,
        } as ConsoleEntry),
    ),
  );
};

const User: React.FC = () => {
  const { height, width } = useViewportSize();
  const fakeConsole = useHookstate(globalFakeConsole);
  const code = useHookstate(globalCode);
  const [debouncedCode] = useDebouncedValue(code.value, 500);
  const consoleDiv = useRef<HTMLDivElement>(null);
  useEffect(() => {
    socket.emit('code', { code: debouncedCode, id: socket.id });
  }, [debouncedCode]);

  const runCode = () => {
    try {
      // eslint-disable-next-line no-eval
      eval(code.value);
    } catch (e) {
      fakeConsole.merge([
        {
          type: 'error',
          message: e instanceof Error ? e.stack : e,
        },
      ]);
    }
    setTimeout(() =>
      consoleDiv.current?.scroll({
        top: consoleDiv.current?.scrollHeight,
      }),
    );
  };

  return (
    <div className='grid grid-cols-3'>
      <div
        className='col-span-2 relative bg-gray-700'
        onKeyDown={(e) => {
          if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            runCode();
          }
        }}
      >
        <Editor
          theme='vs-dark'
          language='javascript'
          height={`${height - 64}px`}
          value={code.value}
          onChange={(v) => code.set(v || '')}
        />
      </div>
      <div
        style={{ maxHeight: height - 64 }}
        className='text-white font-mono pb-12 divide-y divide-gray-200 overflow-auto'
        ref={consoleDiv}
      >
        {fakeConsole.value.map((elem, i) => (
          <div
            className={classNames(
              'px-4 py-2 hover:bg-gray-700 whitespace-pre-line',
              {
                'text-green-300':
                  typeof elem.message === 'number' ||
                  typeof elem.message === 'bigint',
                'text-orange-400':
                  elem.type === 'log' && typeof elem.message === 'string',
                'text-blue-600':
                  typeof elem.message === 'boolean' ||
                  elem.message === undefined ||
                  elem.message === null,
                'text-red-500': elem.type === 'error',
                'text-yellow-400': elem.type === 'warn',
              },
            )}
            key={i}
          >
            {((typeof elem.message === 'object' ||
              typeof elem.message === 'string') &&
            elem.type === 'log'
              ? JSON.stringify(elem.message)
              : `${elem.message}${typeof elem.message === 'bigint' ? 'n' : ''}`
            )
              .split('\n    at runCode')[0]
              .replace(/(?=eval \(eval at runCode \()(.*)(?=<anonymous>)/s, '')
              .replace('<anonymous>:', '')
              .replace(')', '')
              .replaceAll(' ', '\u00A0')}
          </div>
        ))}
        <div
          className='absolute right-0 bottom-0 bg-gray-800 h-12 p-1 flex gap-1'
          style={{ width: width / 3 }}
        >
          <Button
            className='bg-red-500 hover:bg-red-600 focus:ring-red-400'
            onClick={() => fakeConsole.set([])}
          >
            Clear Console
          </Button>
          <Button
            className='bg-green-500 hover:bg-green-600 focus:ring-green-400'
            onClick={runCode}
          >
            Run Code
          </Button>
        </div>
      </div>
    </div>
  );
};

export default User;
