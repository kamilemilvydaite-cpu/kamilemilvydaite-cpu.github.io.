// Kalendoriaus turinys. Šį failą galima redaguoti paprastu teksto redaktoriumi.
window.KALENDORIUS = {
  // Jei įrašysi paskelbtos Google Sheets lentelės CSV nuorodą, užduotys bus imamos iš jos
  // (stulpeliai: diena, užduotis). Kol tuščia, naudojamos žemiau surašytos.
  sheetCsvUrl: "",

  // Nuo kurios gruodžio dienos veikia pasakos žibintas.
  filmasNuoDienos: 1,
  filmoFailas: "video/pasaka.mp4",

  elfoLabas: "Labas, vaikai!",
  elfoAte: "Iki rytojaus!",

  uzduotys: {
    1: "Čia bus 1 dienos užduotis.",
    2: "Čia bus 2 dienos užduotis.",
    3: "Čia bus 3 dienos užduotis.",
    4: "Čia bus 4 dienos užduotis.",
    5: "Čia bus 5 dienos užduotis.",
    6: "Čia bus 6 dienos užduotis.",
    7: "Čia bus 7 dienos užduotis.",
    8: "Čia bus 8 dienos užduotis.",
    9: "Čia bus 9 dienos užduotis.",
    10: "Čia bus 10 dienos užduotis.",
    11: "Čia bus 11 dienos užduotis.",
    12: "Čia bus 12 dienos užduotis.",
    13: "Čia bus 13 dienos užduotis.",
    14: "Čia bus 14 dienos užduotis.",
    15: "Čia bus 15 dienos užduotis.",
    16: "Čia bus 16 dienos užduotis.",
    17: "Čia bus 17 dienos užduotis.",
    18: "Čia bus 18 dienos užduotis.",
    19: "Čia bus 19 dienos užduotis.",
    20: "Čia bus 20 dienos užduotis.",
    21: "Čia bus 21 dienos užduotis.",
    22: "Čia bus 22 dienos užduotis.",
    23: "Čia bus 23 dienos užduotis.",
    24: "Čia bus 24 dienos užduotis."
  },

  // Durų vieta kiekviename namelio paveikslėlyje (dalimis nuo 0 iki 1): x, y, plotis, aukštis.
  durys: {
    1: { x: 0.474, y: 0.614, w: 0.19, h: 0.372 },
    2: { x: 0.474, y: 0.614, w: 0.19, h: 0.372 },
    3: { x: 0.474, y: 0.614, w: 0.19, h: 0.372 },
    4: { x: 0.474, y: 0.607, w: 0.194, h: 0.366 }
  }
};
