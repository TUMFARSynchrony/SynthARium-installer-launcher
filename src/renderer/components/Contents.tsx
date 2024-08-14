/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable prefer-template */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import parse from 'html-react-parser';
import OutputLog from './OutputLog';
import topics from '../../constants/topics';
import { IMessage } from '../interfaces/message';
import { IContentsProps } from '../interfaces/props';

function Contents(props: IContentsProps) {
  const { ipcRenderer } = window.electron;
  const { content, isPageLoading, isOperationLoading } = props;
  const {
    name,
    buttonName,
    type,
    prevButtonClick,
    nextButtonClick,
    onClick,
    liveLog,
    msg,
    status,
    description,
  } = content;
  const [authToken, setAuthToken] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState('');
  const [configurationLog, setConfigurationLog] = useState('');

  useEffect(() => {
    ipcRenderer.on('syntharium', (message: any): void => {
      const convertedMessage = message as IMessage;
      if (
        convertedMessage.topic === topics.liveLog &&
        convertedMessage.data.logs
      ) {
        setLogs(convertedMessage.data.logs + logs);
      } else if (
        convertedMessage.topic === topics.liveLog &&
        convertedMessage.data.configurationLog
      ) {
        setConfigurationLog(convertedMessage.data.configurationLog);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, showLogs]);

  useEffect(() => {
    setLogs('');
    setConfigurationLog('');
    setAuthToken('');
    setShowLogs(false);
  }, [name]);

  const renderMessageSection = (message: string) => {
    return (
      <div className="mt-2 p-1 rounded border-solid border-2 border-gray-300">
        <p className="text-left text-sm max-h-20 h-20 overflow-y-scroll">
          {message}
        </p>
      </div>
    );
  };

  const renderInputSection = () => {
    const token = authToken || (msg && type === 'input' && msg) || '';
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onClick(token);
        }}
      >
        <div className="mt-5">
          <input
            type="text"
            id="auth_token"
            value={token}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Please enter your authentication key"
            required
            onChange={(e) => setAuthToken(e.target.value)}
          />
          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mt-4"
          >
            {buttonName}
          </button>
          {configurationLog ? renderMessageSection(configurationLog) : <></>}
        </div>
      </form>
    );
  };

  const renderInstallTestButton = () => {
    return (
      <div className="flex justify-center mt-5 mb-2">
        <button
          type="button"
          // eslint-disable-next-line prettier/prettier
          className={"font-montserrat -coral-red hover:bg-slate-300 flex items-center justify-center gap-2 rounded-full border bg-slate-100 px-7 py-4 text-lg leading-none text-black " + (isOperationLoading ? 'cursor-progress' : '')}
          onClick={(event) => {
            event.preventDefault();
            onClick('');
          }}
          disabled={!!isOperationLoading}
        >
          {buttonName}
        </button>
      </div>
    );
  };

  return (
    <div className="flex-1 rounded-[20px] px-10 py-8 shadow-2xl col-span-7">
      {isPageLoading ? (
        <>
          <h2>Loading</h2>
          {type !== 'input' && liveLog ? (
            <OutputLog
              onChangeButton={setShowLogs}
              logs={logs}
              setLogs={setLogs}
              rows={2}
              name={name}
            />
          ) : (
            <></>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-col h-full">
            <div>
              <h2 className="font-bold text-l">{name}</h2>
            </div>
            <div className="flex-grow">
              <div className="mt-6 text-center">{parse(description)}</div>
              {type !== 'input'
                ? renderInstallTestButton()
                : renderInputSection()}
              {type !== 'input' && liveLog ? (
                showLogs ? (
                  <OutputLog
                    onChangeButton={setShowLogs}
                    logs={logs}
                    setLogs={setLogs}
                    rows={4}
                    name={name}
                  />
                ) : (
                  <a
                    className="italic underline underline-offset-2 hover:cursor-pointer text-gray-950"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowLogs(true);
                    }}
                  >
                    Expand for additional application logs.
                  </a>
                )
              ) : (
                <></>
              )}
              {type !== 'input' && msg && name.match(/Test/i) ? (
                renderMessageSection(msg)
              ) : (
                <></>
              )}
            </div>
            <div className="flex flex-2 justify-evenly gap-40 static bottom-0">
              <button
                type="button"
                className={
                  'font-palanquin rounded-full border bg-red-200 hover:bg-red-300 px-7 py-4 max-h-14 max-w-18 text-red-950 ' +
                  (isOperationLoading ? 'cursor-progress' : 'cursor-pointer')
                }
                onClick={prevButtonClick}
                disabled={!!isOperationLoading}
              >
                Back
              </button>
              {name !== 'Install Project' ? (
                <button
                  type="button"
                  className={
                    'font-palanquin rounded-full border bg-green-200 hover:bg-green-300 px-7 py-4 max-h-14 max-w-18 text-black ' +
                    (isOperationLoading
                      ? 'cursor-progress'
                      : status
                        ? 'cursor-pointer'
                        : 'cursor-not-allowed')
                  }
                  onClick={nextButtonClick}
                  disabled={!!isOperationLoading || !status}
                >
                  Next
                </button>
              ) : (
                <Link to="/launch">
                  <button
                    type="button"
                    className={
                      'font-palanquin rounded-full border bg-green-200 hover:bg-green-300 px-7 py-4 max-h-14 max-w-18 text-black ' +
                      (isOperationLoading
                        ? 'cursor-progress'
                        : status
                          ? 'cursor-pointer'
                          : 'cursor-not-allowed')
                    }
                    onClick={() => {}}
                    disabled={!!isOperationLoading || !status}
                    title={
                      !!isOperationLoading || !status
                        ? 'Please complete the steps to navigate to launcher page'
                        : ''
                    }
                  >
                    Launcher
                  </button>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Contents;
