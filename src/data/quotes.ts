// Notable quotes for documentary
// Add quotes relevant to your topic

export interface Quote {
  text: string;
  author: string;
  role?: string;
  year?: number | string;
  chapter: number;
}

export const quotes: Quote[] = [
  // Chapter 1
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    year: 2005,
    chapter: 1,
  },
  // Chapter 2
  {
    text: "Change is the law of life. And those who look only to the past or present are certain to miss the future.",
    author: "John F. Kennedy",
    year: 1963,
    chapter: 2,
  },
  // Chapter 3
  {
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
    chapter: 3,
  },
];

export const getQuotesByChapter = (chapter: number): Quote[] => {
  return quotes.filter((q) => q.chapter === chapter);
};

export const getRandomQuote = (chapter?: number): Quote => {
  const filtered = chapter ? getQuotesByChapter(chapter) : quotes;
  return filtered[Math.floor(Math.random() * filtered.length)];
};
