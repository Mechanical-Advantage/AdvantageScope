export const BETA_CONFIG: BetaConfig | null = null;

export type BetaConfig = {
  year: string;
  expiration: Date;
  surveyUrl: string;
};
