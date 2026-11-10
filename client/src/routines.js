// Add a new routine here + in server/routines.js and it gets its own page and sidebar link.
export const START = "2026-08-23", END = "2033-08-22", TOTAL_DAYS = 2557;
export const ROUTINES = [
  {
    id: "morning", title: "Morning routine", color: "#1F7A6D",
    habits: [
      { key: "wake", label: "Wake up at 5:00 am" },
      { key: "quran", label: "Recite 1 juz" },
      { key: "adhkar", label: "1,000 adhkar" },
      { key: "water", label: "Drink water" },
      { key: "pushups", label: "100 push-ups" },
      { key: "study", label: "1 hour of studying" },
    ],
  },
  {
    id: "night", title: "Night routine", color: "#5B5BD6",
    habits: [
      { key: "read", label: "Maghrib to Isha: read books and search" },
      { key: "workout", label: "8:00 pm: workout 45 minutes" },
      { key: "rest", label: "9:00 pm: rest and enjoy" },
      { key: "sleep", label: "10:00 pm: sleep" },
    ],
  },
];
