const playerContainer = document.getElementById("all-players-container");
const newPlayerFormContainer = document.getElementById("new-player-form");

// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = "2302-acc-pt-web-pt-d";
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/`;

/**
 * It fetches all players from the API and returns them
 * @returns An array of objects.
 */
const fetchAllPlayers = async () => {
  try {
    const response = await fetch(APIURL + "players");
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Uh oh, trouble fetching players!", err);
  }
  
};

async function fetchSinglePlayer(playerId) {
  try {
    const response = await fetch(APIURL + "players/" + playerId);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(`Oh no, trouble fetching player #${playerId}!`, err);
  }
}

const addNewPlayer = async (playerObj) => {
  try {
    const response = await fetch(APIURL + "players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playerObj),
    });
    const data = await response.json();

    window.location.reload();
    
    return data;
  } catch (err) {
    console.error("Oops, something went wrong with adding that player!", err);
  }
};

const removePlayer = async (playerId) => {
  try {
    const response = await fetch(APIURL + "players/" + playerId, {
      method: "DELETE",
    });
    const data = await response.json();

    window.location.reload();
    return data;
  } catch (err) {
    console.error(
      `Whoops, trouble removing player #${playerId} from the roster!`,
      err
    );
  }
};

/**
 * It takes an array of player objects, loops through them, and creates a string of HTML for each
 * player, then adds that string to a larger string of HTML that represents all the players.
 *
 * Then it takes that larger string of HTML and adds it to the DOM.
 *
 * It also adds event listeners to the buttons in each player card.
 *
 * The event listeners are for the "See details" and "Remove from roster" buttons.
 *
 * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
 * API to get the details for a single player.
 *
 * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
 * the API to remove a player from the roster.
 *
 * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
 * @param playerList - an array of player objects
 * @returns the playerContainerHTML variable.
 */

 const renderPlayerDetails = (player) => {
  const detailsHTML = `
    <div class="player-details">
      <h2>${player.name}</h2>
      <p>Breed: ${player.breed}</p>
      <p>Team ID: ${player.teamId}</p>
      <p>Status: ${player.status}</p>
      <img src="${player.imageUrl}" alt="${player.name}">
    </div>
  `;

  // Display the player details in a separate section or modal
  const playerDetailsContainer = document.getElementById("player-details-container");
  playerDetailsContainer.innerHTML = detailsHTML;
};

 const renderAllPlayers = (playerList) => {
    try {
      if (Array.isArray(playerList.players)) {
        console.log(playerList.players);

        let playerContainerHTML = "";
        playerList.players.forEach((player) => {
          playerContainerHTML += `
            <div class="player-card">
              <h2>${player.name}</h2>
              <p>${player.breed}</p>
              <p>${player.teamId}</p>
              <p>${player.status}</p>
              <img src="${player.imageUrl}" alt="${player.name}>
              <button class="details-button button" data-player-id="${player.id}"</button>
              <button class="details-button" data-player-id="${player.id}">See details</button>

              <button class="remove-button" data-player-id="${player.id}">Remove from roster</button>
            </div>
          `;
        });
  
        playerContainer.innerHTML = playerContainerHTML;
  
        // Add event listeners to the buttons
        
        const detailsButtons = document.querySelectorAll(".details-button button");
        detailsButtons.forEach((button) => {
          button.addEventListener("click", async () => {
            const playerId = button.dataset.playerId;
            try {
              const player = await fetchSinglePlayer(playerId);
              renderPlayerDetails(players);
            } catch (err) {
              console.error(`Oh no, trouble fetching player #${playerId}!`, err);
            }
          });
        });    
        const removeButtons = document.querySelectorAll(".remove-button");
        removeButtons.forEach((button) => {
          button.addEventListener("click", () => {
            const playerId = button.dataset.playerId;
            removePlayer(playerId)
              .then(() => {
                // Player removed successfully, update the UI if needed
              })
              .catch((err) => {
                console.error(
                  `Whoops, trouble removing player #${playerId} from the roster!`,
                  err
                );
              });
          });
        });
      } else {
        console.error("Player list is not an array:", playerList);
        return;
      }
    } catch (err) {
      console.error("Uh oh, trouble rendering players!", err);
    }
  };
  

/**
 * It renders a form to the DOM, and when the form is submitted, it adds a new player to the database,
 * fetches all players from the database, and renders them to the DOM.
 */
const renderNewPlayerForm = () => {
  try {
    const formHTML = `
      <form id="add-player-form">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" autocomplete="on" required>
        <label for="breed">Breed:</label>
        <input type="text" id="breed" name="breed" autocomplete="on" required>
        <button type="submit">Add Player</button>
      </form>
    `;
    newPlayerFormContainer.innerHTML = formHTML;

    const addPlayerForm = document.getElementById("add-player-form");
    addPlayerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const nameInput = document.getElementById("name");
      const breedInput = document.getElementById("breed");
      const playerObj = {
        name: nameInput.value,
        breed: breedInput.value,
      };

      addNewPlayer(playerObj)
        .then(() => {
          // Player added successfully, update the UI if needed
          nameInput.value = "";
          breedInput.value = "";
          fetchAllPlayers()
            .then((players) => {
              renderAllPlayers(players.data);
            })
            .catch((err) => {
              console.error("Uh oh, trouble fetching players!", err);
            });
        })
        .catch((err) => {
          console.error("Oops, something went wrong with adding that player!", err);
        });
    });
  } catch (err) {
    console.error("Uh oh, trouble rendering the new player form!", err);
  }
};

const init = async () => {
  try {
    const players = await fetchAllPlayers();
    renderAllPlayers(players.data);
    renderNewPlayerForm();
  } catch (err) {
    console.error("Uh oh, trouble initializing the app!", err);
  }
};

init();
