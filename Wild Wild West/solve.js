function solve() {
    const baseUrl = 'https://baas.kinvey.com/appdata/kid_HJnqwJxFN/players';
    const user = 'test';
    const pw = 'test';
    const base64Auth = btoa(user + ':' + pw);
    const headers = {
        'Authorization': 'Basic ' + base64Auth,
        'Content-type': 'application/json'
    };

    const defaultMoney = 500;
    const defaultBullets = 6;

    let currentPlayer;

    $('#addPlayer').click(addPlayer);
    let $canvas = $('#canvas');
    let $saveBtn = $('#save');
    let $reloadBtn = $('#reload');
    $saveBtn.click(save);
    $reloadBtn.click(reload);

    (async function startGame() {
        try {
            $saveBtn.show();
            $reloadBtn.show();
            $canvas.show();
            await getAllPlayers();
        } catch (err) {
            displayError(err);
        }
    })();

    async function save() {
        if (currentPlayer !== undefined) {
            try {
                await request(`${baseUrl}/${currentPlayer._id}`, 'PUT', headers, JSON.stringify(currentPlayer));

             clearInterval(canvas.intervalId);

             await getAllPlayers();
            } catch (err) {
                displayError(err);
            }
        }
    }

    function reload() {
        if (currentPlayer.money >= 60) {
            currentPlayer.money -= 60;
            currentPlayer.bullet += 6;
        }
    }

    async function playPlayer(e) {
        try {
            let playerId = $(e.target).parent().attr('data-id');
            let player = await request(`${baseUrl}/${playerId}`, 'GET', headers);
            currentPlayer = player;
            loadCanvas(player);

        } catch (err) {
            displayError(err);
        }
    }

    async function deletePlayer(e) {
        try {
            let id = $(e.target).parent().attr('data-id');
            await request(`${baseUrl}/${id}`, 'DELETE', headers);
            await getAllPlayers();
        } catch (err) {
            displayError(err);
        }
    }

    function loadPlayer(players) {
        let $playerContainer = $('#players');
        $playerContainer.empty();
        let fragment = document.createDocumentFragment();

        for (let player of players) {
            let $playerDiv = $(`<div class="player" data-id="${player._id}">
            <div class="row">
                <label>Name:</label>
                <label class="name">${player.name}</label>
            </div>
            <div class="row">
                <label>Money:</label>
                <label class="money">${player.money}</label>
            </div>
            <div class="row">
                <label>Bullets:</label>
                <label class="bullets">${player.bullet}</label>
            </div>
           <button class="play">Play</button>
            <button class="delete">Delete</button>
        </div>`);

            $playerDiv.find('button.play').click(playPlayer);
            $playerDiv.find('button.delete').click(deletePlayer);
            $playerDiv.appendTo(fragment);
        }

        $playerContainer.append(fragment);
    }

    function request(url, method, headers, data) {
        return $.ajax({
            url,
            method,
            headers,
            data
        });
    }

    function displayError(err) {
        alert(err);
    }

    async function addPlayer(e) {
        try {
            let $name = $('#addName');

            let data = JSON.stringify({
                name: $name.val(),
                bullet: defaultBullets,
                money: defaultMoney
            });

            await request(baseUrl, 'POST', headers, data);
            await getAllPlayers();
            $name.val('');
        } catch (err) {
            displayError(err);
        }
    }

    async function getAllPlayers() {
        try {
            let players = await request(baseUrl, 'GET', headers);
            loadPlayer(players);
        } catch (err) {
            displayError(err);
        }
    };
}