// Training lines for each course, derived from real game data

export interface TrainingLine {
  name: string;
  moves: string[];
}

export const courseLines: Record<string, TrainingLine[]> = {
  'italian-game': [
    { name: 'Italian Game: Main Line', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'd6'] },
    { name: 'Italian Game: Evans Gambit', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4'] },
    { name: 'Italian Game: Two Knights Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'd4', 'exd4'] },
    { name: 'Italian Game: Giuoco Piano', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'd3', 'Nf6'] },
  ],
  'sicilian-dragon': [
    { name: 'Sicilian Dragon: Main Line', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6'] },
    { name: 'Sicilian Dragon: Yugoslav Attack', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'f3', 'O-O'] },
    { name: 'Sicilian Dragon: Classical Variation', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be2', 'Bg7'] },
    { name: 'Sicilian Dragon: Accelerated', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'g6'] },
  ],
  'london-system': [
    { name: 'London System: Main Line', moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'c5', 'c3', 'Nc6'] },
    { name: 'London System: Anti-Indian', moves: ['d4', 'Nf6', 'Bf4', 'g6', 'e3', 'Bg7', 'Nf3', 'd6'] },
    { name: 'London System: Jobava Attack', moves: ['d4', 'd5', 'Bf4', 'Nf6', 'Nc3', 'e6', 'e3', 'c5'] },
    { name: 'London System: Accelerated', moves: ['d4', 'd5', 'Bf4', 'c5', 'e3', 'Nc6', 'c3', 'Nf6'] },
  ],
  'caro-kann': [
    { name: 'Caro-Kann: Advance Variation', moves: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'Nf3', 'e6'] },
    { name: 'Caro-Kann: Classical', moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5'] },
    { name: 'Caro-Kann: Exchange Variation', moves: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'Bd3', 'Nc6'] },
    { name: 'Caro-Kann: Fantasy Variation', moves: ['e4', 'c6', 'd4', 'd5', 'f3', 'dxe4', 'fxe4', 'e5'] },
  ],
  'kings-indian': [
    { name: "King's Indian: Classical", moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O'] },
    { name: "King's Indian: Sämisch", moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f3', 'O-O'] },
    { name: "King's Indian: Four Pawns Attack", moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f4', 'O-O'] },
    { name: "King's Indian: Fianchetto", moves: ['d4', 'Nf6', 'c4', 'g6', 'g3', 'Bg7', 'Bg2', 'd6', 'Nf3', 'O-O'] },
  ],
  'queens-gambit': [
    { name: "Queen's Gambit: Accepted", moves: ['d4', 'd5', 'c4', 'dxc4', 'e4', 'e5', 'Nf3', 'exd4'] },
    { name: "Queen's Gambit: Declined", moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7'] },
    { name: "Queen's Gambit: Slav Defense", moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'dxc4'] },
    { name: "Queen's Gambit: Tarrasch", moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'c5', 'cxd5', 'exd5'] },
  ],
  'french-defense': [
    { name: 'French Defense: Advance', moves: ['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3', 'Nc6'] },
    { name: 'French Defense: Exchange', moves: ['e4', 'e6', 'd4', 'd5', 'exd5', 'exd5', 'Nf3', 'Nf6'] },
    { name: 'French Defense: Winawer', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4', 'e5', 'c5'] },
    { name: 'French Defense: Classical', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6', 'Bg5', 'Be7'] },
  ],
  'ruy-lopez': [
    { name: 'Ruy Lopez: Morphy Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6'] },
    { name: 'Ruy Lopez: Berlin Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6', 'O-O', 'Nxe4'] },
    { name: 'Ruy Lopez: Marshall Attack', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'c3', 'd5'] },
    { name: 'Ruy Lopez: Exchange', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6', 'dxc6'] },
  ],
  'scandinavian': [
    { name: 'Scandinavian: Main Line', moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'd4', 'Nf6'] },
    { name: 'Scandinavian: Modern', moves: ['e4', 'd5', 'exd5', 'Nf6', 'd4', 'Nxd5', 'Nf3', 'g6'] },
    { name: 'Scandinavian: Icelandic Gambit', moves: ['e4', 'd5', 'exd5', 'Nf6', 'c4', 'e6', 'dxe6', 'Bxe6'] },
    { name: 'Scandinavian: Portuguese', moves: ['e4', 'd5', 'exd5', 'Nf6', 'd4', 'Bg4', 'Nf3', 'Qxd5'] },
  ],
  'grunfeld': [
    { name: 'Grünfeld: Exchange Variation', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'cxd5', 'Nxd5', 'e4', 'Nxc3', 'bxc3', 'Bg7'] },
    { name: 'Grünfeld: Russian System', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'Nf3', 'Bg7', 'Qb3', 'dxc4', 'Qxc4', 'O-O'] },
    { name: 'Grünfeld: Fianchetto', moves: ['d4', 'Nf6', 'c4', 'g6', 'g3', 'd5', 'Bg2', 'Bg7', 'Nf3', 'O-O'] },
    { name: 'Grünfeld: Classical', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'Bf4', 'Bg7', 'e3', 'O-O'] },
  ],
  'vienna-game': [
    { name: 'Vienna Game: Main Line', moves: ['e4', 'e5', 'Nc3', 'Nf6', 'f4', 'd5', 'fxe5', 'Nxe4'] },
    { name: 'Vienna Game: Copycat', moves: ['e4', 'e5', 'Nc3', 'Nc6', 'Bc4', 'Bc5', 'd3', 'Nf6'] },
    { name: 'Vienna Gambit', moves: ['e4', 'e5', 'Nc3', 'Nf6', 'f4', 'exf4', 'd4', 'd5'] },
    { name: 'Vienna Game: Max Lange Defense', moves: ['e4', 'e5', 'Nc3', 'Nc6', 'Bc4', 'Nf6', 'd3', 'Na5'] },
  ],
  'dutch-defense': [
    { name: 'Dutch Defense: Classical', moves: ['d4', 'f5', 'c4', 'Nf6', 'g3', 'e6', 'Bg2', 'Be7'] },
    { name: 'Dutch Defense: Leningrad', moves: ['d4', 'f5', 'c4', 'Nf6', 'g3', 'g6', 'Bg2', 'Bg7'] },
    { name: 'Dutch Defense: Stonewall', moves: ['d4', 'f5', 'c4', 'e6', 'Nc3', 'd5', 'e3', 'c6'] },
    { name: 'Dutch Defense: Hopton Attack', moves: ['d4', 'f5', 'Bg5', 'h6', 'Bh4', 'g5', 'e4', 'Nf6'] },
  ],
};

// Get training lines for a course, with fallback
export const getTrainingLines = (courseId: string): TrainingLine[] => {
  return courseLines[courseId] || courseLines['italian-game'];
};
