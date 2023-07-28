var sGuild = "";

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

function parseDataIntoTable(oData) {
    const aProperties = ["g", "c", "a", "d", "e", "f"];
    const aHeader = ["Rank", "Class", "Name", "Level", "GP", "Bonus"];

    const oTable = document.createElement("table");
    oTable.style.width = "75%";

    const oTr = oTable.insertRow();
    aHeader.forEach((sHeader, iIndex) => {
        const oTd = oTr.insertCell();
        oTd.addEventListener("click", () => sortTable(oTable, iIndex));
        oTd.style = "font-weight: bold;text-align: center;cursor: pointer";
        oTd.appendChild(document.createTextNode(sHeader));
    });

    for (const sMember in oData["d"]) {
        const oTr = oTable.insertRow();
        aProperties.forEach((sProp, i) => {
            const oTd = oTr.insertCell();
            const sVal = oData["d"][sMember][sProp].toString();
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
                    oTd.appendChild(document.createTextNode(`${oData["d"][sMember][sProp]}`));
                    break;
                case 3:
                case 4:
                    oTd.style = "text-align: center";
                    oTd.appendChild(document.createTextNode(`${oData["d"][sMember][sProp]}`));
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

    document.getElementById("dGP").appendChild(oTable);

}

fetch(`data/${sGuild}GuildData.json`)
.then(res => res.json())
.then(data => {
    getParams();
    document.getElementById("logo").src = `res/logos/${sGuild}.png`
    document.getElementById("dUpdated").appendChild(document.createTextNode(`Last updated on: ${new Date(oData["t"] * 1000).toLocaleDateString()}`));
    parseDataIntoTable(data);
});