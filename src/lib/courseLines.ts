// Training lines for each course, derived from real game data

export interface TrainingLine {
  name: string;
  moves: string[];
}

export const courseLines: Record<string, TrainingLine[]> = {
  'italian-game': [
    { name: 'Italian Game: Giuoco Piano', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4', 'exd4', 'cxd4', 'Bb4+', 'Bd2', 'Bxd2+', 'Nbxd2'] },
    { name: 'Italian Game: Evans Gambit Accepted', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4', 'c3', 'Ba5', 'd4', 'exd4', 'O-O', 'd6', 'cxd4', 'Bb6'] },
    { name: 'Italian Game: Two Knights Fried Liver', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Nxd5', 'Nxf7', 'Kxf7', 'Qf3+', 'Ke6', 'Nc3'] },
    { name: 'Italian Game: Giuoco Pianissimo', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'd3', 'Nf6', 'c3', 'd6', 'O-O', 'O-O', 'Nbd2', 'a6', 'Bb3', 'Ba7', 'Re1'] },
    { name: 'Italian Game: Hungarian Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Be7', 'd4', 'd6', 'dxe5', 'dxe5', 'Qxd8+', 'Bxd8', 'Nc3', 'Nf6', 'Bg5'] },
    { name: 'Italian Game: Classical Main Line', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4', 'exd4', 'cxd4', 'Bb4+', 'Nc3', 'Nxe4', 'O-O', 'Bxc3', 'bxc3'] },
  ],
  'sicilian-dragon': [
    { name: 'Sicilian Dragon: Yugoslav Attack 9.Bc4', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'f3', 'O-O', 'Qd2', 'Nc6', 'Bc4', 'Bd7', 'O-O-O', 'Rc8', 'Bb3'] },
    { name: 'Sicilian Dragon: Yugoslav Attack 9.O-O-O', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'f3', 'O-O', 'Qd2', 'Nc6', 'O-O-O', 'd5', 'exd5', 'Nxd5', 'Nxc6', 'bxc6'] },
    { name: 'Sicilian Dragon: Classical Variation', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be2', 'Bg7', 'O-O', 'O-O', 'Be3', 'Nc6', 'Nb3', 'Be6', 'f4'] },
    { name: 'Sicilian Dragon: Levenfish Attack', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'f4', 'Nc6', 'Nxc6', 'bxc6', 'e5', 'Nd7', 'exd6', 'exd6'] },
    { name: 'Sicilian Accelerated Dragon: Maróczy Bind', moves: ['e4', 'c5', 'Nf3', 'Nc6', 'd4', 'cxd4', 'Nxd4', 'g6', 'c4', 'Bg7', 'Be3', 'Nf6', 'Nc3', 'O-O', 'Be2', 'd6', 'O-O', 'Bd7'] },
    { name: 'Sicilian Dragon: Chinese Variation', moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6', 'Be3', 'Bg7', 'f3', 'O-O', 'Qd2', 'Nc6', 'Bc4', 'Bd7', 'h4', 'Rc8', 'Bb3', 'h5'] },
  ],
  'london-system': [
    { name: 'London System: Main Line', moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'c5', 'c3', 'Nc6', 'Nd2', 'e6', 'Ngf3', 'Bd6', 'Bg3', 'O-O', 'Bd3'] },
    { name: 'London System vs King\'s Indian', moves: ['d4', 'Nf6', 'Bf4', 'g6', 'e3', 'Bg7', 'Nf3', 'd6', 'Be2', 'O-O', 'O-O', 'Nbd7', 'h3', 'Qe8', 'Bh2', 'e5'] },
    { name: 'London System: Accelerated', moves: ['d4', 'd5', 'Bf4', 'c5', 'e3', 'Nc6', 'c3', 'Nf6', 'Nd2', 'e6', 'Ngf3', 'Bd6', 'Bg3', 'O-O', 'Bd3', 'b6'] },
    { name: 'London System: Anti-Grünfeld', moves: ['d4', 'Nf6', 'Bf4', 'g6', 'Nc3', 'd5', 'e3', 'Bg7', 'h4', 'O-O', 'Be2', 'c5', 'dxc5', 'Qa5', 'O-O'] },
    { name: 'London System vs Dutch', moves: ['d4', 'f5', 'Bf4', 'Nf6', 'e3', 'e6', 'Nf3', 'd6', 'Bd3', 'Be7', 'O-O', 'O-O', 'c4', 'Qe8', 'Nc3'] },
    { name: 'Jobava London', moves: ['d4', 'd5', 'Bf4', 'Nf6', 'Nc3', 'e6', 'e3', 'c5', 'Nb5', 'Na6', 'c3', 'Bd6', 'Bxd6', 'Qxd6', 'dxc5', 'Nxc5'] },
  ],
  'caro-kann': [
    { name: 'Caro-Kann: Advance Short Variation', moves: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'Nf3', 'e6', 'Be2', 'c5', 'Be3', 'cxd4', 'Nxd4', 'Ne7', 'O-O', 'Nbc6'] },
    { name: 'Caro-Kann: Classical Main Line', moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5', 'Ng3', 'Bg6', 'h4', 'h6', 'Nf3', 'Nd7', 'h5', 'Bh7', 'Bd3', 'Bxd3', 'Qxd3'] },
    { name: 'Caro-Kann: Tartakower Variation', moves: ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nf6', 'Nxf6+', 'exf6', 'c3', 'Bd6', 'Bd3', 'O-O', 'Qc2', 'Re8+', 'Ne2'] },
    { name: 'Caro-Kann: Panov-Botvinnik Attack', moves: ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'c4', 'Nf6', 'Nc3', 'e6', 'Nf3', 'Bb4', 'cxd5', 'Nxd5', 'Bd2', 'Nc6', 'Bd3'] },
    { name: 'Caro-Kann: Advance Bayonet Attack', moves: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'g4', 'Bd7', 'c4', 'e6', 'Nc3', 'c5', 'cxd5', 'exd5', 'Nxd5'] },
    { name: 'Caro-Kann: Two Knights Variation', moves: ['e4', 'c6', 'Nf3', 'd5', 'Nc3', 'Bg4', 'h3', 'Bxf3', 'Qxf3', 'e6', 'd4', 'Nf6', 'Bd3', 'dxe4', 'Nxe4'] },
  ],
  'kings-indian': [
    { name: 'King\'s Indian: Classical Main Line', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'd5', 'Nbd7', 'O-O', 'Nc5', 'Qc2', 'a5'] },
    { name: 'King\'s Indian: Sämisch Panno', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f3', 'O-O', 'Be3', 'Nc6', 'Nge2', 'a6', 'Qd2', 'Rb8', 'h4', 'h5'] },
    { name: 'King\'s Indian: Four Pawns Attack', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'f4', 'O-O', 'Nf3', 'c5', 'd5', 'e6', 'Be2', 'exd5', 'cxd5', 'Bg4'] },
    { name: 'King\'s Indian: Petrosian System', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'd5', 'a5', 'Bg5', 'h6', 'Bh4', 'Na6'] },
    { name: 'King\'s Indian: Fianchetto Classical', moves: ['d4', 'Nf6', 'c4', 'g6', 'g3', 'Bg7', 'Bg2', 'd6', 'Nf3', 'O-O', 'O-O', 'Nbd7', 'Nc3', 'e5', 'e4', 'c6', 'h3', 'Qb6'] },
    { name: 'King\'s Indian: Mar del Plata', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7', 'Ne1', 'Nd7', 'f3', 'f5'] },
  ],
  'queens-gambit': [
    { name: 'Queen\'s Gambit Declined: Orthodox', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'Nbd7', 'Rc1', 'c6', 'Bd3', 'dxc4', 'Bxc4', 'Nd5'] },
    { name: 'Queen\'s Gambit Accepted: Main Line', moves: ['d4', 'd5', 'c4', 'dxc4', 'e4', 'e5', 'Nf3', 'exd4', 'Bxc4', 'Nc6', 'O-O', 'Be6', 'Bxe6', 'fxe6', 'Qb3', 'Qd7'] },
    { name: 'Slav Defense: Main Line', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'dxc4', 'a4', 'Bf5', 'e3', 'e6', 'Bxc4', 'Bb4', 'O-O', 'O-O', 'Qe2'] },
    { name: 'Semi-Slav: Meran Variation', moves: ['d4', 'd5', 'c4', 'c6', 'Nf3', 'Nf6', 'Nc3', 'e6', 'e3', 'Nbd7', 'Bd3', 'dxc4', 'Bxc4', 'b5', 'Bd3', 'Bb7', 'O-O', 'a6'] },
    { name: 'Tarrasch Defense: Main Line', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'c5', 'cxd5', 'exd5', 'Nf3', 'Nc6', 'g3', 'Nf6', 'Bg2', 'Be7', 'O-O', 'O-O', 'Bg5', 'cxd4', 'Nxd4'] },
    { name: 'Queen\'s Gambit: Exchange Variation', moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'cxd5', 'exd5', 'Bg5', 'Be7', 'e3', 'O-O', 'Bd3', 'Nbd7', 'Qc2', 'Re8', 'Nge2', 'Nf8'] },
  ],
  'french-defense': [
    { name: 'French: Advance Milner-Barry', moves: ['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3', 'Nc6', 'Nf3', 'Qb6', 'Bd3', 'cxd4', 'cxd4', 'Bd7', 'O-O', 'Nxd4', 'Nxd4', 'Qxd4', 'Nc3'] },
    { name: 'French: Winawer Poisoned Pawn', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Bb4', 'e5', 'c5', 'a3', 'Bxc3+', 'bxc3', 'Ne7', 'Qg4', 'Qc7', 'Qxg7', 'Rg8', 'Qxh7', 'cxd4'] },
    { name: 'French: Classical Steinitz', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'Nf6', 'e5', 'Nfd7', 'f4', 'c5', 'Nf3', 'Nc6', 'Be3', 'cxd4', 'Nxd4', 'Bc5', 'Qd2', 'O-O'] },
    { name: 'French: Tarrasch Open', moves: ['e4', 'e6', 'd4', 'd5', 'Nd2', 'c5', 'exd5', 'exd5', 'Ngf3', 'Nc6', 'Bb5', 'Bd6', 'dxc5', 'Bxc5', 'O-O', 'Nge7', 'Nb3', 'Bd6'] },
    { name: 'French: Rubinstein Variation', moves: ['e4', 'e6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nd7', 'Nf3', 'Ngf6', 'Nxf6+', 'Nxf6', 'Bd3', 'c5', 'dxc5', 'Bxc5', 'O-O', 'O-O'] },
    { name: 'French: Exchange Variation', moves: ['e4', 'e6', 'd4', 'd5', 'exd5', 'exd5', 'Nf3', 'Nf6', 'Bd3', 'Bd6', 'O-O', 'O-O', 'Bg5', 'Bg4', 'Nbd2', 'Nbd7', 'c3', 'c6'] },
  ],
  'ruy-lopez': [
    { name: 'Ruy Lopez: Closed Defense', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Na5', 'Bc2', 'c5', 'd4'] },
    { name: 'Ruy Lopez: Berlin Wall', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6', 'O-O', 'Nxe4', 'd4', 'Nd6', 'Bxc6', 'dxc6', 'dxe5', 'Nf5', 'Qxd8+', 'Kxd8', 'Nc3', 'Ke8', 'h3', 'Be7'] },
    { name: 'Ruy Lopez: Marshall Attack', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'O-O', 'c3', 'd5', 'exd5', 'Nxd5', 'd4', 'exd4', 'cxd4', 'Bb7'] },
    { name: 'Ruy Lopez: Exchange Variation', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Bxc6', 'dxc6', 'O-O', 'Bg4', 'h3', 'h5', 'd3', 'Qf6', 'Be3', 'Bxf3', 'Qxf3', 'Qxf3', 'gxf3'] },
    { name: 'Ruy Lopez: Breyer Variation', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Nb8', 'd4', 'Nbd7'] },
    { name: 'Ruy Lopez: Open Variation', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Nxe4', 'd4', 'b5', 'Bb3', 'd5', 'dxe5', 'Be6', 'c3', 'Bc5', 'Nbd2', 'O-O'] },
  ],
  'scandinavian': [
    { name: 'Scandinavian: Main Line Qa5', moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'd4', 'Nf6', 'Nf3', 'Bf5', 'Bc4', 'e6', 'Bd2', 'c6', 'Nd5', 'Qd8', 'Nxf6+', 'Qxf6'] },
    { name: 'Scandinavian: Modern Nf6', moves: ['e4', 'd5', 'exd5', 'Nf6', 'd4', 'Nxd5', 'Nf3', 'g6', 'c4', 'Nb6', 'Nc3', 'Bg7', 'Be3', 'O-O', 'Be2', 'Nc6', 'O-O', 'Bg4'] },
    { name: 'Scandinavian: Icelandic Gambit', moves: ['e4', 'd5', 'exd5', 'Nf6', 'c4', 'e6', 'dxe6', 'Bxe6', 'd4', 'Bb4+', 'Nc3', 'Ne4', 'Qd3', 'Qh4', 'g3', 'Nxc3'] },
    { name: 'Scandinavian: Portuguese Gambit', moves: ['e4', 'd5', 'exd5', 'Nf6', 'd4', 'Bg4', 'f3', 'Bf5', 'c4', 'e6', 'dxe6', 'Nc6', 'Be3', 'Qe7', 'exf7+', 'Kxf7'] },
    { name: 'Scandinavian: Gubinsky-Melts', moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qd6', 'd4', 'Nf6', 'Nf3', 'a6', 'Be2', 'Nc6', 'O-O', 'Bf5', 'Be3', 'e6', 'a3', 'Be7'] },
    { name: 'Scandinavian: Kádas Gambit', moves: ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3', 'Qa5', 'b4', 'Qxb4', 'Rb1', 'Qd6', 'd4', 'Nf6', 'g3', 'Nc6', 'Bg2', 'Bf5', 'Nge2'] },
  ],
  'grunfeld': [
    { name: 'Grünfeld: Exchange Main Line', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'cxd5', 'Nxd5', 'e4', 'Nxc3', 'bxc3', 'Bg7', 'Nf3', 'c5', 'Be3', 'Qa5', 'Qd2', 'O-O', 'Rc1', 'cxd4', 'cxd4', 'Qxd2+', 'Kxd2'] },
    { name: 'Grünfeld: Russian System', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'Nf3', 'Bg7', 'Qb3', 'dxc4', 'Qxc4', 'O-O', 'e4', 'a6', 'e5', 'b5', 'Qb3', 'Nfd7', 'e6', 'fxe6'] },
    { name: 'Grünfeld: Fianchetto Variation', moves: ['d4', 'Nf6', 'c4', 'g6', 'g3', 'd5', 'Bg2', 'Bg7', 'Nf3', 'O-O', 'O-O', 'dxc4', 'Na3', 'c3', 'bxc3', 'c5', 'e3', 'Nc6', 'Qe2'] },
    { name: 'Grünfeld: Classical Exchange', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'cxd5', 'Nxd5', 'e4', 'Nxc3', 'bxc3', 'Bg7', 'Bc4', 'c5', 'Ne2', 'O-O', 'O-O', 'Nc6', 'Be3', 'Qc7'] },
    { name: 'Grünfeld: Seville Variation', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'cxd5', 'Nxd5', 'e4', 'Nxc3', 'bxc3', 'Bg7', 'Nf3', 'c5', 'Rb1', 'O-O', 'Be2', 'cxd4', 'cxd4', 'Qa5+', 'Bd2', 'Qxa2'] },
    { name: 'Grünfeld: Three Knights', moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5', 'Nf3', 'Bg7', 'Bf4', 'O-O', 'e3', 'c5', 'dxc5', 'Qa5', 'Rc1', 'dxc4', 'Bxc4', 'Qxc5'] },
  ],
  'vienna-game': [
    { name: 'Vienna Game: Stanley Variation', moves: ['e4', 'e5', 'Nc3', 'Nf6', 'f4', 'd5', 'fxe5', 'Nxe4', 'Nf3', 'Bg4', 'Qe2', 'Nc5', 'd4', 'Bxf3', 'Qxf3', 'Qh4+', 'g3', 'Qe7'] },
    { name: 'Vienna Game: Copycat Main', moves: ['e4', 'e5', 'Nc3', 'Nc6', 'Bc4', 'Bc5', 'd3', 'Nf6', 'f4', 'd6', 'Nf3', 'Bg4', 'Na4', 'Bb6', 'Nxb6', 'axb6', 'c3'] },
    { name: 'Vienna Gambit: Main Line', moves: ['e4', 'e5', 'Nc3', 'Nf6', 'f4', 'exf4', 'e5', 'Qe7', 'Qe2', 'Ng8', 'Nf3', 'd6', 'd4', 'Bg4', 'Qxf4', 'Bxf3', 'gxf3'] },
    { name: 'Vienna Game: Max Lange Defense', moves: ['e4', 'e5', 'Nc3', 'Nc6', 'Bc4', 'Nf6', 'd3', 'Na5', 'Bb3', 'Nxb3', 'axb3', 'd5', 'exd5', 'Nxd5', 'Qf3', 'Be6', 'Nge2'] },
    { name: 'Vienna Game: Frankenstein-Dracula', moves: ['e4', 'e5', 'Nc3', 'Nf6', 'Bc4', 'Nxe4', 'Qh5', 'Nd6', 'Bb3', 'Nc6', 'Nb5', 'g6', 'Qf3', 'f5', 'Qd5', 'Qe7', 'Nxc7+', 'Kd8', 'Nxa8'] },
    { name: 'Vienna Game: Mieses Variation', moves: ['e4', 'e5', 'Nc3', 'Nf6', 'g3', 'd5', 'exd5', 'Nxd5', 'Bg2', 'Nxc3', 'bxc3', 'Bc5', 'Nf3', 'O-O', 'O-O', 'Nc6', 'd3', 'Re8'] },
  ],
  'dutch-defense': [
    { name: 'Dutch: Classical Stonewall', moves: ['d4', 'f5', 'c4', 'Nf6', 'g3', 'e6', 'Bg2', 'd5', 'Nf3', 'Bd6', 'O-O', 'c6', 'b3', 'Qe7', 'Bb2', 'O-O', 'Qc1', 'b6', 'Ba3'] },
    { name: 'Dutch: Leningrad Main Line', moves: ['d4', 'f5', 'c4', 'Nf6', 'g3', 'g6', 'Bg2', 'Bg7', 'Nf3', 'O-O', 'O-O', 'd6', 'Nc3', 'Qe8', 'd5', 'Na6', 'Rb1', 'Bd7', 'b4', 'c6'] },
    { name: 'Dutch: Classical Ilyin-Zhenevsky', moves: ['d4', 'f5', 'c4', 'Nf6', 'g3', 'e6', 'Bg2', 'Be7', 'Nf3', 'O-O', 'O-O', 'd6', 'Nc3', 'Qe8', 'Qc2', 'Qh5', 'b3', 'Nc6', 'Ba3'] },
    { name: 'Dutch: Hopton Attack', moves: ['d4', 'f5', 'Bg5', 'h6', 'Bh4', 'g5', 'e4', 'Nf6', 'e5', 'gxh4', 'exf6', 'Rg8', 'Qh5+', 'Kd7', 'Qxf5+', 'Kc6'] },
    { name: 'Dutch: Anti-Dutch 2.Bg5', moves: ['d4', 'f5', 'Bg5', 'g6', 'Nc3', 'Bg7', 'e3', 'Nf6', 'h4', 'd6', 'h5', 'Nxh5', 'Rxh5', 'gxh5', 'Qxh5+', 'Kf8'] },
    { name: 'Dutch: Staunton Gambit', moves: ['d4', 'f5', 'e4', 'fxe4', 'Nc3', 'Nf6', 'Bg5', 'c6', 'f3', 'Qa5', 'fxe4', 'Qxg5', 'e5', 'Qxd2+', 'Qxd2'] },
  ],
};

// Get training lines for a course, with fallback
export const getTrainingLines = (courseId: string): TrainingLine[] => {
  return courseLines[courseId] || courseLines['italian-game'];
};
