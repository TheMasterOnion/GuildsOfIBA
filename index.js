//Variables to save the fetch values if they were already loaded to not request again (rarely will be used, unless the user makes a mistake on the search string)
var oGuildData = {};

//Guild list
var aGuilds = [
    "IBA",
    "BIA",
    "LIA",
    "IWA",
    "DIA",
    "FIA",
    "IRA",
    "IPA"
];

//Search for a given member name, loads the guild data then calls searchResults function
function searchMember() {
    //Grab input text
    const oSearchInput = document.getElementById("inputSearch");
    const sSearchValue = oSearchInput.value;

    //If it's empty just ignore and do nothing
    if (!sSearchValue) {
        return;
    }

    //If data was already loaded just don't load again
    if (Object.keys(oGuildData).length !== 0) {
        searchResults(sSearchValue);
    } else {
        //Holds the promises before being resolved
        var aPromises = [];

        //Save all the fetch promises
        aGuilds.forEach((sUrl) => {
            aPromises.push(fetch(`data/Parsed_${sUrl}GuildData.json`));
        });

        //Now that we have all the promises, retrieve the data
        Promise.all(aPromises).then((oValues) => {
            oValues.forEach(async (oPromise, i) => {
                oGuildData[aGuilds[i]] = await oPromise.json();

                // When the for each ends call the function that will search and display the results
                if (i + 1 === aGuilds.length) {
                    searchResults(sSearchValue);
                }
            });
        });
    }
}

//Grabs the user input and compares it against all the guild data
function searchResults(sSearchString) {
    //Uppercased search string, makes it easier to search if we compare it to the uppercased version of the name
    const sUpperSearch = sSearchString.toUpperCase();

    //Clear detailed list
    const oDetailedList = document.getElementById("dlResultsList");

    oDetailedList.innerHTML = "";

    //Loop the guilds
    aGuilds.forEach((sGuild) => {
        //Holds the results for that guild currently being looped
        var aResults = [];

        //Holds the id of the member for the navigation part
        var aResultsIds = [];

        //Loop all the members for that specific guild
        Object.keys(oGuildData[sGuild]["d"]).forEach((sMember) => {
            //Since there are multiple characters there might be more than one match
            var bFound = false;
            var sResult = "";
            var oMember = oGuildData[sGuild]["d"][sMember];

            //Loop the know names list that contains all the names including their current display name
            oMember["knownNames"].forEach((sName) =>{
                //Check if string is included (using upper case)
                if (sName.toUpperCase().includes(sUpperSearch)) {
                    //If found check if it's the first time for that member, if not grab his display name and what name triggered the positive search result
                    if (bFound) {
                        sResult += `, ${sName}`;
                    } else {
                        bFound = true;
                        sResult = `${oMember["a"]} (${sName}`;
                    }
                }
            });

            //If there was a positive search through this member then we need to push it to the array of results for that guild
            if (bFound) {
                sResult += ")";
                aResults.push(sResult);
                aResultsIds.push(sMember);
            }
        });

        //Now that we finished parsing that guild let's populate the display
        //First create our dt element
        const oGuildDT = document.createElement("dt");
        oGuildDT.innerHTML = sGuild;

        oDetailedList.appendChild(oGuildDT);

        //Then populate with all the found entries if any
        if (aResults.length === 0) {
            const noResultsDD = document.createElement("dd");
            noResultsDD.innerHTML = "No results"
            oDetailedList.appendChild(noResultsDD);
        } else {
            aResults.forEach((sEntry, i) => {
                const resultsEntryDD = document.createElement("dd");
                const ahrefResult = document.createElement("a");

                ahrefResult.href = `details.html?guild=${sGuild}&member=${aResultsIds[i]}`
                ahrefResult.innerHTML = `• ${sEntry}`;

                resultsEntryDD.appendChild(ahrefResult);
                oDetailedList.appendChild(resultsEntryDD);
            });
        }
    });

    document.getElementById("dDarkBox").classList.toggle("popupVisible");
    document.getElementById("dPopup").classList.toggle("popupVisible");
}

//Close the search results
function closeSearch() {
    document.getElementById("dDarkBox").classList.toggle("popupVisible");
    document.getElementById("dPopup").classList.toggle("popupVisible");
}

//Add Enter as a possible way to search as well
document.getElementById("inputSearch").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      //Click the button
      document.getElementById("buttonSearch").click();
    }
  });

//Clear the input value that stays filled
document.getElementById("inputSearch").value = "";