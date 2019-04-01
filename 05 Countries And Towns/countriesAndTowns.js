function solve() {
    const baseUrl = 'https://baas.kinvey.com/appdata/kid_Sk7mfDsOV';
    const user = 'test';
    const pw = 'test';
    const base64Auth = btoa(user + ':' + pw);
    const headers = {
        'Authorization': 'Basic ' + base64Auth,
        'Content-type': 'application/json'
    };

    let $selectCountries = $('#countries');
    let $countryN = $('#selected-country');

    (function setEvents(){
        $selectCountries.on('change', loadTowns);
        $('#edit-country').on('click', editCountry);
        $('#delete-country').on('click',deleteCountry);
        $('#add-country').on('click', addCountry);
        $('#add-town-to-country').on('click', addTown);
    })();

    function makeRequest(url, method, headers, body) {
        return fetch(url, {
            method,
            headers,
            body
        });
    }

   let load = (async function loadCountries() {
        try {
            let url = `${baseUrl}/countries`;
            let result = await makeRequest(url, 'GET', headers);
            let resultAsJson = await result.json();
            renderCountries(resultAsJson);
        } catch (err) {
            displayError(err);
        }
    })();

    function displayError(err) {
        alert(err);
    }

    function renderCountries(countries) {
        let fragment = document.createDocumentFragment();

        let $defaultOp = $(`<option selected>Choose...</option>`);
        $defaultOp.appendTo(fragment);

        for (let country of countries) {
            let $option = ($(`<option id="${country._id}" value="${country.name}">${country.name}</option>`));
            $option.appendTo(fragment);
        }
        $selectCountries.html(fragment);
    }

    async function loadTowns(e) {
        let countryName = $(e.target).val();
        $countryN.val(`${countryName}`);

        let countryId = $('#countries option:selected').attr('id');
        let url = `${baseUrl}/towns/?query={"countryId":"${countryId}"}`;

        try {
            let result = await makeRequest(url, 'GET', headers);
            let resultAsJson = await result.json();

            if(resultAsJson.length > 0){
                renderTowns(resultAsJson);
            }else{
                $('#towns').empty();
            }
        } catch (err) {
            displayError(err);
        }
    }

    function renderTowns(towns) {
        let $liTown;
        let fragment = document.createDocumentFragment();

        for (let town of towns) {
           $liTown = ($(`<li id="${town._id}" class="list-group-item" style="margin-left: 1em">
                <input value="${town.name}">
                <button class="btn btn-primary my-1 edit-town">Edit</button>
                <button class="btn btn-secondary my-1 delete-town">Delete</button>
             </li>`));

            $liTown.find('.btn.btn-primary.my-1.edit-town').on('click', editTown.bind(this));
            $liTown.find('.btn.btn-secondary.my-1.delete-town').on('click', deleteTown.bind(this));

            $liTown.appendTo(fragment);
        }

      $('#towns').html(fragment);
    }

     async function addCountry(e) {
        e.stopPropagation();
        let $countryName = $('#countryName');
        let url = `${baseUrl}/countries`;
        let body = JSON.stringify({'name': $countryName.val()});

        try {
            let result = await makeRequest(url, 'POST', headers, body);
            await load();
            $countryName.val('');
        } catch (err) {
            displayError(err);
        }
    }

    async function deleteCountry(e) {
        e.stopPropagation();
        let countryId = $('#countries option:selected').attr('id');
        let url = `${baseUrl}/countries/${countryId}`;

        let towns = $('#towns').children();

        try {
            // await Promise.all([await makeRequest(url, 'DELETE', headers),
            //     await towns.map(async(t) => await deleteTown())]);

            await makeRequest(url, 'DELETE', headers);

            if(towns.length > 0){
                for(let town in towns){
                    await deleteTown();
                }
            }

            await load();
        } catch (err) {
            displayError(err);
        }
    }

    async function  deleteTown(e) {
        let townId = $(e.target).parent().attr('id');
        let url = `${baseUrl}/towns/${townId}`;
        let $towns = $('#towns');

        try{
            await makeRequest(url,'DELETE', headers);

            if($towns.children().length === 1){
                $towns.empty();
            }else{
                $(`#${townId}`).remove();
            }
        }catch(err){
            displayError(err);
        }
    }

    async function  addTown(e) {
        let countryId = $('#countries option:selected').attr('id');
        let url = `${baseUrl}/towns`;
        let $townName = $('#townName');

        if(countryId === undefined){
            alert('To add a town you should select a country.')
        }else{
            try{
                debugger;
                let result = await makeRequest(url, 'GET', headers);
                let towns = await result.json();

                if(towns.some(t => t.name === $townName)){
                    alert('Town already exists.');
                }

                let body = JSON.stringify({'name': $townName.val(), 'countryId': countryId});
                await makeRequest(url, 'POST', headers, body);
                $townName.val('');
            }catch (err) {
                displayError(err);
            }
        }

    }

    async function  editCountry(e) {
        e.stopPropagation();
        let data = JSON.stringify({"name": $countryN.val()});
        let countryId = $('#countries option:selected').attr('id');
        let url = `${baseUrl}/countries/${countryId}`;

        try {
            let result = await makeRequest(url, 'PUT', headers, data);
            $selectCountries.options.val($countryN).att('selected', 'selected');
            $selectCountries.change();
        } catch (err) {
            displayError(err);
        }
    }

    async function editTown(e) {
        e.stopPropagation();

        let name = $(e.target).parent().find('input').val();
        let townId = $(e.target).parent().attr('id');

        try {
            let url = `${baseUrl}/towns/${townId}`;
            let getTown = await makeRequest(url, 'GET', headers);
            let townAsJson = await getTown.json();

            let countryId = townAsJson.countryId;
            let data = JSON.stringify({"name": name, "countryId": countryId });

            await makeRequest(url, 'PUT', headers, data);
            //await load;
        } catch (err) {
            displayError(err);
        }
    }
}