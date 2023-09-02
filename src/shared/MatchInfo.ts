export default interface MatchInfo {
  year: number;
  event: string;
  matchType: MatchType;
  matchNumber: number;
}

export enum MatchType {
  Practice = 1,
  Qualification = 2,
  Elimination = 3
}

// Playoff mapping are based on these files from TBA
// - https://github.com/the-blue-alliance/the-blue-alliance/blob/py3/src/backend/common/consts/playoffType.py
// - https://github.com/the-blue-alliance/the-blue-alliance/blob/py3/src/backend/common/helpers/playoffType_helper.py

// The MIT License (MIT)

// Copyright (c) 2020 The Blue Alliance

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

export enum PlayoffType {
  // Standard Brackets
  BRACKET_16_TEAM = 1,
  BRACKET_8_TEAM = 0,
  BRACKET_4_TEAM = 2,
  BRACKET_2_TEAM = 9,

  // 2015 is special
  AVG_SCORE_8_TEAM = 3,

  // Round Robin
  ROUND_ROBIN_6_TEAM = 4,

  // Double Elimination Bracket
  // The legacy style is just a basic internet bracket
  // https://www.printyourbrackets.com/fillable-brackets/8-seeded-double-fillable.pdf
  LEGACY_DOUBLE_ELIM_8_TEAM = 5,
  // The "regular" style is the one that FIRST plans to trial for the 2023 season
  // https://www.firstinspires.org/robotics/frc/blog/2022-timeout-and-playoff-tournament-updates
  DOUBLE_ELIM_8_TEAM = 10,
  // The bracket used for districts with four divisions
  DOUBLE_ELIM_4_TEAM = 11,

  //Festival of Champions
  BO5_FINALS = 6,
  BO3_FINALS = 7,

  // Custom
  CUSTOM = 8
}

enum CompLevel {
  EF = "ef",
  QF = "qf",
  SF = "sf",
  F = "f"
}

export function getElimMatchString(playoffType: PlayoffType, matchNumber: number): string {
  let compLevel = getElimCompLevel(playoffType, matchNumber);
  let matchNumbers = getElimMatchNumbers(playoffType, compLevel, matchNumber);
  return compLevel + matchNumbers[0].toString() + "m" + matchNumbers[1].toString();
}

function getElimCompLevel(playoffType: PlayoffType, matchNumber: number): CompLevel {
  if (playoffType == PlayoffType.AVG_SCORE_8_TEAM) {
    if (matchNumber <= 8) {
      return CompLevel.QF;
    } else if (matchNumber <= 14) {
      return CompLevel.SF;
    } else {
      return CompLevel.F;
    }
  } else if (playoffType == PlayoffType.ROUND_ROBIN_6_TEAM) {
    // Einstein 2017 for example. 15 round robin matches, then finals
    return matchNumber <= 15 ? CompLevel.SF : CompLevel.F;
  } else if (playoffType == PlayoffType.DOUBLE_ELIM_8_TEAM) {
    return DOUBLE_ELIM_MAPPING[matchNumber][0];
  } else if (playoffType == PlayoffType.DOUBLE_ELIM_4_TEAM) {
    return DOUBLE_ELIM_4_MAPPING[matchNumber][0];
  } else if (playoffType == PlayoffType.LEGACY_DOUBLE_ELIM_8_TEAM) {
    return LEGACY_DOUBLE_ELIM_MAPPING[matchNumber][0];
  } else if (playoffType == PlayoffType.BO3_FINALS || playoffType == PlayoffType.BO5_FINALS) {
    return CompLevel.F;
  } else {
    if (playoffType == PlayoffType.BRACKET_16_TEAM) {
      return getElimCompLevelOcto(matchNumber);
    } else if (playoffType == PlayoffType.BRACKET_4_TEAM && matchNumber <= 12) {
      // Account for a 4 team bracket where numbering starts at 1
      matchNumber += 12;
    } else if (playoffType == PlayoffType.BRACKET_2_TEAM && matchNumber <= 18) {
      // Account for a 2 team bracket where numbering starts at 1
      matchNumber += 18;
    }

    if (matchNumber <= 12) {
      return CompLevel.QF;
    } else if (matchNumber <= 18) {
      return CompLevel.SF;
    } else {
      return CompLevel.F;
    }
  }
}

