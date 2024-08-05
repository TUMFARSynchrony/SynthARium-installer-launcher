import React from 'react';

export declare interface IContent {
  name: string;
  description: string;
  buttonName: string;
  type: string;
  onClick: (token: string) => void;
  testButtonClick?: () => void;
  prevButtonClick?: () => void;
  nextButtonClick?: () => void;
  status: boolean;
  testResult: boolean;
  msg: string;
  liveLog?: boolean;
}

export declare interface IContents {
  [key: string]: IContent;
}

export declare interface IOutputLogProps {
  onChangeButton: React.Dispatch<React.SetStateAction<boolean>>;
  logs: string;
  setLogs: React.Dispatch<React.SetStateAction<string>>;
  rows: number;
  name: string;
}

export declare interface IStepProps {
  key: string;
  contents: IContents;
  keyName: string;
  index: number;
  onClick: () => void;
  isOperationLoading: boolean;
}

export declare interface IStepsProps {
  contents: IContents;
  setStep: (s: string) => void;
  isOperationLoading: boolean;
}

export declare interface IContentsProps {
  content: IContent;
  isPageLoading: boolean;
  isOperationLoading: boolean;
}

export declare interface IBodyProps {
  contents: IContents;
  step: string;
  setStep: (s: string) => void;
  isPageLoading: boolean;
  isOperationLoading: boolean;
}
