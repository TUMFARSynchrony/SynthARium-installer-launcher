import CopyToClipboard from 'react-copy-to-clipboard';
import { useEffect, useState } from 'react';
import { IOutputLogProps } from '../interfaces/props';

export default function OutputLog(props: IOutputLogProps) {
  const { onChangeButton, logs, setLogs, rows, name } = props;
  const [value, setValue] = useState(logs);

  useEffect(() => {
    setValue(logs);
  }, [logs]);

  return (
    <div className="relative" key={name}>
      <div className="grid grid-cols-7">
        <p />
        <div className="col-span-5">
          <div className="relative w-full">
            <textarea
              rows={rows}
              cols={10}
              readOnly
              className="peer h-full min-h-[80px] w-full !resize-none  rounded-[7px] border border-gray-700 px-3 py-2.5 font-sans text-sm font-normal text-gray-700 outline outline-0 transition-all"
              value={value}
            />
          </div>
          <div className="flex w-full justify-between py-1.5">
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
              <button
                type="button"
                className="bg-white hover:bg-gray-900/10 font-sans text-xs text-gray-900 font-bold py-2 px-4 rounded inline-flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  setLogs('');
                  setValue('');
                }}
              >
                <svg
                  className="fill-current w-4 h-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M6 2l2-2h4l2 2h4v2H2V2h4zM3 6h14l-1 14H4L3 6zm5 2v10h1V8H8zm3 0v10h1V8h-1z" />
                </svg>
                <span>CLEAR ALL</span>
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="bg-white hover:bg-gray-900/10 font-sans text-xs text-gray-900 font-bold py-2 px-4 rounded inline-flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  onChangeButton(false);
                }}
              >
                <svg
                  className="fill-current w-4 h-4 mr-2"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12.81 4.36l-1.77 1.78a4 4 0 0 0-4.9 4.9l-2.76 2.75C2.06 12.79.96 11.49.2 10a11 11 0 0 1 12.6-5.64zm3.8 1.85c1.33 1 2.43 2.3 3.2 3.79a11 11 0 0 1-12.62 5.64l1.77-1.78a4 4 0 0 0 4.9-4.9l2.76-2.75zm-.25-3.99l1.42 1.42L3.64 17.78l-1.42-1.42L16.36 2.22z" />
                </svg>
                <span>COLLAPSE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
