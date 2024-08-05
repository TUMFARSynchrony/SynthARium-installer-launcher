/* eslint-disable react/button-has-type */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable prefer-template */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import topics from '../../constants/topics';
import OutputLog from '../components/OutputLog';
import { IMessage } from '../interfaces/message';

export default function Launcher() {
  const { ipcRenderer } = window.electron;
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isOperationLoading, setIsOperationLoading] = useState(false);
  const [isProjectLive, setIsProjectLive] = useState(false);
  const [logs, setLogs] = useState('');
  const [errorLog, setErrorLog] = useState('');
  const [showLogs, setShowLogs] = useState(true);
  const [useOpenface, setUseOpenFace] = useState(false);
  const [useOpenAi, setUseOpenAi] = useState(false);
  const [useNgrok, setUseNgrok] = useState(false);
  const [hostUrl, setHostUrl] = useState('');
  const [ngrokStatus, setNgrokStatus] = useState(false);
  const [chatgptStatus, setChatgptStatus] = useState(false);
  const [openfaceStatus, setOpenfaceStatus] = useState(false);

  const sendLaunchCommand = () => {
    const options = {
      enableOpenFace: useOpenface,
      enableNgrok: useNgrok,
      enableOpenAi: useOpenAi,
    };
    ipcRenderer.sendMessage(
      'syntharium',
      'launchProject',
      'launch',
      JSON.stringify(options),
    );
    setIsOperationLoading(true);
    setErrorLog('');
    setLogs('');
  };

  const sendTerminateCommand = () => {
    ipcRenderer.sendMessage('syntharium', 'launchProject', 'terminate');
    setHostUrl('');
    setIsOperationLoading(true);
  };

  useEffect(() => {
    const setup = () => {
      setIsPageLoading(true);
      ipcRenderer.sendMessage(
        'syntharium',
        'checkLauncherStatuses',
        'launcher',
      );
    };

    setup();
    ipcRenderer.on('syntharium', (message: any): void => {
      const convertedMessage = message as IMessage;

      if (convertedMessage.topic === topics.checkLauncherStatuses) {
        setNgrokStatus(convertedMessage.data.ngrok);
        setOpenfaceStatus(convertedMessage.data.openface);
        setChatgptStatus(convertedMessage.data.chatgpt);
        setIsProjectLive(convertedMessage.data.isProjectLive);
        if (convertedMessage.data.hostUrl) {
          setHostUrl(convertedMessage.data.hostUrl);
        }
      } else if (convertedMessage.topic === topics.liveLog) {
        if (convertedMessage.data.serverStarted) {
          setIsProjectLive(true);
          setIsOperationLoading(false);
        } else if (convertedMessage.data.serverStopped) {
          setIsProjectLive(false);
          setIsOperationLoading(false);
          setHostUrl('');
        } else if (convertedMessage.data.logs) {
          setLogs(convertedMessage.data.logs + logs);
        } else if (convertedMessage.data.errorLog) {
          setIsOperationLoading(false);
          setIsProjectLive(false);
          // eslint-disable-next-line no-alert
          setErrorLog(convertedMessage.data.errorLog);
        }
        if (convertedMessage.data.hostUrl) {
          setHostUrl(convertedMessage.data.hostUrl);
        }
      }
      setIsPageLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostUrl, logs, showLogs]);
  return (
    <div className="flex h-screen">
      {isPageLoading ? (
        <h2>Loading...</h2>
      ) : (
        <div className="flex-1 rounded-[20px] px-10 py-4 mx-4 shadow-2xl col-span-7">
          <div
            className={`grid grid-cols-3 pb-2 ${
              isOperationLoading ? 'cursor-progress' : ''
            }`}
          >
            <Link
              to={isOperationLoading ? '#' : '/'}
              className={`text-left ml-4 ${
                isOperationLoading ? 'cursor-progress' : ''
              }`}
            >
              &larr; Back to Installer
            </Link>
            <h1 className="text-2xl font-bold mb-4">Launcher Page</h1>
          </div>
          <div className="">
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={useOpenface}
                  disabled={
                    !!(isOperationLoading || isProjectLive || !openfaceStatus)
                  }
                  onChange={() => {
                    setUseOpenFace(!useOpenface);
                  }}
                />
                <span className="ml-2">Enable OpenFace</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={useOpenAi}
                  disabled={
                    !!(isOperationLoading || isProjectLive || !chatgptStatus)
                  }
                  onChange={() => {
                    setUseOpenAi(!useOpenAi);
                  }}
                />
                <span className="ml-2">Enable ChatGPT</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={useNgrok}
                  disabled={
                    !!(isOperationLoading || isProjectLive || !ngrokStatus)
                  }
                  onChange={() => {
                    setUseNgrok(!useNgrok);
                  }}
                />
                <span className="ml-2">Enable ngrok</span>
              </label>
            </div>
            {showLogs ? (
              <OutputLog
                onChangeButton={setShowLogs}
                logs={logs}
                setLogs={setLogs}
                rows={8}
                name="launcher"
              />
            ) : (
              <>
                <a
                  className="italic underline underline-offset-2 hover:cursor-pointer   text-gray-950"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowLogs(true);
                  }}
                >
                  Expand for additional application logs.
                </a>
                <br className="mt-1" />
              </>
            )}
            {!isProjectLive ? (
              <>
                <button
                  className={
                    'mt-1 px-12 py-3 max-h-12 max-w-18 max-w-18 bg-blue-500 text-white font-bold  rounded-full border hover:bg-blue-700 ' +
                    (isOperationLoading ? 'cursor-progress' : '')
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    sendLaunchCommand();
                  }}
                  disabled={!!isOperationLoading}
                >
                  Launch
                </button>
                {errorLog ? (
                  <p className="mt-2">
                    <b>
                      Error occured while launching the application. <br />
                      Please download the project and install the dependencies
                      again. Error code is: {errorLog}
                    </b>
                  </p>
                ) : (
                  <></>
                )}
                {isOperationLoading ? (
                  <p>Launching the application may take some time.</p>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <>
                {hostUrl ? (
                  <p className="my-1">
                    Project URL is
                    <a href={hostUrl} target="_blank" rel="noreferrer">
                      <em>
                        <b> {hostUrl}</b>
                      </em>
                    </a>
                  </p>
                ) : (
                  <></>
                )}
                <br className="mt-1" />
                <button
                  type="button"
                  className={
                    'px-12 py-3 max-h-12 max-w-18 bg-red-500 text-white font-bold  rounded-full border hover:bg-red-700 ' +
                    (isOperationLoading ? 'cursor-progress' : '')
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    sendTerminateCommand();
                  }}
                  disabled={!!isOperationLoading}
                >
                  Terminate
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
