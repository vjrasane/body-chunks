type Listen = (progress: Progress) => void;

type Progress = {
  bytes: {
    received: number;
    total: number;
  };
  chunks: number[];
};

const isNil = (value?: any): boolean => value === undefined || value === null;

type OutputValue = string | Buffer | Uint8Array;

type Output = OutputValue[];

type Unsub = () => void;

export { isNil, Listen, Progress, OutputValue, Output, Unsub };
