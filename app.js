const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbobjectToResponseObject = (dbobject) => {
  return {
    playerId: dbobject["player_id"],
    playerName: dbobject["player_name"],
    jerseyNumber: dbobject["jersey_number"],
    role: dbobject["role"],
  };
};
//GET all players

app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `SELECT * FROM cricket_team ORDER BY player_id;`;
  const playersArray = await db.all(getAllPlayersQuery);
  response.send(
    playersArray.map((eachItem) => {
      return convertDbobjectToResponseObject(eachItem);
    })
  );
});

//Post player

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO cricket_team(player_name,jersey_number,role)
    VALUES('${playerName}',${jerseyNumber},'${role}');`;
  const dbresponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//Get player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id=${playerId}`;
  const playerArray = await db.get(getPlayerQuery);
  //console.log(playerArray);
  response.send(playerArray);
  //   //.map((eachItem) => {
  //       return convertDbobjectToResponseObject(eachItem);
  //     })
  //   );
});

//update player

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `UPDATE cricket_Team SET player_name='${playerName}',
   jersey_number=${jerseyNumber},
   role='${role}' WHERE player_id=${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Delete Player

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id=${playerId}`;
  const playerArray = await db.all(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
