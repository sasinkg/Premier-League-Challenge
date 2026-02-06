export default async function handler(req, res) {
  const r = await fetch(
    "https://api.football-data.org/v4/competitions/PL/standings",
    {
      headers: {
        "X-Auth-Token": process.env.FOOTBALL_API_KEY,
      },
    }
  );

  const data = await r.json();

  res.status(200).json(
    data.standings[0].table.map((row) => ({
      position: row.position,
      name: row.team.name,
      logo: row.team.crest,
    }))
  );
}
