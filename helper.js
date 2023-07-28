const oClass = {
    0: "0",
    1: "Beginner",
    2: "Journeyman",
    3: "Maestro",
    4: "Voidwalker",
    5: "Infinilyte",
    6: "Rage Basics",
    7: "Warrior",
    8: "Barbarian",
    9: "Squire",
    10: "Blood Berserker",
    11: "Death Bringer",
    12: "Divine Knight",
    13: "Royal Guardian",
    14: "Filler",
    15: "Filler",
    16: "Filler",
    17: "Filler",
    18: "Calm Basics",
    19: "Archer",
    20: "Bowman",
    21: "Hunter",
    22: "Siege Breaker",
    23: "Mayheim",
    24: "Wind Walker",
    25: "Beast Master",
    26: "Filler",
    27: "Filler",
    28: "Filler",
    29: "Filler",
    30: "Savvy Basics",
    31: "Mage",
    32: "Wizard",
    33: "Shaman",
    34: "Elemental Sorcerer",
    35: "Spiritual Monk",
    36: "Bubonic Conjuror",
    37: "Arcane Cultist",
    38: "Filler",
    39: "Filler",
    40: "Filler",
    41: "Filler",
};

const oBonus = {
    "-1": "Guild Gifts",
    0: "Guild Gifts",
    1: "Stat Runes",
    2: "Rucksack",
    3: "Power of Pow",
    4: "REM Fighting",
    5: "Make or Break",
    6: "Multi Tool",
    7: "Sleepy Skiller",
    8: "Coin Supercharger",
    9: "Bonus GP for small guilds",
    10: "Gold Charm",
    11: "Star Dazzle",
    12: "C2 Card Spotter",
    13: "Bestone",
    14: "Wait a Minute",
    15: "Craps",
    16: "Anotha One",
    17: "Wait a Minute 2",
};

const oRanks = {
    0: "Guild leader",
    1: "Guild officer",
    2: "Golden star",
    3: "Silver star",
    4: "Bronze star",
    5: "No star",
};

sStoredDir = "asc";
iStoredIndex = -1;

function sortTable(oTable, iIndex, fHandleOrder, fHandleValues) {
    var oTable,
        rows,
        switching = true,
        shouldSwitch;

    //Invert the sorting order
    if (iIndex === iStoredIndex) {
        sStoredDir = (sStoredDir === "asc" ? "desc" : "asc");
    } else {
        iStoredIndex = iIndex;
        //Calling the handler function so we can change the default behaviour
        sStoredDir = fHandleOrder();
    }

    /* Make a loop that will continue until
      no switching has been done: */
    while (switching) {
        // Start by saying: no switching is done:
        switching = false;
        rows = oTable.rows;
        /* Loop through all table rows (except the
          first, which contains table headers): */
        for (var i = 1; i < rows.length - 1; i++) {
            // Start by saying there should be no switching:
            shouldSwitch = false;
            /* Get the two elements you want to compare,
              one from current row and one from the next: */
            var x = rows[i].getElementsByTagName("TD")[iIndex];
            var y = rows[i + 1].getElementsByTagName("TD")[iIndex];
            /* Check if the two rows should switch place,
              based on the direction, asc or desc: */

            //Depending on collumn we might need to sort it on other properties so we call the handler function
            var [firstValue, secondValue] = fHandleValues(x, y);

            if (sStoredDir == "asc") {
                if (firstValue > secondValue) {
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            } else if (sStoredDir == "desc") {
                if (firstValue < secondValue) {
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            /* If a switch has been marked, make the switch
              and mark that a switch has been done: */
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}
