const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server running at http://localhost:6000/");
    });
  } catch (e) {
    console.log(`Database Error ${e.message}`);
    process.exit(1);
  }
};

initializeDb();

// for changing db object to response object
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// API 1 Getting all Players
app.get("/players/", async (request, response) => {
  const playersDetails = `SELECT * FROM cricket_team  `;

  const playersArray = await db.all(playersDetails);

  response.send(
    playersArray.map((eachObject) =>
      convertDbObjectToResponseObject(eachObject)
    )
  );
});

// API 2 Add New player
app.post("/players/", async (request, response) => {
  const newPlayer = request.body;
  const { playerName, jerseyNumber, role } = newPlayer;

  const addingNewPlayer = ` 
        INSERT INTO 
             cricket_team (player_name, jersey_number, role )
        VALUES(
            '${playerName}',
            '${jerseyNumber}',
            '${role}'
        )    
    `;
  const dbResponse = await db.run(addingNewPlayer);
  const newOne = dbResponse.lastID;
  response.send("Player Added to Team");
});

//API 3 getting particular player

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
        SELECT * FROM cricket_team WHERE player_id = ${playerId}
        `;
  const plater = await db.get(playerQuery);
  response.send(convertDbObjectToResponseObject(plater));
});

//API 4 Updating player details

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerDetails = `
        UPDATE cricket_team SET 
                           player_name = '${playerName}',
                           jersey_number =  '${jerseyNumber}',
                            role = '${role}' 
                      WHERE player_id = ${playerId}`;

  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

// API 5 removing player from team

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const removePlayer = `DELETE FROM cricket_team  WHERE player_id = ${playerId}`;

  await db.run(removePlayer);
  response.send("Player Removed");
});

module.exports = app;
