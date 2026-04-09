export const contractSignQueryKey = (token: string | null) =>
  ['agent-contract-sign', token] as const;