function getElimCompLevelOcto(matchNumber: number): CompLevel {
  // No 2015 support
  if (matchNumber <= 24) {
    return CompLevel.EF;
  } else if (matchNumber <= 36) {
    return CompLevel.QF;
  } else if (matchNumber <= 42) {
    return CompLevel.SF;
  } else {
    return CompLevel.F;
  }
}

function getElimMatchNumbers(playoffType: PlayoffType, compLevel: CompLevel, matchNumber: number): [number, number] {
  if (playoffType == PlayoffType.AVG_SCORE_8_TEAM) {
    if (compLevel == CompLevel.SF) {
      return [1, matchNumber - 8];
    } else if (compLevel == CompLevel.F) {
      return [1, matchNumber - 14];
    } else {
      // qf
      return [1, matchNumber];
    }
  }
  if (playoffType == PlayoffType.ROUND_ROBIN_6_TEAM) {
    // Einstein 2017 for example. 15 round robin matches from sf1 - 1 to sf1 - 15, then finals
    matchNumber = matchNumber <= 15 ? matchNumber : matchNumber - 15;
    if (compLevel == CompLevel.F) {
      return [1, matchNumber];
    } else {
      return [1, matchNumber];
    }
  } else if (playoffType == PlayoffType.DOUBLE_ELIM_8_TEAM) {
    return DOUBLE_ELIM_MAPPING[matchNumber].slice(1) as [number, number];
  } else if (playoffType == PlayoffType.DOUBLE_ELIM_4_TEAM) {
    return DOUBLE_ELIM_4_MAPPING[matchNumber].slice(1) as [number, number];
  } else if (playoffType == PlayoffType.LEGACY_DOUBLE_ELIM_8_TEAM) {
    return LEGACY_DOUBLE_ELIM_MAPPING[matchNumber].slice(1) as [number, number];
  } else if (playoffType == PlayoffType.BO3_FINALS || playoffType == PlayoffType.BO5_FINALS) {
    return [1, matchNumber];
  } else {
    if (playoffType == PlayoffType.BRACKET_4_TEAM && matchNumber <= 12) {
      matchNumber += 12;
    } else if (playoffType == PlayoffType.BRACKET_2_TEAM && matchNumber <= 18) {
      matchNumber += 18;
    }

    return playoffType == PlayoffType.BRACKET_16_TEAM
      ? BRACKET_OCTO_ELIM_MAPPING[matchNumber]
      : BRACKET_ELIM_MAPPING[matchNumber];
  }
}

const BRACKET_ELIM_MAPPING: { [key: number]: [number, number] } = {
  1: [1, 1], // (set, match)
  2: [2, 1],
  3: [3, 1],
  4: [4, 1],
  5: [1, 2],
  6: [2, 2],
  7: [3, 2],
  8: [4, 2],
  9: [1, 3],
  10: [2, 3],
  11: [3, 3],
  12: [4, 3],
  13: [1, 1],
  14: [2, 1],
  15: [1, 2],
  16: [2, 2],
  17: [1, 3],
  18: [2, 3],
  19: [1, 1],
  20: [1, 2],
  21: [1, 3],
  22: [1, 4],
  23: [1, 5],
  24: [1, 6]
};

