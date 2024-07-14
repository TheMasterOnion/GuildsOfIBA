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

//Navigate back
function navBack() {
    window.history.back();
}

//Parse the information into a table
function parseDataIntoTable(oData) {
    //Header and json properties
    const aProperties = ["name", "oldGP", "newGP", "gpChange","loggedIn", "notes"];
    const aHeader = ["Name", "Old GP", "New GP", "GP Change","Logged In? (Streak)", "Notes"];

    //Create the table
    const oTable = document.createElement("table");
    oTable.classList.add("tableCustomization");

    //Create a new row and add all the headers
    const oTr = oTable.insertRow();
    aHeader.forEach((sHeader, iIndex) => {
        const oTd = oTr.insertCell();

        //For table sorting we need two function, one to handle the default sorting and the other for the values to compare
        var fHandleOrder = function () {
            switch(iIndex){
                case 1:
                case 2:
                case 3:
                    return "desc";
                default:
                    return "asc";
            }
        }
        var fHandleValues = function (x, y) {
            switch (iIndex) {
                case 0:
                case 4:
                case 5:
                    return [x.innerHTML.toLowerCase(), y.innerHTML.toLowerCase()];
                case 1:
                case 2:
                    return [x.innerHTML * 1, y.innerHTML * 1];
                case 3:
                    return [x.children[0].dataset.value * 1, y.children[0].dataset.value * 1];
            }
        }

        oTd.addEventListener("click", () => sortTable(oTable, iIndex, fHandleOrder, fHandleValues));
        oTd.classList.add("tableHeaders");
        oTd.appendChild(document.createTextNode(sHeader));
    });

    //Loop all the members and create rows
    for (const sMember in oData["d"]) {
        const oTr = oTable.insertRow();
        
        //Placing it here instead of case 3: so we can access it to add the blue color 
        const oSpanGPChange = document.createElement("span");
        aProperties.forEach((sProp, i) => {
            const oTd = oTr.insertCell();
            const sVal = oData["d"][sMember][sProp].toString();

            //Depending on the index we want the content to be slighly formatted
            switch (i) {
                case 1:
                case 2:
                    oTd.classList.add("textAlignCenter");
                    oTd.appendChild(document.createTextNode(`${sVal}`));
                    break;
                case 3:
                    oTd.classList.add("textAlignCenter");
                    const iVal = sVal * 1;

                    // Less than 0 paint it red
                    // Between 0 and 100 (excluding 100) paint it orange
                    // Between 100 and 250 (exclude 250) paint it yellow
                    // Else, paint it green
                    if (iVal <= 0) {
                        oSpanGPChange.classList.add("negativeValue");
                        oSpanGPChange.appendChild(document.createTextNode(`${sVal} GP`));
                    } else if (iVal > 0 && iVal < 100) {
                        oSpanGPChange.classList.add("notEnoughValue");
                        oSpanGPChange.appendChild(document.createTextNode(`+${sVal} GP`));
                    } else if (iVal >= 100 && iVal < 250) {
                        oSpanGPChange.classList.add("mediumValue");
                        oSpanGPChange.appendChild(document.createTextNode(`+${sVal} GP`));
                    } else {
                        oSpanGPChange.classList.add("positiveValue");
                        oSpanGPChange.appendChild(document.createTextNode(`+${sVal} GP`));
                    }

                    oSpanGPChange.dataset.value = sVal;
                    
                    oTd.appendChild(oSpanGPChange);
                    break;
                case 4:
                    oTd.classList.add("textAlignCenter");
                    const sLogoutStreak = oData["d"][sMember]["logoutStreak"].toString()

                    // Grab the logout streak if there's any
                    if (sVal === "Yes" || (sVal === "No" && sLogoutStreak === "0")) {
                        oTd.appendChild(document.createTextNode(`${sVal}`));
                    } else {
                        oTd.appendChild(document.createTextNode(`${sVal} (${sLogoutStreak})`));
                    }

                    //If there's a logout streak and it's bigger than 1 then remove the red color and paint it blue
                    if (sLogoutStreak !== "0" && sLogoutStreak !== "1") {
                        oSpanGPChange.classList.remove("negativeValue");
                        oSpanGPChange.classList.add("twoWeeksOut");
                    }

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

        //Update page title
        document.title = `${document.title} - ${sGuild}`;

        //Add timestamp
        let [sOldDate, sCurrentDate] = data["t"].split("-");
        document.getElementById("dTimestamp").appendChild(document.createTextNode(`Comparing data from ${new Date(sOldDate * 1000).toLocaleDateString()} to ${new Date(sCurrentDate * 1000).toLocaleDateString()}`));

        //Parse the data into a table
        document.getElementById("dComparison").appendChild(parseDataIntoTable(data));
    });