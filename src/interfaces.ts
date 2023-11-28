export interface ActionInputs {
  token: string;
  uploadUrl: string;
  run: string;
  workingDirectory: string | undefined;
  noSudo: boolean;
  noPipInstall: boolean;
  tokenless: boolean;
}

export interface UploadMetadata {
  version?: number;
  tokenless: boolean;
  ref: string;
  headRef?: string;
  baseRef?: string;
  owner: string;
  repository: string;
  commitHash: string;
  event: string;
  profileMd5: string;
  ghData: {
    runId: number;
    job: string;
    sender?: {
      id: number;
      login: string;
    };
  };
  runner: {
    name: string;
    version: string;
  };
}

export interface PostResponse {
  status: string;
  uploadUrl: string;
  runId: string;
}
