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
    const aProperties = ["g", "c", "a", "d", "e", "f"];
    const aHeader = ["Rank", "Class", "Name", "Level", "GP", "Bonus"];

    //Create the table
    const oTable = document.createElement("table");
    oTable.style.width = "75%";

    //Create a new row and add all the headers
    const oTr = oTable.insertRow();
    aHeader.forEach((sHeader, iIndex) => {
        const oTd = oTr.insertCell();

        //For table sorting we need two function, one to handle the default sorting and the other for the values to compare
        var fHandleOrder = function () {
            switch (iIndex) {
                case 0:
                case 1:
                case 2:
                    return "asc";
                default:
                    return "desc";
            }
        }
        var fHandleValues = function (x, y) {
            switch (iIndex) {
                case 0:
                case 1:
                case 5:
                    return [x.firstElementChild.alt * 1, y.firstElementChild.alt * 1];
                case 2:
                    return [x.innerHTML.toLowerCase(), y.innerHTML.toLowerCase()];
                case 3:
                case 4:
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
                case 0:
                    const oImgRank = document.createElement("img");
                    oImgRank.src = `res/ranks/${sVal}.png`;
                    oImgRank.alt = `${sVal}`;
                    oImgRank.title = oRanks[sVal]
                    oTd.style = "text-align: center";
                    oTd.appendChild(oImgRank);
                    break;
                case 1:
                    const oImgClass = document.createElement("img");
                    oImgClass.src = `res/classes/${sVal}.png`;
                    oImgClass.alt = `${sVal}`;
                    oImgClass.title = oClass[sVal]
                    oTd.style = "text-align: center";
                    oTd.appendChild(oImgClass);
                    break;
                case 2:
                    oTd.appendChild(document.createTextNode(`${sVal}`));
                    break;
                case 3:
                case 4:
                    oTd.style = "text-align: center";
                    oTd.appendChild(document.createTextNode(`${sVal}`));
                    break;
                case 5:
                    const oImgBonus = document.createElement("img");
                    oImgBonus.src = (sVal === "-1") ? "res/bonus/0.png" : `res/bonus/${sVal}.png`;
                    oImgBonus.alt = `${sVal}`;
                    oImgBonus.title = oBonus[sVal]
                    oTd.style = "text-align: center";
                    oTd.appendChild(oImgBonus);
                    break;
            }
        });
    };

    return oTable;
}

//Get the url params
getParams();

//Fetch the local json file and parse all the information
fetch(`data/${sGuild}GuildData.json`)
    .then(res => res.json())
    .then(data => {
        //Set logo url
        document.getElementById("logo").src = `res/logos/${sGuild}.png`

        //Update page title
        document.title = `${document.title} - ${sGuild}`;

        //Add link for comparison page
        const oLink = document.createElement("a");
        oLink.href = `compare.html?guild=${sGuild}`;
        oLink.textContent = "Compare to previous snapshot";
        document.getElementById("dComparison").appendChild(oLink);

        //Add timestamp
        document.getElementById("dTimestamp").appendChild(document.createTextNode(`Last updated on: ${new Date(data["t"] * 1000).toLocaleDateString()}`));

        //Parse the data into a table
        document.getElementById("dGP").appendChild(parseDataIntoTable(data));
    });