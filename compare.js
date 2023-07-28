//Current guild
var sGuild = "";

//Get URL parameters and store them
function getParams() {
    let sUrlParams = window.location.search.slice(1);
    sUrlParams.split("&").forEach((oParam) => {
        const oValues = oParam.split("=");
        switch (oValues[0]) {
            case "guild":
                sGuild = oValues[1].toUpperCase();
                break;
        }
    });
}

//Parse the information into a table
function parseDataIntoTable(oData) {
    //Header and json properties
    const aProperties = ["name", "oldGP", "newGP", "loggedIn", "notes"];
    const aHeader = ["Name", "Old GP", "New GP", "Logged In?", "Notes"];

    //Create the table
    const oTable = document.createElement("table");
    oTable.style.width = "75%";

    //Create a new row and add all the headers
    const oTr = oTable.insertRow();
    aHeader.forEach((sHeader, iIndex) => {
        const oTd = oTr.insertCell();

        //For table sorting we need two function, one to handle the default sorting and the other for the values to compare
        var fHandleOrder = function () {
            switch(iIndex){
                case 1:
                case 2:
                    return "desc";
                default:
                    return "asc";
            }
        }
        var fHandleValues = function (x, y) {
            switch (iIndex) {
                case 0:
                case 3:
                case 4:
                    return [x.innerHTML.toLowerCase(), y.innerHTML.toLowerCase()];
                case 1:
                case 2:
                    return [x.innerHTML * 1, y.innerHTML * 1];
            }
        }

        oTd.addEventListener("click", () => sortTable(oTable, iIndex, fHandleOrder, fHandleValues));
        oTd.style = "font-weight: bold;text-align: center;cursor: pointer";
        oTd.appendChild(document.createTextNode(sHeader));
    });

    //Loop all the members and create rows
    for (const sMember in oData["d"]) {
        const oTr = oTable.insertRow();
        aProperties.forEach((sProp, i) => {
            const oTd = oTr.insertCell();
            const sVal = oData["d"][sMember][sProp].toString();

            //Depending on the index we want the content to be slighly formatted
            switch (i) {
                case 1:
                case 2:
                case 3:
                    oTd.style = "text-align: center";
                    oTd.appendChild(document.createTextNode(`${sVal}`));
                    break;
                default:
                    oTd.appendChild(document.createTextNode(`${sVal}`));
                    break;
            }
        });
    };

    return oTable;

}

//Get the url params
getParams();

// Fetch the local json file and parse all the information
fetch(`data/Comparison_${sGuild}GuildData.json`)
    .then(res => res.json())
    .then(data => {
        //Set logo url
        document.getElementById("logo").src = `res/logos/${sGuild}.png`

        //Add timestamp
        let [sOldDate, sCurrentDate] = data["t"].split("-");
        document.getElementById("dTimestamp").appendChild(document.createTextNode(`Comparing data from ${new Date(sOldDate * 1000).toLocaleDateString()} to ${new Date(sCurrentDate * 1000).toLocaleDateString()}`));

        //Parse the data into a table
        document.getElementById("dComparison").appendChild(parseDataIntoTable(data));
    });