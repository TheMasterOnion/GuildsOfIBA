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

//Add the selected members data to the popup then open it
function openProfileCard(oMember) {
    //Class icon
    document.getElementById("imgProfileClassIcon").src = `res/classes/${oMember["c"]}.png`

    //Character name
    document.getElementById("spanProfileName").textContent = oMember["a"]

    //Character level
    document.getElementById("spanProfileLevel").textContent = oMember["d"];

    //Current GP
    document.getElementById("spanProfileGP").textContent = oMember["e"];

    //Guild Rank
    document.getElementById("spanProfileRank").textContent = oRanks[oMember["g"]];

    //Wanted bonus
    document.getElementById("spanProfileBonus").textContent = oBonus[oMember["f"]];

    // Join date
    var oDate = new Date(oMember["joinTimestamp"] * 1000)
    document.getElementById("spanProfileGuildDate").textContent = oDate.toLocaleDateString();

    //Known names
    var sKnownNames = "";

    oMember["knownNames"].forEach((sVal, i) => {
        if (i === 0) {
            sKnownNames += sVal
        } else {
            sKnownNames += `, ${sVal}`
        }
    });

    document.getElementById("spanProfileKnownNames").textContent = sKnownNames;

    //Open the popup
    document.getElementById("dDarkBox").classList.toggle("popupVisible");
    document.getElementById("dPopup").classList.toggle("popupVisible");
}

//Close the profile card
function closeProfileCard() {
    document.getElementById("dDarkBox").classList.toggle("popupVisible");
    document.getElementById("dPopup").classList.toggle("popupVisible");
}

//Parse the information into a table
function parseDataIntoTable(oData) {
    //Header and json properties
    const aProperties = ["g", "c", "a", "d", "e", "f"];
    const aHeader = ["Rank", "Class", "Name", "Level", "GP", "Bonus"];

    //Create the table
    const oTable = document.createElement("table");
    oTable.classList.add("tableCustomization");

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
                    return [x.firstElementChild.textContent.toLowerCase(), y.firstElementChild.textContent.toLowerCase()];
                case 3:
                case 4:
                    return [x.innerHTML * 1, y.innerHTML * 1];
            }
        }

        oTd.addEventListener("click", () => sortTable(oTable, iIndex, fHandleOrder, fHandleValues));
        oTd.classList.add("tableHeaders");
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
                    oTd.classList.add("textAlignCenter");
                    oTd.appendChild(oImgRank);
                    break;
                case 1:
                    const oImgClass = document.createElement("img");
                    oImgClass.src = `res/classes/${sVal}.png`;
                    oImgClass.alt = `${sVal}`;
                    oImgClass.title = oClass[sVal]
                    oTd.classList.add("textAlignCenter");
                    oTd.appendChild(oImgClass);
                    break;
                case 2:
                    const oSpanMember = document.createElement("span");
                    oSpanMember.textContent = `${sVal}`
                    oSpanMember.addEventListener("click", () => openProfileCard(oData["d"][sMember]));
                    oSpanMember.classList.add("clickable");
                    oTd.appendChild(oSpanMember);
                    break;
                case 3:
                case 4:
                    oTd.classList.add("textAlignCenter");
                    oTd.appendChild(document.createTextNode(`${sVal}`));
                    break;
                case 5:
                    const oImgBonus = document.createElement("img");
                    oImgBonus.src = (sVal === "-1") ? "res/bonus/0.png" : `res/bonus/${sVal}.png`;
                    oImgBonus.alt = `${sVal}`;
                    oImgBonus.title = oBonus[sVal]
                    oTd.classList.add("textAlignCenter");
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
fetch(`data/Parsed_${sGuild}GuildData.json`)
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