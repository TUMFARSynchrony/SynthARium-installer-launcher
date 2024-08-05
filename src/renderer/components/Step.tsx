/* eslint-disable no-nested-ternary */
import { IStepProps } from '../interfaces/props';

function Step(props: IStepProps) {
  const { contents, keyName, index, onClick, isOperationLoading } = props;
  return (
    <div
      className={`flex justify-between font-montserrat border-gray-50 px-4 py-2 pr-0 content-center text-black shadow hover:bg-slate-100 ${isOperationLoading} ? 'cursor-not-allowed' : 'cursor-pointer'`}
    >
      <div>
        <button
          type="button"
          onClick={onClick}
          className={
            // eslint-disable-next-line prefer-template
            'w-full text-left ' +
            (isOperationLoading ? 'cursor-not-allowed' : 'cursor-pointer')
          }
          disabled={!!isOperationLoading}
        >
          {index + 1}. {contents[keyName].name}
        </button>
      </div>
      <div className="pr-3 pt-0.5">
        {contents[keyName].status ||
        contents[keyName].name.match(/configure/i) ? (
          <svg
            width="20px"
            height="20px"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 7.5L7 10L11 5M7.5 14.5C3.63401 14.5 0.5 11.366 0.5 7.5C0.5 3.63401 3.63401 0.5 7.5 0.5C11.366 0.5 14.5 3.63401 14.5 7.5C14.5 11.366 11.366 14.5 7.5 14.5Z"
              stroke="#000000"
            />
          </svg>
        ) : (
          <svg
            width="20px"
            height="20px"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.5 4.5L10.5 10.5M4.5 10.5L10.5 4.5M7.5 14.5C3.63401 14.5 0.5 11.366 0.5 7.5C0.5 3.63401 3.63401 0.5 7.5 0.5C11.366 0.5 14.5 3.63401 14.5 7.5C14.5 11.366 11.366 14.5 7.5 14.5Z"
              stroke="#000000"
            />
          </svg>
        )}
      </div>
    </div>
  );
}

export default Step;
