import { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { IAutoUpdaterProps } from '../interfaces/props';

export default function AutoUpdater(props: IAutoUpdaterProps) {
  const [value, setValue] = useState('');
  useEffect(() => {
    setValue(value + props.logs);
  }, [props, value]);

  return (
    <>
      <div className="flex flex-col">
        <p className="">Auto Updater Logs</p>
      </div>
      <div className="p-2 flex h-1/2 w-full">
        <textarea
          id="message"
          rows={10}
          readOnly
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          value={value}
        />
      </div>
      <div className="flex w-full justify-between py-1.5 pl-2">
        <div>
          <CopyToClipboard text={value}>
            <button
              type="button"
              className="bg-white hover:bg-gray-900/10 font-sans text-xs text-gray-900 font-bold py-2 px-4 rounded inline-flex items-center"
            >
              <svg
                className="fill-current w-4 h-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M0 10V2l2-2h8l10 10-10 10L0 10zm4.5-4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
              </svg>
              <span>COPY</span>
            </button>
          </CopyToClipboard>
        </div>
      </div>
    </>
  );
}
