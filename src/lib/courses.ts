export interface Course {
  id: string;
  name: string;
  eco: string;
  color: 'white' | 'black';
  lines: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  popularity: number;
  moves: string;
}

export const courses: Course[] = [
  {
    id: 'italian-game',
    name: 'The Italian Game',
    eco: 'C50',
    color: 'white',
    lines: 40,
    difficulty: 'beginner',
    description: "Attack like it's 1560. The OG opening that's been crushing patzers for 500 years.",
    popularity: 89,
    moves: '1.e4 e5 2.Nf3 Nc6 3.Bc4',
  },
  {
    id: 'sicilian-dragon',
    name: 'Sicilian Dragon',
    eco: 'B70',
    color: 'black',
    lines: 40,
    difficulty: 'advanced',
    description: "Breathe fire. Sacrifice pawns. Make your opponent regret 1.e4.",
    popularity: 72,
    moves: '1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 g6',
  },
  {
    id: 'london-system',
    name: 'London System',
    eco: 'D02',
    color: 'white',
    lines: 40,
    difficulty: 'beginner',
    description: "Boring? Maybe. Reliable? Absolutely. Zero theory, maximum suffering for Black.",
    popularity: 94,
    moves: '1.d4 d5 2.Bf4',
  },
  {
    id: 'caro-kann',
    name: 'Caro-Kann Defense',
    eco: 'B10',
    color: 'black',
    lines: 40,
    difficulty: 'intermediate',
    description: "Solid as a rock. Played by Karpov. Your opponents will cry into their coffee.",
    popularity: 81,
    moves: '1.e4 c6',
  },
  {
    id: 'kings-indian',
    name: "King's Indian Defense",
    eco: 'E60',
    color: 'black',
    lines: 40,
    difficulty: 'advanced',
    description: "Let them think they're winning. Then unleash Kingside armageddon.",
    popularity: 68,
    moves: '1.d4 Nf6 2.c4 g6',
  },
  {
    id: 'queens-gambit',
    name: "Queen's Gambit",
    eco: 'D06',
    color: 'white',
    lines: 40,
    difficulty: 'intermediate',
    description: "The Netflix special. Offer that pawn. They'll never take it anyway.",
    popularity: 88,
    moves: '1.d4 d5 2.c4',
  },
  {
    id: 'french-defense',
    name: 'French Defense',
    eco: 'C00',
    color: 'black',
    lines: 40,
    difficulty: 'intermediate',
    description: "Build a pawn fortress. Laugh at their e5 pawn. Très magnifique.",
    popularity: 75,
    moves: '1.e4 e6',
  },
  {
    id: 'ruy-lopez',
    name: 'Ruy Lopez',
    eco: 'C60',
    color: 'white',
    lines: 40,
    difficulty: 'intermediate',
    description: "500 years of torture. Pin that knight. Collect your rating points.",
    popularity: 85,
    moves: '1.e4 e5 2.Nf3 Nc6 3.Bb5',
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian Defense',
    eco: 'B01',
    color: 'black',
    lines: 40,
    difficulty: 'beginner',
    description: "Take that pawn. Retreat the queen. Confuse literally everyone.",
    popularity: 63,
    moves: '1.e4 d5',
  },
  {
    id: 'grunfeld',
    name: 'Grünfeld Defense',
    eco: 'D80',
    color: 'black',
    lines: 40,
    difficulty: 'advanced',
    description: "Give them the center. Then blow it up. Controlled chaos.",
    popularity: 58,
    moves: '1.d4 Nf6 2.c4 g6 3.Nc3 d5',
  },
  {
    id: 'vienna-game',
    name: 'Vienna Game',
    eco: 'C25',
    color: 'white',
    lines: 40,
    difficulty: 'beginner',
    description: "Italian Game's cooler cousin. Same vibes, different bishop.",
    popularity: 52,
    moves: '1.e4 e5 2.Nc3',
  },
  {
    id: 'dutch-defense',
    name: 'Dutch Defense',
    eco: 'A80',
    color: 'black',
    lines: 40,
    difficulty: 'intermediate',
    description: "f5 on move 1. Aggressive. Slightly unhinged. Your opponents hate it.",
    popularity: 45,
    moves: '1.d4 f5',
  },
];

export const getDifficultyColor = (difficulty: Course['difficulty']) => {
  switch (difficulty) {
    case 'beginner':
      return 'text-primary';
    case 'intermediate':
      return 'text-accent';
    case 'advanced':
      return 'text-destructive';
  }
};

export const getDifficultyLabel = (difficulty: Course['difficulty']) => {
  switch (difficulty) {
    case 'beginner':
      return 'Beginner';
    case 'intermediate':
      return 'Intermediate';
    case 'advanced':
      return 'Advanced';
  }
};