const BRACKET_OCTO_ELIM_MAPPING: { [key: number]: [number, number] } = {
  // octofinals
  1: [1, 1], // (set, match)
  2: [2, 1],
  3: [3, 1],
  4: [4, 1],
  5: [5, 1],
  6: [6, 1],
  7: [7, 1],
  8: [8, 1],
  9: [1, 2],
  10: [2, 2],
  11: [3, 2],
  12: [4, 2],
  13: [5, 2],
  14: [6, 2],
  15: [7, 2],
  16: [8, 2],
  17: [1, 3],
  18: [2, 3],
  19: [3, 3],
  20: [4, 3],
  21: [5, 3],
  22: [6, 3],
  23: [7, 3],
  24: [8, 3],
  // quarterfinals
  25: [1, 1],
  26: [2, 1],
  27: [3, 1],
  28: [4, 1],
  29: [1, 2],
  30: [2, 2],
  31: [3, 2],
  32: [4, 2],
  33: [1, 3],
  34: [2, 3],
  35: [3, 3],
  36: [4, 3],
  // semifinals
  37: [1, 1],
  38: [2, 1],
  39: [1, 2],
  40: [2, 2],
  41: [1, 3],
  42: [2, 3],
  // finals
  43: [1, 1],
  44: [1, 2],
  45: [1, 3],
  46: [1, 4],
  47: [1, 5],
  48: [1, 6]
};

const LEGACY_DOUBLE_ELIM_MAPPING: { [key: number]: [CompLevel, number, number] } = {
  // octofinals (winners bracket)
  1: [CompLevel.EF, 1, 1],
  2: [CompLevel.EF, 2, 1],
  3: [CompLevel.EF, 3, 1],
  4: [CompLevel.EF, 4, 1],
  // octofinals (losers bracket)
  5: [CompLevel.EF, 5, 1],
  6: [CompLevel.EF, 6, 1],
  // quarterfinals (winners bracket)
  7: [CompLevel.QF, 1, 1],
  8: [CompLevel.QF, 2, 1],
  // quarterfinals (losers bracket)
  9: [CompLevel.QF, 3, 1],
  10: [CompLevel.QF, 4, 1],
  // semifinals (winners bracket)
  11: [CompLevel.SF, 1, 1],
  // semifinals (losers bracket)
  12: [CompLevel.SF, 2, 1],
  // finals (losers bracket)
  13: [CompLevel.F, 1, 1],
  // overall finals (winners bracket)
  14: [CompLevel.F, 2, 1],
  15: [CompLevel.F, 2, 2]
};

const DOUBLE_ELIM_MAPPING: { [key: number]: [CompLevel, number, number] } = {
  // round 1
  1: [CompLevel.SF, 1, 1],
  2: [CompLevel.SF, 2, 1],
  3: [CompLevel.SF, 3, 1],
  4: [CompLevel.SF, 4, 1],
  // round 2
  5: [CompLevel.SF, 5, 1],
  6: [CompLevel.SF, 6, 1],
  7: [CompLevel.SF, 7, 1],
  8: [CompLevel.SF, 8, 1],
  // round 3
  9: [CompLevel.SF, 9, 1],
  10: [CompLevel.SF, 10, 1],
  // round 4
  11: [CompLevel.SF, 11, 1],
  12: [CompLevel.SF, 12, 1],
  // round 5
  13: [CompLevel.SF, 13, 1],
  // finals
  14: [CompLevel.F, 1, 1],
  15: [CompLevel.F, 1, 2],
  16: [CompLevel.F, 1, 3],
  17: [CompLevel.F, 1, 4], // Overtime 1
  18: [CompLevel.F, 1, 5], // Overtime 2
  19: [CompLevel.F, 1, 6] // Overtime 3
};

const DOUBLE_ELIM_4_MAPPING: { [key: number]: [CompLevel, number, number] } = {
  // round 1
  1: [CompLevel.SF, 1, 1],
  2: [CompLevel.SF, 2, 1],
  // round 2
  3: [CompLevel.SF, 3, 1],
  4: [CompLevel.SF, 4, 1],
  // round 3
  5: [CompLevel.SF, 5, 1],
  // finals
  6: [CompLevel.F, 1, 1],
  7: [CompLevel.F, 1, 2],
  8: [CompLevel.F, 1, 3],
  9: [CompLevel.F, 1, 4], // Overtime 1
  10: [CompLevel.F, 1, 5], // Overtime 2
  11: [CompLevel.F, 1, 6] // Overtime 3
};
