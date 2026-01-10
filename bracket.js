// Global variables
let allPlayers = [];
let tournament = {
    rounds: [],
    losersRounds: [],
    currentRound: 0,
    settings: {
        teamSize: 1,
        eliminationType: 'single'
    }
};

// DOM Elements
const elements = {
    playerList: document.getElementById('player-list'),
    playerSearch: document.getElementById('player-search'),
    bracketContainer: document.getElementById('bracket-container'),
    noTournament: document.getElementById('no-tournament'),
    adminContent: document.getElementById('admin-content'),
    loginOverlay: document.getElementById('login-overlay'),
    adminPassword: document.getElementById('admin-password'),
    loginButton: document.getElementById('login-button'),
    logoutButton: document.getElementById('logout-button'),
    generateBracketBtn: document.getElementById('generate-bracket'),
    saveBracketBtn: document.getElementById('save-bracket'),
    resetBracketBtn: document.getElementById('reset-bracket'),
    bracketSize: document.getElementById('bracket-size'),
    teamSize: document.getElementById('team-size'),
    eliminationType: document.getElementById('elimination-type'),
    matchSelector: document.getElementById('match-selector'),
    matchEditArea: document.getElementById('match-edit-area'),
    refreshIndicator: document.getElementById('refresh-indicator'),
    addPlayerForm: document.getElementById('add-player-form'),
    newPlayerName: document.getElementById('new-player-name'),
    uploadPlayers: document.getElementById('upload-players'),
    clearPlayers: document.getElementById('clear-players')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadPlayers();
    setupEventListeners();
    await loadBracketFromServer();
    setupAutoRefresh();
    
    // Initial admin state check
    const isAdmin = await checkAdminAuth();
    if (isAdmin) {
        elements.loginOverlay.style.display = 'none';
        elements.adminContent.style.display = 'block';
    } else {
        elements.adminContent.style.display = 'none';
    }
});

