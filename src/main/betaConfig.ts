export const BETA_CONFIG: BetaConfig | null = {
  year: "2025",
  expiration: new Date(2025, 0, 4),
  surveyUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSe7xxOln2NUO6pNrGQAPAJ5W7HH2dcIfcCYYi0etTQQE5ORwg/viewform?usp=pp_url&entry.1466744914=__version__"
};

export type BetaConfig = {
  year: string;
  expiration: Date;
  surveyUrl: string;
};
