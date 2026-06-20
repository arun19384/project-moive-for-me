export type SagaCategory = 'blockbuster' | 'fantasy' | 'animation' | 'anime' | 'horror' | 'classic'

export type SagaItem = {
  title: string
  year: number
  aliases?: string[]
}

export type SagaDef = {
  id: string
  title: string
  category: SagaCategory
  reward: string
  iconName: string
  from: string
  to: string
  items: SagaItem[]
}

export const CATEGORY_LABEL: Record<SagaCategory, string> = {
  blockbuster: 'Blockbusters',
  fantasy: 'Sci-fi & Fantasy',
  classic: 'Classics',
  animation: 'Animation',
  anime: 'Anime',
  horror: 'Horror',
}

export const CATEGORY_ORDER: SagaCategory[] = [
  'blockbuster', 'fantasy', 'classic', 'animation', 'anime', 'horror',
]

export const SAGAS: SagaDef[] = [
  {
    id: 'star-wars', title: 'Star Wars Skywalker Saga', category: 'fantasy', reward: 'Jedi Master',
    iconName: 'Swords', from: '#1a0d0d', to: '#6b1a1a',
    items: [
      { title: 'The Phantom Menace', year: 1999, aliases: ['Star Wars: Episode I'] },
      { title: 'Attack of the Clones', year: 2002, aliases: ['Star Wars: Episode II'] },
      { title: 'Revenge of the Sith', year: 2005, aliases: ['Star Wars: Episode III'] },
      { title: 'A New Hope', year: 1977, aliases: ['Star Wars', 'Episode IV'] },
      { title: 'The Empire Strikes Back', year: 1980, aliases: ['Episode V'] },
      { title: 'Return of the Jedi', year: 1983, aliases: ['Episode VI'] },
      { title: 'The Force Awakens', year: 2015, aliases: ['Episode VII'] },
      { title: 'The Last Jedi', year: 2017, aliases: ['Episode VIII'] },
      { title: 'The Rise of Skywalker', year: 2019, aliases: ['Episode IX'] },
    ],
  },
  {
    id: 'mcu', title: 'MCU Infinity Saga', category: 'blockbuster', reward: 'Avenger Assemble',
    iconName: 'Zap', from: '#0d1e2b', to: '#1a4a6b',
    items: [
      { title: 'Iron Man', year: 2008 },
      { title: 'The Incredible Hulk', year: 2008 },
      { title: 'Iron Man 2', year: 2010 },
      { title: 'Thor', year: 2011 },
      { title: 'Captain America: The First Avenger', year: 2011, aliases: ['Captain America TFA'] },
      { title: 'The Avengers', year: 2012, aliases: ['Avengers Assemble'] },
      { title: 'Iron Man 3', year: 2013 },
      { title: 'Thor: The Dark World', year: 2013 },
      { title: 'Captain America: The Winter Soldier', year: 2014, aliases: ['Captain America TWS'] },
      { title: 'Guardians of the Galaxy', year: 2014 },
      { title: 'Avengers: Age of Ultron', year: 2015 },
      { title: 'Ant-Man', year: 2015 },
      { title: 'Captain America: Civil War', year: 2016 },
      { title: 'Doctor Strange', year: 2016 },
      { title: 'Guardians of the Galaxy Vol. 2', year: 2017 },
      { title: 'Spider-Man: Homecoming', year: 2017 },
      { title: 'Thor: Ragnarok', year: 2017 },
      { title: 'Black Panther', year: 2018 },
      { title: 'Avengers: Infinity War', year: 2018 },
      { title: 'Ant-Man and the Wasp', year: 2018 },
      { title: 'Captain Marvel', year: 2019 },
      { title: 'Avengers: Endgame', year: 2019 },
      { title: 'Spider-Man: Far From Home', year: 2019 },
    ],
  },
  {
    id: 'lotr', title: 'Middle-earth Saga', category: 'fantasy', reward: 'Ring Bearer',
    iconName: 'Crown', from: '#1e2b0d', to: '#4a6b1a',
    items: [
      { title: 'The Fellowship of the Ring', year: 2001 },
      { title: 'The Two Towers', year: 2002 },
      { title: 'The Return of the King', year: 2003 },
      { title: 'The Hobbit: An Unexpected Journey', year: 2012, aliases: ['An Unexpected Journey'] },
      { title: 'The Hobbit: The Desolation of Smaug', year: 2013, aliases: ['The Desolation of Smaug'] },
      { title: 'The Hobbit: The Battle of the Five Armies', year: 2014, aliases: ['The Battle of the Five Armies'] },
    ],
  },
  {
    id: 'hp', title: 'Harry Potter', category: 'fantasy', reward: 'Wizarding Graduate',
    iconName: 'Wand2', from: '#1e0d37', to: '#4a1a6b',
    items: [
      { title: "Harry Potter and the Sorcerer's Stone", year: 2001, aliases: ["The Sorcerer's Stone", "The Philosopher's Stone"] },
      { title: 'Harry Potter and the Chamber of Secrets', year: 2002, aliases: ['Chamber of Secrets'] },
      { title: 'Harry Potter and the Prisoner of Azkaban', year: 2004, aliases: ['Prisoner of Azkaban'] },
      { title: 'Harry Potter and the Goblet of Fire', year: 2005, aliases: ['Goblet of Fire'] },
      { title: 'Harry Potter and the Order of the Phoenix', year: 2007, aliases: ['Order of the Phoenix'] },
      { title: 'Harry Potter and the Half-Blood Prince', year: 2009, aliases: ['Half-Blood Prince'] },
      { title: 'Harry Potter and the Deathly Hallows: Part 1', year: 2010, aliases: ['Deathly Hallows Part 1'] },
      { title: 'Harry Potter and the Deathly Hallows: Part 2', year: 2011, aliases: ['Deathly Hallows Part 2'] },
    ],
  },
  {
    id: 'matrix', title: 'The Matrix', category: 'classic', reward: 'Red Pill',
    iconName: 'Glasses', from: '#0d2b1e', to: '#1a4a3a',
    items: [
      { title: 'The Matrix', year: 1999 },
      { title: 'The Matrix Reloaded', year: 2003 },
      { title: 'The Matrix Revolutions', year: 2003 },
      { title: 'The Matrix Resurrections', year: 2021 },
    ],
  },
  {
    id: 'dune', title: 'Dune (Villeneuve)', category: 'fantasy', reward: 'Kwisatz Haderach',
    iconName: 'Mountain', from: '#2b1a0d', to: '#8a5a1a',
    items: [
      { title: 'Dune: Part One', year: 2021, aliases: ['Dune'] },
      { title: 'Dune: Part Two', year: 2024 },
    ],
  },
  {
    id: 'avatar', title: 'Avatar', category: 'blockbuster', reward: "Na'vi Ally",
    iconName: 'Trees', from: '#0d2b3a', to: '#1a6b8a',
    items: [
      { title: 'Avatar', year: 2009 },
      { title: 'Avatar: The Way of Water', year: 2022, aliases: ['The Way of Water'] },
    ],
  },
  {
    id: 'planet-apes', title: 'Planet of the Apes (Reboot)', category: 'blockbuster', reward: "Caesar's Heir",
    iconName: 'Eye', from: '#1a1208', to: '#4a3a1a',
    items: [
      { title: 'Rise of the Planet of the Apes', year: 2011, aliases: ['Rise'] },
      { title: 'Dawn of the Planet of the Apes', year: 2014, aliases: ['Dawn'] },
      { title: 'War for the Planet of the Apes', year: 2017, aliases: ['War'] },
      { title: 'Kingdom of the Planet of the Apes', year: 2024, aliases: ['Kingdom'] },
    ],
  },
  {
    id: 'star-trek', title: 'Star Trek Kelvin', category: 'fantasy', reward: 'Final Frontier',
    iconName: 'Rocket', from: '#2b1a0d', to: '#6b4a1a',
    items: [
      { title: 'Star Trek', year: 2009 },
      { title: 'Star Trek Into Darkness', year: 2013 },
      { title: 'Star Trek Beyond', year: 2016 },
    ],
  },
  {
    id: 'dark-knight', title: 'The Dark Knight Trilogy', category: 'blockbuster', reward: 'Caped Crusader',
    iconName: 'Shield', from: '#0d0d0d', to: '#2a2a3a',
    items: [
      { title: 'Batman Begins', year: 2005 },
      { title: 'The Dark Knight', year: 2008 },
      { title: 'The Dark Knight Rises', year: 2012 },
    ],
  },
  {
    id: 'john-wick', title: 'John Wick', category: 'blockbuster', reward: 'Baba Yaga',
    iconName: 'Skull', from: '#1a0d0d', to: '#3a1a1a',
    items: [
      { title: 'John Wick', year: 2014 },
      { title: 'John Wick: Chapter 2', year: 2017 },
      { title: 'John Wick: Chapter 3 – Parabellum', year: 2019, aliases: ['Parabellum'] },
      { title: 'John Wick: Chapter 4', year: 2023 },
    ],
  },
  {
    id: 'mission-impossible', title: 'Mission: Impossible', category: 'blockbuster', reward: 'IMF Agent',
    iconName: 'Bomb', from: '#1e0d0d', to: '#6b1a3a',
    items: [
      { title: 'Mission: Impossible', year: 1996 },
      { title: 'Mission: Impossible 2', year: 2000 },
      { title: 'Mission: Impossible III', year: 2006 },
      { title: 'Mission: Impossible – Ghost Protocol', year: 2011, aliases: ['Ghost Protocol'] },
      { title: 'Mission: Impossible – Rogue Nation', year: 2015, aliases: ['Rogue Nation'] },
      { title: 'Mission: Impossible – Fallout', year: 2018, aliases: ['Fallout'] },
      { title: 'Mission: Impossible – Dead Reckoning Part One', year: 2023, aliases: ['Dead Reckoning'] },
      { title: 'Mission: Impossible – The Final Reckoning', year: 2025, aliases: ['Dead Reckoning Part Two'] },
    ],
  },
  {
    id: 'fast-furious', title: 'Fast & Furious', category: 'blockbuster', reward: 'Family',
    iconName: 'Car', from: '#0d1e2b', to: '#3a1a6b',
    items: [
      { title: 'The Fast and the Furious', year: 2001 },
      { title: '2 Fast 2 Furious', year: 2003 },
      { title: 'The Fast and the Furious: Tokyo Drift', year: 2006, aliases: ['Tokyo Drift'] },
      { title: 'Fast & Furious', year: 2009 },
      { title: 'Fast Five', year: 2011 },
      { title: 'Fast & Furious 6', year: 2013 },
      { title: 'Furious 7', year: 2015 },
      { title: 'The Fate of the Furious', year: 2017 },
      { title: 'Hobbs & Shaw', year: 2019 },
      { title: 'F9', year: 2021 },
      { title: 'Fast X', year: 2023 },
    ],
  },
  {
    id: 'indiana-jones', title: 'Indiana Jones', category: 'classic', reward: 'Tomb Raider',
    iconName: 'Compass', from: '#2b1a0d', to: '#6b4a2a',
    items: [
      { title: 'Raiders of the Lost Ark', year: 1981 },
      { title: 'Indiana Jones and the Temple of Doom', year: 1984, aliases: ['Temple of Doom'] },
      { title: 'Indiana Jones and the Last Crusade', year: 1989, aliases: ['The Last Crusade'] },
      { title: 'Indiana Jones and the Kingdom of the Crystal Skull', year: 2008, aliases: ['Crystal Skull'] },
      { title: 'Indiana Jones and the Dial of Destiny', year: 2023, aliases: ['Dial of Destiny'] },
    ],
  },
  {
    id: 'pirates', title: 'Pirates of the Caribbean', category: 'blockbuster', reward: 'Captain',
    iconName: 'Ship', from: '#0d1e2b', to: '#2a3a4a',
    items: [
      { title: 'Pirates of the Caribbean: The Curse of the Black Pearl', year: 2003, aliases: ['Curse of the Black Pearl'] },
      { title: "Pirates of the Caribbean: Dead Man's Chest", year: 2006, aliases: ["Dead Man's Chest"] },
      { title: "Pirates of the Caribbean: At World's End", year: 2007, aliases: ["At World's End"] },
      { title: 'Pirates of the Caribbean: On Stranger Tides', year: 2011, aliases: ['On Stranger Tides'] },
      { title: 'Pirates of the Caribbean: Dead Men Tell No Tales', year: 2017, aliases: ['Dead Men Tell No Tales'] },
    ],
  },
  {
    id: 'jurassic', title: 'Jurassic Park / World', category: 'blockbuster', reward: 'Park Survivor',
    iconName: 'Trees', from: '#0d2b1e', to: '#1a4a2a',
    items: [
      { title: 'Jurassic Park', year: 1993 },
      { title: 'The Lost World: Jurassic Park', year: 1997, aliases: ['The Lost World'] },
      { title: 'Jurassic Park III', year: 2001 },
      { title: 'Jurassic World', year: 2015 },
      { title: 'Jurassic World: Fallen Kingdom', year: 2018, aliases: ['Fallen Kingdom'] },
      { title: 'Jurassic World Dominion', year: 2022, aliases: ['Dominion'] },
      { title: 'Jurassic World Rebirth', year: 2025, aliases: ['Rebirth'] },
    ],
  },
  {
    id: 'bond-craig', title: 'James Bond (Craig)', category: 'classic', reward: '007',
    iconName: 'Gem', from: '#0d0d0d', to: '#1a2a3a',
    items: [
      { title: 'Casino Royale', year: 2006 },
      { title: 'Quantum of Solace', year: 2008 },
      { title: 'Skyfall', year: 2012 },
      { title: 'Spectre', year: 2015 },
      { title: 'No Time to Die', year: 2021 },
    ],
  },
  {
    id: 'back-future', title: 'Back to the Future', category: 'classic', reward: 'Time Traveler',
    iconName: 'Hourglass', from: '#1a1a3e', to: '#3a3a6b',
    items: [
      { title: 'Back to the Future', year: 1985 },
      { title: 'Back to the Future Part II', year: 1989 },
      { title: 'Back to the Future Part III', year: 1990 },
    ],
  },
  {
    id: 'rocky', title: 'Rocky', category: 'classic', reward: 'Italian Stallion',
    iconName: 'Hand', from: '#1a0d0d', to: '#4a1a1a',
    items: [
      { title: 'Rocky', year: 1976 },
      { title: 'Rocky II', year: 1979 },
      { title: 'Rocky III', year: 1982 },
      { title: 'Rocky IV', year: 1985 },
      { title: 'Rocky V', year: 1990 },
      { title: 'Rocky Balboa', year: 2006 },
    ],
  },
  {
    id: 'godfather', title: 'The Godfather', category: 'classic', reward: 'Don',
    iconName: 'Drama', from: '#0d0d0d', to: '#2a1a0d',
    items: [
      { title: 'The Godfather', year: 1972 },
      { title: 'The Godfather Part II', year: 1974 },
      { title: 'The Godfather Part III', year: 1990 },
    ],
  },
  {
    id: 'alien', title: 'Alien', category: 'horror', reward: 'Xenomorph Slayer',
    iconName: 'Atom', from: '#0d0d0d', to: '#1a2a1a',
    items: [
      { title: 'Alien', year: 1979 },
      { title: 'Aliens', year: 1986 },
      { title: 'Alien 3', year: 1992 },
      { title: 'Alien: Resurrection', year: 1997, aliases: ['Resurrection'] },
      { title: 'Prometheus', year: 2012 },
      { title: 'Alien: Covenant', year: 2017, aliases: ['Covenant'] },
    ],
  },
  {
    id: 'toy-story', title: 'Toy Story', category: 'animation', reward: 'To Infinity',
    iconName: 'Sparkles', from: '#0d1e3a', to: '#3a5a8a',
    items: [
      { title: 'Toy Story', year: 1995 },
      { title: 'Toy Story 2', year: 1999 },
      { title: 'Toy Story 3', year: 2010 },
      { title: 'Toy Story 4', year: 2019 },
    ],
  },
  {
    id: 'shrek', title: 'Shrek', category: 'animation', reward: 'Swamp Lord',
    iconName: 'Sun', from: '#1e2b0d', to: '#4a6b1a',
    items: [
      { title: 'Shrek', year: 2001 },
      { title: 'Shrek 2', year: 2004 },
      { title: 'Shrek the Third', year: 2007 },
      { title: 'Shrek Forever After', year: 2010, aliases: ['Forever After'] },
    ],
  },
  {
    id: 'how-train-dragon', title: 'How to Train Your Dragon', category: 'animation', reward: 'Dragon Rider',
    iconName: 'Flame', from: '#0d1e2b', to: '#1a4a6b',
    items: [
      { title: 'How to Train Your Dragon', year: 2010 },
      { title: 'How to Train Your Dragon 2', year: 2014 },
      { title: 'How to Train Your Dragon: The Hidden World', year: 2019, aliases: ['The Hidden World'] },
    ],
  },
  {
    id: 'frozen', title: 'Frozen', category: 'animation', reward: 'Snow Queen',
    iconName: 'Snowflake', from: '#0d1e3a', to: '#3a6b8a',
    items: [
      { title: 'Frozen', year: 2013 },
      { title: 'Frozen II', year: 2019 },
    ],
  },
  {
    id: 'kung-fu-panda', title: 'Kung Fu Panda', category: 'animation', reward: 'Dragon Warrior',
    iconName: 'Hand', from: '#1e2b0d', to: '#6b4a1a',
    items: [
      { title: 'Kung Fu Panda', year: 2008 },
      { title: 'Kung Fu Panda 2', year: 2011 },
      { title: 'Kung Fu Panda 3', year: 2016 },
      { title: 'Kung Fu Panda 4', year: 2024 },
    ],
  },
  {
    id: 'ghibli', title: 'Studio Ghibli', category: 'animation', reward: 'Spirited Watcher',
    iconName: 'Ghost', from: '#0d2b1e', to: '#1a6b4a',
    items: [
      { title: 'Spirited Away', year: 2001 },
      { title: 'My Neighbor Totoro', year: 1988 },
      { title: "Howl's Moving Castle", year: 2004 },
      { title: 'Princess Mononoke', year: 1997 },
      { title: "Kiki's Delivery Service", year: 1989 },
      { title: 'Castle in the Sky', year: 1986 },
      { title: 'Ponyo', year: 2008 },
      { title: 'The Wind Rises', year: 2013 },
      { title: 'Nausicaä of the Valley of the Wind', year: 1984, aliases: ['Nausicaa'] },
      { title: 'Grave of the Fireflies', year: 1988 },
      { title: 'Whisper of the Heart', year: 1995 },
      { title: 'From Up on Poppy Hill', year: 2011 },
    ],
  },
  {
    id: 'demon-slayer', title: 'Demon Slayer (Movies)', category: 'anime', reward: 'Hashira',
    iconName: 'Swords', from: '#1a0d0d', to: '#6b1a1a',
    items: [
      { title: 'Demon Slayer: Mugen Train', year: 2020, aliases: ['Mugen Train'] },
      { title: 'Demon Slayer: To the Swordsmith Village', year: 2023, aliases: ['Swordsmith Village'] },
      { title: 'Demon Slayer: Infinity Castle', year: 2025, aliases: ['Infinity Castle'] },
    ],
  },
  {
    id: 'evangelion', title: 'Evangelion Rebuild', category: 'anime', reward: 'EVA Pilot',
    iconName: 'Triangle', from: '#1e0d1e', to: '#4a1a4a',
    items: [
      { title: 'Evangelion: 1.0 You Are (Not) Alone', year: 2007, aliases: ['Evangelion 1.0'] },
      { title: 'Evangelion: 2.0 You Can (Not) Advance', year: 2009, aliases: ['Evangelion 2.0'] },
      { title: 'Evangelion: 3.0 You Can (Not) Redo', year: 2012, aliases: ['Evangelion 3.0'] },
      { title: 'Evangelion: 3.0+1.0 Thrice Upon a Time', year: 2021, aliases: ['Thrice Upon a Time'] },
    ],
  },
  {
    id: 'makoto-shinkai', title: 'Makoto Shinkai', category: 'anime', reward: 'Sky Watcher',
    iconName: 'Star', from: '#0d1e3a', to: '#3a3a8a',
    items: [
      { title: '5 Centimeters per Second', year: 2007 },
      { title: 'Your Name', year: 2016, aliases: ['Kimi no Na wa'] },
      { title: 'Weathering with You', year: 2019 },
      { title: 'Suzume', year: 2022 },
    ],
  },
  {
    id: 'ghost-shell', title: 'Ghost in the Shell', category: 'anime', reward: 'Sentient',
    iconName: 'Eye', from: '#0d1e2b', to: '#1a4a6b',
    items: [
      { title: 'Ghost in the Shell', year: 1995 },
      { title: 'Ghost in the Shell 2: Innocence', year: 2004, aliases: ['Innocence'] },
      { title: 'Ghost in the Shell: SAC Solid State Society', year: 2006, aliases: ['SAC Solid State Society'] },
      { title: 'Ghost in the Shell: The New Movie', year: 2015 },
    ],
  },
  {
    id: 'conjuring', title: 'The Conjuring Universe', category: 'horror', reward: 'Demon Hunter',
    iconName: 'Ghost', from: '#0d0d0d', to: '#2a0d1a',
    items: [
      { title: 'The Conjuring', year: 2013 },
      { title: 'Annabelle', year: 2014 },
      { title: 'The Conjuring 2', year: 2016 },
      { title: 'Annabelle: Creation', year: 2017 },
      { title: 'The Nun', year: 2018 },
      { title: 'The Curse of La Llorona', year: 2019 },
      { title: 'Annabelle Comes Home', year: 2019 },
      { title: 'The Conjuring: The Devil Made Me Do It', year: 2021 },
      { title: 'The Nun II', year: 2023 },
    ],
  },
  {
    id: 'scream', title: 'Scream', category: 'horror', reward: 'Final Girl',
    iconName: 'Drama', from: '#1a0d0d', to: '#3a0d1a',
    items: [
      { title: 'Scream', year: 1996 },
      { title: 'Scream 2', year: 1997 },
      { title: 'Scream 3', year: 2000 },
      { title: 'Scream 4', year: 2011 },
      { title: 'Scream', year: 2022 },
      { title: 'Scream VI', year: 2023 },
    ],
  },
  {
    id: 'halloween', title: 'Halloween (Reboot)', category: 'horror', reward: 'Survivor',
    iconName: 'Moon', from: '#0d0d0d', to: '#2a1a0d',
    items: [
      { title: 'Halloween', year: 2018 },
      { title: 'Halloween Kills', year: 2021 },
      { title: 'Halloween Ends', year: 2022 },
    ],
  },
]

