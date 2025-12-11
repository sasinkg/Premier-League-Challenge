// export type StandingsRow = {
//   position: number;
//   name: string;
//   played: number;
//   won: number;
//   draw: number;
//   lost: number;
//   points: number;
//   logo: string;
// };

// export async function fetchPremierLeagueTable(): Promise<StandingsRow[]> {
//   const res = await fetch(
//     "https://api.football-data.org/v4/competitions/PL/standings",
//     {
//       headers: {
//         "X-Auth-Token": import.meta.env.VITE_FOOTBALL_API_KEY,
//       },
//     }
//   );

//   const data = await res.json();
//   const table = data.standings[0].table;

//   return table.map((row: any) => ({
//     position: row.position,
//     name: row.team.name,
//     played: row.playedGames,
//     won: row.won,
//     draw: row.draw,
//     lost: row.lost,
//     points: row.points,
//     logo: row.team.crest,
//   }));
// }
export type TeamInfo = {
  name: string;
  logo: string;
};

// ---- IMPORT LOGOS ---- //
import arsenalLogo from "../assets/logos/Arsenal FC.png";
import manCityLogo from "../assets/logos/Manchester City.png";
import liverpoolLogo from "../assets/logos/Liverpool FC.png";
import astonVillaLogo from "../assets/logos/Aston Villa.png";
import tottenhamLogo from "../assets/logos/Tottenham Hotspur.png";
import chelseaLogo from "../assets/logos/Chelsea FC.png";
import manUnitedLogo from "../assets/logos/Manchester United.png";
import newcastleLogo from "../assets/logos/Newcastle United.png";
import brightonLogo from "../assets/logos/Brighton & Hove Albion.png";
import westHamLogo from "../assets/logos/West Ham United.png";
import brentfordLogo from "../assets/logos/Brentford FC.png";
import bournemouthLogo from "../assets/logos/AFC Bournemouth.png";
import palaceLogo from "../assets/logos/Crystal Palace.png";
import fulhamLogo from "../assets/logos/Fulham FC.png";
import wolvesLogo from "../assets/logos/Wolverhampton Wanderers.png";
import nottinghamLogo from "../assets/logos/Nottingham Forest.png";
import evertonLogo from "../assets/logos/Everton FC.png";
import burnleyLogo from "../assets/logos/Burnley FC.png";
// You have Sunderland in your folder — PL team would be Luton.
// If you add Luton later, import here:
import sunderlandLogo from "../assets/logos/Sunderland AFC.png";

// ---- LIST OF TEAMS ---- //
const TEAMS: TeamInfo[] = [
  { name: "Arsenal", logo: arsenalLogo },
  { name: "Manchester City", logo: manCityLogo },
  { name: "Liverpool", logo: liverpoolLogo },
  { name: "Aston Villa", logo: astonVillaLogo },
  { name: "Tottenham Hotspur", logo: tottenhamLogo },
  { name: "Chelsea", logo: chelseaLogo },
  { name: "Manchester United", logo: manUnitedLogo },
  { name: "Newcastle United", logo: newcastleLogo },
  { name: "Brighton & Hove Albion", logo: brightonLogo },
  { name: "West Ham United", logo: westHamLogo },
  { name: "Brentford", logo: brentfordLogo },
  { name: "AFC Bournemouth", logo: bournemouthLogo },
  { name: "Crystal Palace", logo: palaceLogo },
  { name: "Fulham", logo: fulhamLogo },
  { name: "Wolverhampton Wanderers", logo: wolvesLogo },
  { name: "Nottingham Forest", logo: nottinghamLogo },
  { name: "Everton", logo: evertonLogo },
  { name: "Burnley", logo: burnleyLogo },
  { name: "Sunderland", logo: sunderlandLogo }, // or replace with "Luton Town"
];

// ---- EXPORT FUNCTION ---- //
export async function fetchPremierLeagueTable(): Promise<TeamInfo[]> {
  // No API call — instant local return
  return TEAMS;
}