// Admin authentication functions
async function checkAdminAuth() {
  try {
    const response = await fetch('php/auth.php');
    const data = await response.json();
    return data.authenticated;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
}

async function adminLogin(password) {
    try {
        const response = await fetch('php/auth.php', {
            method: 'POST',
            body: JSON.stringify({ password }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        const data = await response.json();
        if (data.status === 'success') {
            return true;
        } else {
            alert(data.message || 'Login failed');
            return false;
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login error. Please try again.');
        return false;
    }
}

async function adminLogout() {
    try {
        const response = await fetch('php/auth.php', {
            method: 'DELETE',
            credentials: 'include'
        });
        return response.ok;
    } catch (error) {
        console.error('Logout error:', error);
        return false;
    }
}

// Player management functions
async function updatePlayerList(players) {
    try {
        const response = await fetch('php/update_players.php', {
            method: 'POST',
            body: JSON.stringify({ players }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        const data = await response.json();
        if (data.status === 'success') {
            showUpdateNotification('Player list updated');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating players:', error);
        return false;
    }
}

async function uploadPlayerFile(file) {
    const formData = new FormData();
    formData.append('playerFile', file);
    try {
        const response = await fetch('php/update_players.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        const data = await response.json();
        if (data.status === 'success') {
            await loadPlayers();
            showUpdateNotification('Players imported from file');
            return true;
        } else {
            alert(data.message || 'Error uploading file');
            return false;
        }
    } catch (error) {
        console.error('Error uploading player file:', error);
        alert('Failed to upload file');
        return false;
    }
}

// Load players from JSON file
async function loadPlayers() {
     try {
    const response = await fetch('php/players.json', {
      cache: 'no-store',  // Add this to prevent caching
      credentials: 'include'  // Add this for consistency
    });
    if (!response.ok) throw new Error('Failed to load players');
    const text = await response.text();
    allPlayers = text ? JSON.parse(text) : [];
    renderPlayerList(allPlayers);
  } catch (error) {
    console.error("Error loading players:", error);
        try {
            await updatePlayerList([]);
            allPlayers = [];
            renderPlayerList(allPlayers);
        } catch (e) {
            console.error("Failed to initialize empty players list:", e);
            // Fallback to hardcoded players
            allPlayers = [
                "Skye_Walker", "DarkKnight", "MasterChief", "Sora_Kingdom", 
                "CrashBandicoot", "NinjaGaiden", "SonicSpeed", "MarioJump", 
                "LaraCroft", "NathanDrake", "KratosGod", "LinkHyrule", 
                "SamusAran", "SolidSnake", "CloudStrife", "JillValentine"
            ];
            renderPlayerList(allPlayers);
        }
    }
}

// Render player list function
function renderPlayerList(players) {
    elements.playerList.innerHTML = '';
    
    const teamSize = parseInt(elements.teamSize.value) || 1;
    
    if (teamSize === 1) {
        // Display individual players
        const playersPerColumn = 10;
        const columnsNeeded = Math.ceil(players.length / playersPerColumn);
        
        for (let i = 0; i < columnsNeeded; i++) {
            const column = document.createElement('ul');
            column.classList.add('player-column');
            
            const slice = players.slice(i * playersPerColumn, (i + 1) * playersPerColumn);
            
            slice.forEach(name => {
                const li = document.createElement('li');
                li.textContent = name;
                column.appendChild(li);
            });
            
            elements.playerList.appendChild(column);
        }
    } else {
        // Display players as teams
        const teamsCount = Math.floor(players.length / teamSize);
        
        for (let i = 0; i < teamsCount; i++) {
            const teamMembers = players.slice(i * teamSize, (i + 1) * teamSize);
            
            if (teamMembers.length > 0) {
                const column = document.createElement('ul');
                column.classList.add('player-column');
                
                const teamHeader = document.createElement('div');
                teamHeader.classList.add('team-header');
                teamHeader.textContent = `Team ${i + 1}`;
                column.appendChild(teamHeader);
                
                teamMembers.forEach(name => {
                    const li = document.createElement('li');
                    li.textContent = name;
                    column.appendChild(li);
                });
                
                elements.playerList.appendChild(column);
            }
        }
        
        // If there are leftover players that don't make a full team
        const leftoverStart = teamsCount * teamSize;
        if (leftoverStart < players.length) {
            const leftoverPlayers = players.slice(leftoverStart);
            
            const column = document.createElement('ul');
            column.classList.add('player-column');
            
            const teamHeader = document.createElement('div');
            teamHeader.classList.add('team-header');
            teamHeader.textContent = 'Incomplete Team';
            column.appendChild(teamHeader);
            
            leftoverPlayers.forEach(name => {
                const li = document.createElement('li');
                li.textContent = name;
                column.appendChild(li);
            });
            
            elements.playerList.appendChild(column);
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    
    elements.refreshPlayers = document.getElementById('refresh-players');
elements.refreshPlayers.addEventListener('click', async () => {
  await loadPlayers();
  showUpdateNotification('Player list refreshed');
});
    
    elements.teamSize.addEventListener('change', updateTournamentSettings);
    elements.eliminationType.addEventListener('change', updateTournamentSettings);
    // Player search
    elements.playerSearch.addEventListener('input', () => {
        const query = elements.playerSearch.value.toLowerCase();
        const filtered = allPlayers.filter(name => name.toLowerCase().includes(query));
        renderPlayerList(filtered);
    });
    
    // Team size change
    elements.teamSize.addEventListener('change', () => {
        renderPlayerList(allPlayers);
    });

    // Admin login
    elements.loginButton.addEventListener('click', async () => {
        const password = elements.adminPassword.value;
        const success = await adminLogin(password);
        if (success) {
            elements.loginOverlay.style.display = 'none';
            elements.adminContent.style.display = 'block';
            showUpdateNotification('Admin logged in');
        } else {
            alert('Incorrect password!');
        }
    });

    // Admin logout
    elements.logoutButton.addEventListener('click', async () => {
        const success = await adminLogout();
        if (success) {
            elements.loginOverlay.style.display = 'flex';
            elements.adminContent.style.display = 'none';
            showUpdateNotification('Admin logged out');
        }
    });

    // Player management
    elements.addPlayerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = elements.newPlayerName.value.trim();
        if (name) {
            const newPlayers = [...allPlayers, name];
            const success = await updatePlayerList(newPlayers);
            if (success) {
                await loadPlayers();
                elements.newPlayerName.value = '';
            }
        }
    });

    elements.uploadPlayers.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            await uploadPlayerFile(file);
            e.target.value = '';
        }
    });

    elements.clearPlayers.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all players?')) {
    const success = await updatePlayerList([]);
    if (success) {
      await loadPlayers();
    }
  }
});

    // Tournament management
    elements.generateBracketBtn.addEventListener('click', async () => {
        if (!(await checkAdminAuth())) {
            alert('Session expired. Please login again.');
            elements.loginOverlay.style.display = 'flex';
            elements.adminContent.style.display = 'none';
            return;
        }
        const size = parseInt(elements.bracketSize.value);
        const teamSize = parseInt(elements.teamSize.value);
        const eliminationType = elements.eliminationType.value;
        
        generateBracket(size, teamSize, eliminationType);
    });

    elements.saveBracketBtn.addEventListener('click', async () => {
        if (!(await checkAdminAuth())) {
            alert('Session expired. Please login again.');
            elements.loginOverlay.style.display = 'flex';
            elements.adminContent.style.display = 'none';
            return;
        }
        await saveBracketToServer();
        showUpdateNotification('Bracket saved');
    });

    elements.resetBracketBtn.addEventListener('click', async () => {
        if (!(await checkAdminAuth())) {
            alert('Session expired. Please login again.');
            elements.loginOverlay.style.display = 'flex';
            elements.adminContent.style.display = 'none';
            return;
        }
        if (confirm('Are you sure you want to reset the tournament bracket?')) {
            tournament = {
                rounds: [],
                losersRounds: [],
                currentRound: 0,
                teamSize: 1,
                eliminationType: 'single'
            };
            renderBracket();
            updateMatchSelector();
            await saveBracketToServer();
            showUpdateNotification('Bracket reset');
        }
    });

    // Match selector
    elements.matchSelector.addEventListener('change', async (e) => {
        if (!(await checkAdminAuth())) {
            elements.matchSelector.value = '';
            elements.matchEditArea.innerHTML = '';
            return;
        }
        const matchId = e.target.value;
        if (!matchId) {
            elements.matchEditArea.innerHTML = '';
            return;
        }
        const matchInfo = findMatch(matchId);
        if (matchInfo) {
            showMatchEditor(matchInfo.match, matchInfo.isLosersBracket);
        }
    });
}

// Tournament bracket functions
function generateBracket(size, teamSize, eliminationType) {
    tournament = {
        rounds: [],
        losersRounds: [],
        currentRound: 0,
        settings: {
            teamSize: teamSize || 1,
            eliminationType: eliminationType || 'single'
        }
    };

    // Prepare teams
    let teams = [];
    let playersSource = [...allPlayers];

    if (teamSize === 1) {
        // Randomize for 1v1
        playersSource = shuffleArray(playersSource);
        for (let i = 0; i < playersSource.length; i++) {
            teams.push({
                name: playersSource[i],
                players: [playersSource[i]]
            });
        }
    } else {
        // Sequential for team modes
        for (let i = 0; i < playersSource.length; i += teamSize) {
            if (i + teamSize <= playersSource.length) {
                const teamPlayers = playersSource.slice(i, i + teamSize);
                teams.push({
                    name: `Team ${teams.length + 1}`,
                    players: teamPlayers
                });
            }
        }
    }

    // Fill teams up to bracket size with placeholders if needed
    while (teams.length < size) {
        teams.push({
            name: `Team ${teams.length + 1}`,
            players: Array(teamSize).fill("TBD")
        });
    }
    // Trim if too many
    if (teams.length > size) {
        teams = teams.slice(0, size);
    }

    // Calculate rounds
    let roundCount = Math.ceil(Math.log2(size));
    let matchesInRound = Math.pow(2, roundCount - 1);

    // First round
    let firstRound = [];
    for (let i = 0; i < matchesInRound; i++) {
        let team1 = teams[i * 2];
        let team2 = teams[i * 2 + 1];
        let player1Name = team1 ? formatTeamDisplay(team1.name, team1.players) : "TBD";
        let player2Name = team2 ? formatTeamDisplay(team2.name, team2.players) : "TBD";
        firstRound.push({
            id: `w-r1-m${i+1}`,
            player1: { name: player1Name, team: team1, score: 0 },
            player2: { name: player2Name, team: team2, score: 0 },
            winner: null
        });
    }
    tournament.rounds.push(firstRound);

    // Subsequent rounds
    for (let r = 1; r < roundCount; r++) {
        matchesInRound = matchesInRound / 2;
        let round = [];
        for (let m = 0; m < matchesInRound; m++) {
            round.push({
                id: `w-r${r+1}-m${m+1}`,
                player1: { name: "", score: 0 },
                player2: { name: "", score: 0 },
                winner: null
            });
        }
        tournament.rounds.push(round);
    }

    // Optionally: generate losers bracket here if eliminationType === 'double'
    // (reuse your existing logic for this part)

    renderBracket();
    updateMatchSelector();
    saveBracketToServer();
    showUpdateNotification('Bracket generated');
}

// Helper for team display
function formatTeamDisplay(teamName, players) {
    if (!players || players.length === 0) return teamName;
    return teamName + " (" + players.join(", ") + ")";
}

// Shuffle utility
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}


// New settings sync functions
function updateTournamentSettings() {
    tournament.settings = {
        teamSize: elements.teamSize.value,
        eliminationType: elements.eliminationType.value
    };
    saveBracketToServer();
}

// Helper function to format team display
function formatTeamDisplay(teamName, players) {
    if (!players || players.length === 0) return teamName;
    
    return teamName + " (" + players.join(", ") + ")";
}

// Generate losers bracket structure
function generateLosersBracket(winnerRoundCount) {
    // Losers bracket has 2*log2(n)-1 rounds for n participants
    const loserRoundCount = 2 * winnerRoundCount - 1;
    
    for (let r = 0; r < loserRoundCount; r++) {
        let matchesInRound;
        if (r % 2 === 0) { // Rounds that receive drops from winners bracket
            const winnerRound = Math.floor(r / 2);
            matchesInRound = Math.pow(2, winnerRoundCount - winnerRound - 1) / 2;
        } else { // Consolidation rounds
            const prevRound = r - 1;
            matchesInRound = tournament.losersRounds[prevRound].length / 2;
        }
        
        let round = [];
        for (let m = 0; m < matchesInRound; m++) {
            round.push({
                id: `l-r${r+1}-m${m+1}`,
                player1: { name: "", score: 0 },
                player2: { name: "", score: 0 },
                winner: null
            });
        }
        tournament.losersRounds.push(round);
    }
    
    // Add the grand final match
    tournament.finalMatch = {
        id: `final-m1`,
        player1: { name: "", score: 0 }, // Winners bracket winner
        player2: { name: "", score: 0 }, // Losers bracket winner
        winner: null
    };
}

function renderBracket() {
    elements.bracketContainer.innerHTML = '';
    
    if (tournament.rounds.length === 0) {
        elements.noTournament.style.display = 'block';
        return;
    }
    
    elements.noTournament.style.display = 'none';
    
    // Create container for the entire bracket display
    const allBracketsContainer = document.createElement('div');
    allBracketsContainer.className = 'all-brackets-container';
    
    // Create winners bracket container
    const winnersBracketContainer = document.createElement('div');
    winnersBracketContainer.className = 'bracket-container winners-bracket';
    
    // Add winners bracket title
    const winnersTitle = document.createElement('h3');
    winnersTitle.textContent = 'Winners Bracket';
    winnersTitle.className = 'bracket-title';
    winnersBracketContainer.appendChild(winnersTitle);
    
    // Add winners bracket rounds
    tournament.rounds.forEach((round, roundIndex) => {
        const roundEl = document.createElement('div');
        roundEl.className = 'bracket-round';
        
        // Round title
        const roundTitle = document.createElement('div');
        roundTitle.className = 'bracket-round-title';
        
        if (roundIndex === tournament.rounds.length - 1) {
            roundTitle.textContent = 'Final';
        } else if (roundIndex === tournament.rounds.length - 2) {
            roundTitle.textContent = 'Semifinals';
        } else if (roundIndex === tournament.rounds.length - 3) {
            roundTitle.textContent = 'Quarterfinals';
        } else {
            roundTitle.textContent = `Round ${roundIndex + 1}`;
        }
        
        roundEl.appendChild(roundTitle);
        
        // Add each match in this round
        round.forEach(match => {
            const matchEl = document.createElement('div');
            matchEl.className = 'bracket-match';
            matchEl.dataset.matchId = match.id;
            
            // Player 1
            const player1El = document.createElement('div');
            player1El.className = `bracket-player ${match.winner === 1 ? 'bracket-winner' : ''}`;
            
            const player1Name = document.createElement('div');
            player1Name.className = 'bracket-player-name';
            player1Name.textContent = match.player1.name || '-';
            
            const player1Score = document.createElement('div');
            player1Score.className = 'bracket-player-score';
            player1Score.textContent = match.player1.score;
            
            player1El.appendChild(player1Name);
            player1El.appendChild(player1Score);
            
            // Player 2
            const player2El = document.createElement('div');
            player2El.className = `bracket-player ${match.winner === 2 ? 'bracket-winner' : ''}`;
            
            const player2Name = document.createElement('div');
            player2Name.className = 'bracket-player-name';
            player2Name.textContent = match.player2.name || '-';
            
            const player2Score = document.createElement('div');
            player2Score.className = 'bracket-player-score';
            player2Score.textContent = match.player2.score;
            
            player2El.appendChild(player2Name);
            player2El.appendChild(player2Score);
            
            matchEl.appendChild(player1El);
            matchEl.appendChild(player2El);
            
            roundEl.appendChild(matchEl);
        });
        
        winnersBracketContainer.appendChild(roundEl);
    });
    
    allBracketsContainer.appendChild(winnersBracketContainer);
    
    // If double elimination, render losers bracket
    if (tournament.eliminationType === 'double' && tournament.losersRounds.length > 0) {
        // Create losers bracket container
        const losersBracketContainer = document.createElement('div');
        losersBracketContainer.className = 'bracket-container losers-bracket';
        
        // Add losers bracket title
        const losersTitle = document.createElement('h3');
        losersTitle.textContent = 'Losers Bracket';
        losersTitle.className = 'bracket-title';
        losersBracketContainer.appendChild(losersTitle);
        
        // Add losers bracket rounds
        tournament.losersRounds.forEach((round, roundIndex) => {
            const roundEl = document.createElement('div');
            roundEl.className = 'bracket-round';
            
            // Round title
            const roundTitle = document.createElement('div');
            roundTitle.className = 'bracket-round-title';
            roundTitle.textContent = `Round ${roundIndex + 1}`;
            
            roundEl.appendChild(roundTitle);
            
            // Add each match in this round
            round.forEach(match => {
                const matchEl = document.createElement('div');
                matchEl.className = 'bracket-match';
                matchEl.dataset.matchId = match.id;
                
                // Player 1
                const player1El = document.createElement('div');
                player1El.className = `bracket-player ${match.winner === 1 ? 'bracket-winner' : ''}`;
                
                const player1Name = document.createElement('div');
                player1Name.className = 'bracket-player-name';
                player1Name.textContent = match.player1.name || '-';
                
                const player1Score = document.createElement('div');
                player1Score.className = 'bracket-player-score';
                player1Score.textContent = match.player1.score;
                
                player1El.appendChild(player1Name);
                player1El.appendChild(player1Score);
                
                // Player 2
                const player2El = document.createElement('div');
                player2El.className = `bracket-player ${match.winner === 2 ? 'bracket-winner' : ''}`;
                
                const player2Name = document.createElement('div');
                player2Name.className = 'bracket-player-name';
                player2Name.textContent = match.player2.name || '-';
                
                const player2Score = document.createElement('div');
                player2Score.className = 'bracket-player-score';
                player2Score.textContent = match.player2.score;
                
                player2El.appendChild(player2Name);
                player2El.appendChild(player2Score);
                
                matchEl.appendChild(player1El);
                matchEl.appendChild(player2El);
                
                roundEl.appendChild(matchEl);
            });
            
            losersBracketContainer.appendChild(roundEl);
        });
        
        allBracketsContainer.appendChild(losersBracketContainer);
        
        // Add grand final if it exists
        if (tournament.finalMatch) {
            const finalContainer = document.createElement('div');
            finalContainer.className = 'bracket-container final-bracket';
            
            const finalTitle = document.createElement('h3');
            finalTitle.textContent = 'Grand Final';
            finalTitle.className = 'bracket-title';
            finalContainer.appendChild(finalTitle);
            
            const roundEl = document.createElement('div');
            roundEl.className = 'bracket-round';
            
            const matchEl = document.createElement('div');
            matchEl.className = 'bracket-match';
            matchEl.dataset.matchId = tournament.finalMatch.id;
            
            // Player 1 (Winners Bracket winner)
            const player1El = document.createElement('div');
            player1El.className = `bracket-player ${tournament.finalMatch.winner === 1 ? 'bracket-winner' : ''}`;
            
            const player1Name = document.createElement('div');
            player1Name.className = 'bracket-player-name';
            player1Name.textContent = tournament.finalMatch.player1.name || '- (Winners Bracket)';
            
            const player1Score = document.createElement('div');
            player1Score.className = 'bracket-player-score';
            player1Score.textContent = tournament.finalMatch.player1.score;
            
            player1El.appendChild(player1Name);
            player1El.appendChild(player1Score);
            
            // Player 2 (Losers Bracket winner)
            const player2El = document.createElement('div');
            player2El.className = `bracket-player ${tournament.finalMatch.winner === 2 ? 'bracket-winner' : ''}`;
            
            const player2Name = document.createElement('div');
            player2Name.className = 'bracket-player-name';
            player2Name.textContent = tournament.finalMatch.player2.name || '- (Losers Bracket)';
            
            const player2Score = document.createElement('div');
            player2Score.className = 'bracket-player-score';
            player2Score.textContent = tournament.finalMatch.player2.score;
            
            player2El.appendChild(player2Name);
            player2El.appendChild(player2Score);
            
            matchEl.appendChild(player1El);
            matchEl.appendChild(player2El);
            
            roundEl.appendChild(matchEl);
            finalContainer.appendChild(roundEl);
            
            allBracketsContainer.appendChild(finalContainer);
        }
    }
    
    elements.bracketContainer.appendChild(allBracketsContainer);
}

function updateMatchSelector() {
    elements.matchSelector.innerHTML = '';
    
    // Add winners bracket option group
    const winnersOptgroup = document.createElement('optgroup');
    winnersOptgroup.label = 'Winners Bracket';
    
    tournament.rounds.forEach((round, roundIndex) => {
        let roundName = '';
        
        if (roundIndex === tournament.rounds.length - 1) {
            roundName = 'Final';
        } else if (roundIndex === tournament.rounds.length - 2) {
            roundName = 'Semifinals';
        } else if (roundIndex === tournament.rounds.length - 3) {
            roundName = 'Quarterfinals';
        } else {
            roundName = `Round ${roundIndex + 1}`;
        }
        
        round.forEach((match, matchIndex) => {
            if (match.player1.name || match.player2.name) {
                const option = document.createElement('option');
                option.value = match.id;
                option.textContent = `${roundName} - Match ${matchIndex + 1}: ${match.player1.name || '-'} vs ${match.player2.name || '-'}`;
                winnersOptgroup.appendChild(option);
            }
        });
    });
    
    if (winnersOptgroup.children.length > 0) {
        elements.matchSelector.appendChild(winnersOptgroup);
    }
    
    // Add losers bracket option group if there is one
    if (tournament.eliminationType === 'double' && tournament.losersRounds.length > 0) {
        const losersOptgroup = document.createElement('optgroup');
        losersOptgroup.label = 'Losers Bracket';
        
        tournament.losersRounds.forEach((round, roundIndex) => {
            round.forEach((match, matchIndex) => {
                if (match.player1.name || match.player2.name) {
                    const option = document.createElement('option');
                    option.value = match.id;
                    option.textContent = `Round ${roundIndex + 1} - Match ${matchIndex + 1}: ${match.player1.name || '-'} vs ${match.player2.name || '-'}`;
                    losersOptgroup.appendChild(option);
                }
            });
        });
        
        if (losersOptgroup.children.length > 0) {
            elements.matchSelector.appendChild(losersOptgroup);
        }
        
        // Add grand final match if it exists
        if (tournament.finalMatch && (tournament.finalMatch.player1.name || tournament.finalMatch.player2.name)) {
            const finalOptgroup = document.createElement('optgroup');
            finalOptgroup.label = 'Grand Final';
            
            const option = document.createElement('option');
            option.value = tournament.finalMatch.id;
            option.textContent = `${tournament.finalMatch.player1.name || '- (Winners)'} vs ${tournament.finalMatch.player2.name || '- (Losers)'}`;
            finalOptgroup.appendChild(option);
            
            elements.matchSelector.appendChild(finalOptgroup);
        }
    }
}

function findMatch(matchId) {
    // Check winners bracket
    for (let r = 0; r < tournament.rounds.length; r++) {
        for (let m = 0; m < tournament.rounds[r].length; m++) {
            if (tournament.rounds[r][m].id === matchId) {
                return {
                    match: tournament.rounds[r][m],
                    roundIndex: r,
                    matchIndex: m,
                    isLosersBracket: false
                };
            }
        }
    }
    
    // Check losers bracket if it exists
    if (tournament.eliminationType === 'double' && tournament.losersRounds) {
        for (let r = 0; r < tournament.losersRounds.length; r++) {
            for (let m = 0; m < tournament.losersRounds[r].length; m++) {
                if (tournament.losersRounds[r][m].id === matchId) {
                    return {
                        match: tournament.losersRounds[r][m],
                        roundIndex: r,
                        matchIndex: m,
                        isLosersBracket: true
                    };
                }
            }
        }
    }
    
    // Check grand final
    if (tournament.finalMatch && tournament.finalMatch.id === matchId) {
        return {
            match: tournament.finalMatch,
            isFinalMatch: true
        };
    }
    
    return null;
}

function showMatchEditor(match, isLosersBracket) {
    elements.matchEditArea.innerHTML = '';
    
    if (!match.player1.name && !match.player2.name) {
        elements.matchEditArea.innerHTML = '<p>This match does not have players yet.</p>';
        return;
    }
    
    const editForm = document.createElement('div');
    editForm.className = 'match-editor';
    
    // Player 1 editor
    const player1Div = document.createElement('div');
    player1Div.className = 'match-player-edit';
    
    const player1Label = document.createElement('label');
    player1Label.textContent = match.player1.name || 'Player 1';
    player1Label.htmlFor = `${match.id}-player1-score`;
    
    const player1Input = document.createElement('input');
    player1Input.type = 'number';
    player1Input.min = '0';
    player1Input.id = `${match.id}-player1-score`;
    player1Input.className = 'score-input';
    player1Input.value = match.player1.score;
    
    player1Div.appendChild(player1Label);
    player1Div.appendChild(player1Input);
    
    // Player 2 editor
    const player2Div = document.createElement('div');
    player2Div.className = 'match-player-edit';
    
    const player2Label = document.createElement('label');
    player2Label.textContent = match.player2.name || 'Player 2';
    player2Label.htmlFor = `${match.id}-player2-score`;
    
    const player2Input = document.createElement('input');
    player2Input.type = 'number';
    player2Input.min = '0';
    player2Input.id = `${match.id}-player2-score`;
    player2Input.className = 'score-input';
    player2Input.value = match.player2.score;
    
    player2Div.appendChild(player2Label);
    player2Div.appendChild(player2Input);
    
    editForm.appendChild(player1Div);
    editForm.appendChild(player2Div);
    
    const updateButton = document.createElement('button');
    updateButton.className = 'admin-button primary';
    updateButton.textContent = 'Update Score';
    updateButton.addEventListener('click', async () => {
        if (!(await checkAdminAuth())) {
            alert('Session expired. Please login again.');
            elements.loginOverlay.style.display = 'flex';
            elements.adminContent.style.display = 'none';
            return;
        }
        
        updateMatch(
            match.id,
            player1Input.value,
            player2Input.value,
            isLosersBracket
        );
    });
    
    const editButtonArea = document.createElement('div');
    editButtonArea.className = 'admin-controls';
    editButtonArea.style.marginTop = '1rem';
    editButtonArea.appendChild(updateButton);
    
    editForm.appendChild(editButtonArea);
    
    elements.matchEditArea.appendChild(editForm);
}

async function updateMatch(matchId, player1Score, player2Score, isLosersBracket) {
    const matchInfo = findMatch(matchId);
    if (!matchInfo) return;
    
    const { match, roundIndex, matchIndex, isFinalMatch } = matchInfo;
    
    // Update scores
    match.player1.score = parseInt(player1Score) || 0;
    match.player2.score = parseInt(player2Score) || 0;
    
    // Determine winner
    if (match.player1.score > match.player2.score) {
        match.winner = 1;
    } else if (match.player2.score > match.player1.score) {
        match.winner = 2;
    } else {
        match.winner = null;
    }
    
    // Handle advancement in the bracket
    if (match.winner) {
        const winnerTeam = match.winner === 1 ? match.player1 : match.player2;
        const loserTeam = match.winner === 2 ? match.player1 : match.player2;
        
        if (isFinalMatch) {
            // Grand final - tournament is over
        } else if (isLosersBracket) {
            // Losers bracket
            if (roundIndex < tournament.losersRounds.length - 1) {
                // Advance to next round in losers bracket
                const nextRoundIndex = roundIndex + 1;
                const nextMatchIndex = Math.floor(matchIndex / 2);
                
                if (nextRoundIndex < tournament.losersRounds.length) {
                    const nextMatch = tournament.losersRounds[nextRoundIndex][nextMatchIndex];
                    
                    // Determine which player slot (first or second) based on match index
                    const isFirstMatch = matchIndex % 2 === 0;
                    if (isFirstMatch) {
                        nextMatch.player1 = { ...winnerTeam, score: 0 };
                    } else {
                        nextMatch.player2 = { ...winnerTeam, score: 0 };
                    }
                }
            } else if (roundIndex === tournament.losersRounds.length - 1 && tournament.finalMatch) {
                // Final loser's bracket match, winner goes to grand final
                tournament.finalMatch.player2 = { ...winnerTeam, score: 0 };
            }
        } else {
            // Winners bracket
            if (roundIndex < tournament.rounds.length - 1) {
                // Advance to next round in winners bracket
                const nextRoundIndex = roundIndex + 1;
                const nextMatchIndex = Math.floor(matchIndex / 2);
                const nextMatch = tournament.rounds[nextRoundIndex][nextMatchIndex];
                
                // Determine which player slot (first or second) based on match index
                const isFirstMatch = matchIndex % 2 === 0;
                if (isFirstMatch) {
                    nextMatch.player1 = { ...winnerTeam, score: 0 };
                } else {
                    nextMatch.player2 = { ...winnerTeam, score: 0 };
                }
                
                // If this is the final winners bracket match and we have a grand final
                if (roundIndex === tournament.rounds.length - 2 && tournament.finalMatch) {
                    tournament.finalMatch.player1 = { ...winnerTeam, score: 0 };
                }
            }
            
            // Send loser to losers bracket if double elimination
            if (tournament.eliminationType === 'double' && loserTeam.name) {
                // Determine which losers round to send to based on winner bracket round
                const loserRoundIndex = roundIndex * 2; // First drop-down round
                
                if (loserRoundIndex < tournament.losersRounds.length) {
                    const loserMatchIndex = Math.floor(matchIndex / 2);
                    
                    if (tournament.losersRounds[loserRoundIndex][loserMatchIndex]) {
                        // Determine which player slot (first or second) based on match index
                        const isFirstMatch = matchIndex % 2 === 0;
                        
                        if (isFirstMatch) {
                            tournament.losersRounds[loserRoundIndex][loserMatchIndex].player1 = { 
                                ...loserTeam,
                                score: 0 
                            };
                        } else {
                            tournament.losersRounds[loserRoundIndex][loserMatchIndex].player2 = { 
                                ...loserTeam,
                                score: 0 
                            };
                        }
                    }
                }
            }
        }
    }
    
    renderBracket();
    updateMatchSelector();
    await saveBracketToServer();
    showUpdateNotification('Match updated');
}

// Server communication functions
async function saveBracketToServer() {
    try {
        const response = await fetch('php/save_bracket.php', {
            method: 'POST',
            body: JSON.stringify(tournament),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to save bracket');
        console.log('Bracket saved to server');
    } catch (error) {
        console.error('Error saving bracket:', error);
        // Fallback to localStorage if server fails
        localStorage.setItem('tournamentBracket', JSON.stringify(tournament));
    }
}

async function loadBracketFromServer() {
    try {
        const response = await fetch('php/load_bracket.php');
        const data = await response.json();
        
        if (data) {
            // Migrate old brackets
            if (!data.settings) {
                data.settings = {
                    teamSize: data.teamSize || 1,
                    eliminationType: data.eliminationType || 'single'
                };
            }
            
            tournament = data;
            elements.teamSize.value = tournament.settings.teamSize;
            elements.eliminationType.value = tournament.settings.eliminationType;
            renderPlayerList(allPlayers);
            renderBracket();
        }
    } catch (error) {
        console.error('Error loading bracket:', error);
        // Fallback to localStorage if server fails
        const saved = localStorage.getItem('tournamentBracket');
        if (saved) {
            tournament = JSON.parse(saved);
            renderBracket();
            updateMatchSelector();
        }
    }
}

// Auto-refresh functionality
function setupAutoRefresh() {
    // Update refresh time display
    function updateRefreshTime() {
        const now = new Date();
        const nextUpdate = new Date(now.getTime() + 60000);
        elements.refreshIndicator.textContent = `Next update: ${nextUpdate.toLocaleTimeString()}`;
    }
    
    // Refresh content function
    async function refreshContent() {
        
         const prevSettings = { ...tournament.settings };
        // Visual feedback
        elements.refreshIndicator.style.animation = 'flash 1s';
        setTimeout(() => elements.refreshIndicator.style.animation = '', 1000);
        
        // Check admin status
        const isAdmin = await checkAdminAuth();
        if (isAdmin) {
            elements.loginOverlay.style.display = 'none';
            elements.adminContent.style.display = 'block';
        } else {
            elements.adminContent.style.display = 'none';
        }
        
        // Update content
        await loadBracketFromServer();
        if (isAdmin) {
            await loadPlayers();
        }
        
        updateRefreshTime();
        showUpdateNotification('Content updated');
        
        elements.teamSize.value = tournament.settings.teamSize;
    elements.eliminationType.value = tournament.settings.eliminationType;
    renderPlayerList(allPlayers);
    
    // Force bracket redraw if settings changed
    if (JSON.stringify(prevSettings) !== JSON.stringify(tournament.settings)) {
        renderBracket();
    }
    }
    
    // Initial refresh
    refreshContent();
    
    // Set up interval for auto-refresh
    setInterval(refreshContent, 60000);
}

// Utility functions
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    
    // While there remain elements to shuffle
    while (currentIndex != 0) {
        // Pick a remaining element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        
        // And swap it with the current element
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    
    return array;
}

function showUpdateNotification(message) {
    const note = document.createElement('div');
    note.className = 'update-notification';
    note.textContent = message;
    document.body.appendChild(note);
    
    setTimeout(() => note.remove(), 3000);
}
