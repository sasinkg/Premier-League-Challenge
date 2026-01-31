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
import leedsLogo from "../assets/logos/Leeds United.png";
// You have Sunderland in your folder — PL team would be Luton.
// If you add Luton later, import here:
import sunderlandLogo from "../assets/logos/Sunderland AFC.png";

// ---- LIST OF TEAMS ---- //
const TEAMS: TeamInfo[] = [
  { name: "Arsenal", logo: arsenalLogo },
  { name: "Manchester City", logo: manCityLogo },
  { name: "Aston Villa", logo: astonVillaLogo },
  { name: "Manchester United", logo: manUnitedLogo },
  { name: "Chelsea", logo: chelseaLogo },
  { name: "Liverpool", logo: liverpoolLogo },
  { name: "Fulham", logo: fulhamLogo },
  { name: "Brentford", logo: brentfordLogo },
  { name: "Newcastle United", logo: newcastleLogo },
  { name: "Everton", logo: evertonLogo },
  { name: "Sunderland", logo: sunderlandLogo }, // or replace with "Luton Town"
  { name: "Brighton & Hove Albion", logo: brightonLogo },
  { name: "AFC Bournemouth", logo: bournemouthLogo },
  { name: "Tottenham Hotspur", logo: tottenhamLogo },
  { name: "West Ham United", logo: westHamLogo },
  { name: "Crystal Palace", logo: palaceLogo },
  { name: "Leeds United", logo: leedsLogo}, 
  { name: "Nottingham Forest", logo: nottinghamLogo },
  { name: "Burnley", logo: burnleyLogo },
  { name: "Wolverhampton Wanderers", logo: wolvesLogo },
];

// ---- EXPORT FUNCTION ---- //
export async function fetchPremierLeagueTable(): Promise<TeamInfo[]> {
  // No API call — instant local return
  return TEAMS;
}