// ---------- matching ----------

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

type UserTitleRef = { title: string; year: number | null }

/**
 * For each saga item, return true if the user has a matching title in their library.
 * Matches by normalized title equality OR substring containment, with year proximity ≤ 2.
 */
export function getWatchedSagaFlags(saga: SagaDef, userTitles: UserTitleRef[]): boolean[] {
  const userNormed = userTitles.map((u) => ({
    n: norm(u.title),
    year: u.year,
  }))

  return saga.items.map((item) => {
    const names = [item.title, ...(item.aliases ?? [])].map(norm)
    for (const ut of userNormed) {
      const yearOk = ut.year == null || Math.abs((ut.year ?? item.year) - item.year) <= 2
      if (!yearOk) continue
      for (const n of names) {
        if (n.length === 0) continue
        if (ut.n === n) return true
        if (ut.n.length >= 6 && n.length >= 6 && (ut.n.includes(n) || n.includes(ut.n))) return true
      }
    }
    return false
  })
}

export function getSagaProgress(saga: SagaDef, userTitles: UserTitleRef[]): { watched: number; total: number; unlocked: boolean; flags: boolean[] } {
  const flags = getWatchedSagaFlags(saga, userTitles)
  const watched = flags.filter(Boolean).length
  return { watched, total: saga.items.length, unlocked: watched === saga.items.length, flags }
}
