//Current guild
var sGuild = "";
var bPrevious = false;

//Get URL parameters and store them
function getParams() {
    let sUrlParams = window.location.search.slice(1);
    sUrlParams.split("&").forEach((oParam) => {
        const oValues = oParam.split("=");
        switch (oValues[0]) {
            case "guild":
                sGuild = oValues[1].toUpperCase();
                break;
            case "previous":
                bPrevious = true;
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
    const aProperties = ["name", "oldGP", "newGP", "gpChange", "loggedIn", "notes", "personalNotes"];
    const aHeader = ["Name", "Old GP", "New GP", "GP Change", "Logged In? (Streak)", "Notes", "Personal Notes"];

    //Create the table
    const oTable = document.createElement("table");
    oTable.classList.add("tableCompCustomization");

    //Create a new row and add all the headers
    const oTr = oTable.insertRow();
    aHeader.forEach((sHeader, iIndex) => {
        //Skip notes if in previous week
        if (iIndex == 6 && bPrevious) {
            return;
        }

        const oTd = oTr.insertCell();

        //For table sorting we need two functions, one to handle the default sorting and the other for the values to compare
        //Personal notes don't have sorting
        var fHandleOrder = function (iIndex) {
            switch (iIndex) {
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

        //If it corresponds to the index of the personal notes, just skip the click listener
        if (iIndex != 6) {
            oTd.addEventListener("click", () => sortTable(oTable, iIndex, fHandleOrder, fHandleValues));
            oTd.classList.add("tableHeaders");
        } else {
            oTd.classList.add("tableHeadersNonClickable");
        }
		
		//Add column specific classes
		switch (iIndex) {
			case 0:
				oTd.classList.add("tableHeaderName");
				break;
			case 1:
			case 2:
			case 3:
				oTd.classList.add("tableHeaderGP");
				break;
			case 4:
				oTd.classList.add("tableHeaderLogin");
				break;
			case 5:
			case 6:
				oTd.classList.add("tableHeaderNotes");
				oTd.classList.add("tableHeaderNotes");
				break;
		}

        oTd.appendChild(document.createTextNode(sHeader));
    });

    //Loop all the members and create rows
    for (const sMember in oData["d"]) {
        const oTr = oTable.insertRow();

        //Placing it here instead of case 3: so we can access it to add the blue color
        const oSpanGPChange = document.createElement("span");
        aProperties.forEach((sProp, i) => {

            //Skip notes if in previous week
            if (i == 6 && bPrevious) {
                return;
            }

            const oTd = oTr.insertCell();

            //Personal notes don't start with a value, it's loaded and populated afterwards
            if (sProp !== "personalNotes") {
                var sVal = oData["d"][sMember][sProp].toString();
            } else {
                var sVal = "";
            }

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
                case 6:
                    const oInput = document.createElement("input");
                    oInput.type = "text";
                    oInput.classList.add("notesInput");
                    oInput.id = `input${sMember}`;

                    //Add event to save (or delete) the note on focus out
                    oInput.addEventListener("focusout", (oEvent) => {
                        if (oEvent.target.value) {
                            updatePersonalNote(oEvent.target.id.slice(5), oEvent.target.value);
                        } else {
                            deletePersonalNote(oEvent.target.id.slice(5));
                        }

                    });
                    oTd.appendChild(oInput);
                    break;
                default:
                    oTd.appendChild(document.createTextNode(`${sVal}`));
                    break;
            }
        });
    };

    //Due to some CSS for scrollbars this table needs to return in a div
    const oDiv = document.createElement("div");
    oDiv.appendChild(oTable);

    return oDiv;

}

//Get the url params
getParams();

//Check if it's current week or previous week
if (bPrevious) {
    var sJSONLocation = `data/OldComparison_${sGuild}GuildData.json`;
} else {
    var sJSONLocation = `data/Comparison_${sGuild}GuildData.json`;

    //Add the previous week link if it's not already the previous week
    const oLink = document.createElement("a");
    oLink.href = `compare.html?guild=${sGuild}&previous`;
    oLink.textContent = "Previous week";
    document.getElementById("dPreviousWeek").appendChild(oLink);
}

// Fetch the json file
fetch(sJSONLocation)
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

        //After we load everything we create/load the DB
        //It's skipped if it's the previous week
        if (!bPrevious) {
            const oRequestDB = indexedDB.open("IBA_IndexedDB", 1);

            //Build the schema if the version of the DB changed or it's a first run
            oRequestDB.onupgradeneeded = function (oEvent) {
                //Add the DB reference to the global variable
                oDB = oEvent.target.result;

                //UUID as key, and guild as an index for retrieving the notes
                const oObjStore = oDB.createObjectStore("personalnotes", { keyPath: "uuid" });
                oObjStore.createIndex("guild", "guild", { unique: false });
            };

            //Error loading the IndexDB
            oRequestDB.onerror = function (event) {
                console.error('Error opening database:', event.target.errorCode);
            };

            //IndexDB was loaded successfully
            oRequestDB.onsuccess = function (oEvent) {
                //Add the DB reference to the global variable
                oDB = oEvent.target.result;

                //Grab all the notes for the current loaded guild
                const oRequest = oDB.transaction("personalnotes", "readonly").objectStore("personalnotes").index("guild").openCursor(IDBKeyRange.only(sGuild));

                oRequest.onsuccess = (oEvent) => {
                    const oCursor = oEvent.target.result;

                    if (oCursor) {
                        const oInput = document.getElementById(`input${oCursor.value.uuid}`);

                        if (!oInput) {
                            deletePersonalNote(oCursor.value.uuid);
                        } else {
                            oInput.value = oCursor.value.note;
                        }

                        oCursor.continue();
                    }
                };
            }
        }
    });

//DB Object
let oDB;

//Add new personal note
updatePersonalNote = function (sUuid, sNote) {
    const oRequest = oDB.transaction("personalnotes", "readwrite").objectStore("personalnotes").put({ uuid: sUuid, guild: sGuild, note: sNote });
}

deletePersonalNote = function (sUuid) {
    const oRequest = oDB.transaction("personalnotes", "readwrite").objectStore("personalnotes").delete(sUuid);
}