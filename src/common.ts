import { isUndefined } from "lodash";

type Listen = (progress: Progress) => void;

type Progress = {
  bytes: {
    received: number;
    total: number;
  };
  chunks: number[];
};

type OutputValue = string | Buffer | Uint8Array;

type Output = OutputValue[];

const isBrowser = isUndefined(typeof window);

export { isBrowser, Listen, Progress, OutputValue, Output };
