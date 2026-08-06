// Profanity filtering service for reviews

const BAD_WORDS = [
  'fuck', 'fucking', 'fucker', 'fucks', 'shit', 'shitting', 'shitty', 'shits',
  'bitch', 'bitches', 'bitching', 'bastard', 'asshole', 'assholes', 'cunt', 'cunts',
  'dick', 'dicks', 'pussy', 'pussies', 'cock', 'cocks', 'whore', 'whores', 'slut',
  'sluts', 'motherfucker', 'motherfucking', 'bullshit', 'prick', 'twat', 'wanker',
  'nigger', 'nigga', 'faggot', 'retard', 'b!tch', 'f*ck', 'sh*t', 'a$$hole'
];

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  
  // Normalize text: lowercase and strip non-alphanumeric spacing tricks (e.g. f.u.c.k or f u c k)
  const lower = text.toLowerCase();
  
  // Check exact word matches and regex patterns
  for (const word of BAD_WORDS) {
    // Regex for word boundary or isolated profanity pattern
    const regex = new RegExp(`\\b${word.replace(/\*/g, '\\*').replace(/\$/g, '\\$')}\\b`, 'i');
    if (regex.test(lower)) {
      return true;
    }
  }

  // Also check normalized spaced string (e.g. "f u c k")
  const stripped = lower.replace(/[^a-z0-9]/g, '');
  for (const word of BAD_WORDS) {
    if (word.length >= 4 && stripped.includes(word.replace(/[^a-z0-9]/g, ''))) {
      return true;
    }
  }

  return false;
}

export function filterProfanity(text: string): string {
  if (!text) return text;
  let cleaned = text;
  for (const word of BAD_WORDS) {
    const regex = new RegExp(`\\b${word.replace(/\*/g, '\\*').replace(/\$/g, '\\$')}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '****');
  }
  return cleaned;
}
