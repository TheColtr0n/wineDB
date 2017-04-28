// dbController.js
//
// Uses Sequelizer to get and post changes to a local SQLite database

// var Sequelize = require('sequelize');

// var dbConnection = new Sequelize('sampled_wines'. {
// 	host: 'localhost',
// 	dialect: 'sqlite',

// 	storage:'database/sampled_wines'
// });
var dbConnection = null;

var xhr = new XMLHttpRequest();
xhr.responseType = 'arraybuffer';
xhr.open('GET', 'database/sampled_wines', true);
xhr.onload = function(e){                                   //Executed once the database file is returned
            var responseArray = new Uint8Array(this.response);
            dbConnection = new SQL.Database(responseArray);
            getAllWines();
            getAllCountries();
            getAllRegions();
            getAllGrapes();
};
xhr.send();

//Helper function for populating Country dropdown selection
function getAllCountries(){
	let query = "SELECT DISTINCT country FROM producers ORDER BY lower(country)";
	
	var countryList = dbConnection.exec(query)[0].values;
	countryList.forEach(function(country, index){
		var label = document.createElement("label");
		var input  = document.createElement("input");
		input.setAttribute("onclick", "getByCountry()");
		input.setAttribute("id", "countries_"+index);
		input.setAttribute("type", "checkbox");
		input.setAttribute("value", "\""+country+"\"");
		var htmlStr = input.outerHTML + country;

		label.innerHTML = htmlStr;

		//label.innerHTML = "<input id=\"country_"+index+"\" type=\"checkbox\" value=\""+country+"\">"+country;

		var node = document.createElement("div");
		node.setAttribute("class", "checkbox");

		var countrySection = document.getElementById("countryCheckboxes");
		
		node.appendChild(label);
		countrySection.appendChild(node);

	})

}

//Helper function for populating Region dropdown selection
function getAllRegions(){
	let query = 'SELECT DISTINCT region FROM wines ORDER BY lower(region)';

	var regionList = dbConnection.exec(query)[0].values;
	regionList.forEach(function(region, index){
		var label = document.createElement("label");
		var input  = document.createElement("input");
		input.setAttribute("onclick", "getByRegion()");
		input.setAttribute("id", "regions_"+index);
		input.setAttribute("type", "checkbox");
		input.setAttribute("value", "\""+region+"\"");
		var htmlStr = input.outerHTML + region;

		label.innerHTML = htmlStr;
		//label.innerHTML = "<input id=\"region_"+index+"\" type=\"checkbox\" value=\""+region+"\">"+region;

		var node = document.createElement("div");
		node.setAttribute("class", "checkbox");

		var regionSection = document.getElementById("regionCheckboxes");
		
		node.appendChild(label);
		regionSection.appendChild(node);
	})
}

//Helper function for populating Grapes dropdwon selection
function getAllGrapes(){
	let query = 'SELECT g_name FROM grapes ORDER BY lower(g_name)';

	var grapeList = dbConnection.exec(query)[0].values;
	grapeList.forEach(function(grape, index){
		var label = document.createElement("label");
		var input  = document.createElement("input");
		input.setAttribute("onclick", "getByGrape()");
		input.setAttribute("id", "grapes_"+index);
		input.setAttribute("type", "checkbox");
		input.setAttribute("value", "\""+grape+"\"");
		var htmlStr = input.outerHTML + grape;

		label.innerHTML = htmlStr;

		var node = document.createElement("div");
		node.setAttribute("class", "checkbox");

		var styleSection = document.getElementById("styleCheckboxes");
		
		node.appendChild(label);
		styleSection.appendChild(node);
	});
}

//Gathers the salient details about all sampled wines in the database
function getAllWines(){
	let query = 'SELECT wid, p_name, w_name, country, region, normal, g_name, vintage, alc_perc, price FROM producers, wines, grapes where wines.pid = producers.pid and wines.gid=grapes.gid ORDER BY lower(p_name)';

	var wineList = dbConnection.exec(query)[0].values;
	wineList.forEach(function(wineInfo){
		createWineTableCell(wineInfo);
		$('[data-toggle="popover_'+wineInfo[0]+'"]').popover({
        		placement : 'left',
        		trigger : 'hover'
    	});
	});
}

function createWineTableCell(wineInfo){
	var tableRow = document.createElement("tr");
		tableRow.setAttribute("bgcolor", "#FFFFFF");
		tableRow.setAttribute("data-toggle", "popover_" + wineInfo[0]);
		tableRow.setAttribute("title", "Wine Details");
		tableRow.setAttribute("data-html", "true");
		tableRow.setAttribute("data-content", 
									"<em>Style:</em> " + wineInfo[6] + 
									"<br/><em>Vintage:</em> " + wineInfo[7] +
									"<br/><em>ABV:</em> " + wineInfo[8] + "%" +
									"<br/><em>Cost:</em> $" + wineInfo[9]
		);
		

		var prodTh = document.createElement("th");
		prodTh.innerHTML = wineInfo[1];
		tableRow.appendChild(prodTh);

		var nameTh = document.createElement("th");
		nameTh.innerHTML = wineInfo[2];
		tableRow.appendChild(nameTh);

		var countryTh = document.createElement("th");
		countryTh.innerHTML = wineInfo[3];
		tableRow.appendChild(countryTh);

		var regionTh = document.createElement("th");
		regionTh.innerHTML = wineInfo[4];
		tableRow.appendChild(regionTh);

		var charTh = document.createElement("th");
		charTh.innerHTML = wineInfo[5];
		tableRow.appendChild(charTh);

		var wineTable = document.getElementById("wineTbody");
		wineTable.appendChild(tableRow);
}


// //Gets wines based on type (red or white)
// function getByType(type){
// 	let query = 'SELECT p_name, country, wid, w_name, region, normal FROM producers, wines, grapes where wines.pid = producers.pid and wines.gid=grapes.gid and grapes.type=\"'+type+'\";';

// 	var wineList = dbConnection.exec(query)[0].values;
// 	wineList.forEach(function(wineInfo){
// 		console.log("Wine Info: " + wineInfo);
// 	})
// }

//Gets wines based on grape 
function getByGrape(){
	var grapesStr = '';
	var grapeSection = document.getElementById("styleCheckboxes");
	var grapeChex  = grapeSection.childNodes;//.getElementsByTagName("input");
	
	grapeChex.forEach(function(grapeDiv, index){
		var grapeInput = grapeDiv.childNodes[0].childNodes[0];
		
		if(grapeInput.checked){
			if(grapesStr.length == 0){
				grapesStr = grapeInput.value;
			}
			else{
				grapesStr += (', ' + grapeInput.value);
			}
		}
	});

	var wineTable = document.getElementById("wineTbody");
	wineTable.innerHTML = '';

	if(grapesStr.length == 0){
		getAllWines();
	}
	else{
		let query = 'SELECT wid, p_name, w_name, country, region, normal, g_name, vintage, alc_perc, price '+
					'FROM producers, wines, grapes '+
					'WHERE wines.pid = producers.pid '+
					'AND wines.gid=grapes.gid '+
					'AND grapes.g_name in ('+grapesStr+') ORDER BY lower(g_name)';
		var wineList = dbConnection.exec(query)[0].values;
		wineList.forEach(function(wineInfo){
			createWineTableCell(wineInfo);
			$('[data-toggle="popover_'+wineInfo[0]+'"]').popover({
	        		placement : 'left',
	        		trigger : 'hover'
	    	});
		});
	}
}

//Get wines from a specific country
function getByCountry(){
	var countryStr = '';
	var countrySection = document.getElementById("countryCheckboxes");
	var countryChex  = countrySection.childNodes;

	countryChex.forEach(function(countryDiv, index){
		var countryInput = countryDiv.childNodes[0].childNodes[0];
		
		if(countryInput.checked){
			if(countryStr.length == 0){
				countryStr = countryInput.value;
			}
			else{
				countryStr += (', ' + countryInput.value);
			}
		}
	});
	
	var wineTable = document.getElementById("wineTbody");
	wineTable.innerHTML = '';

	if(countryStr.length == 0){
		getAllWines();
	}
	else{
		let query = 'SELECT wid, p_name, w_name, country, region, normal, g_name, vintage, alc_perc, price FROM producers, wines, grapes '+
		'where wines.pid = producers.pid and wines.gid=grapes.gid and producers.country in ('+countryStr+') ORDER BY lower(country)';
		var wineList = dbConnection.exec(query)[0].values;

		wineList.forEach(function(wineInfo){
			createWineTableCell(wineInfo);
			$('[data-toggle="popover_'+wineInfo[0]+'"]').popover({
	        		placement : 'left',
	        		trigger : 'hover'
	    	});
		});
	}
	
}

//Get wines from a specific region/AVA
function getByRegion(){
	var regionStr = '';
	var regionSection = document.getElementById("regionCheckboxes");
	var regionChex  = regionSection.childNodes;
	
	regionChex.forEach(function(regionDiv, index){
		var regionInput = regionDiv.childNodes[0].childNodes[0];
		
		if(regionInput.checked){
			if(regionStr.length == 0){
				regionStr = regionInput.value;
			}
			else{
				regionStr += (', ' + regionInput.value);
			}
		}
	});

	var wineTable = document.getElementById("wineTbody");
	wineTable.innerHTML = '';

	if(regionStr.length == 0){
		getAllWines();
	}
	else{
		let query = 'SELECT wid, p_name, w_name, country, region, normal, g_name, vintage, alc_perc, price FROM producers, wines, grapes '+
		'where wines.pid = producers.pid and wines.gid=grapes.gid and wines.region in ('+regionStr+') ORDER BY lower(region)';
		var wineList = dbConnection.exec(query)[0].values;

		wineList.forEach(function(wineInfo){
			createWineTableCell(wineInfo);
			$('[data-toggle="popover_'+wineInfo[0]+'"]').popover({
	        		placement : 'left',
	        		trigger : 'hover'
	    	});
		});
	}
	

}

//Gets all wines below a certain dollar amount
function getBudgetWines(){
	var priceSection = document.getElementById("priceRadio");

	for(i=0; i < 5; i++){
		var priceRadio = document.getElementById("money_"+i);

		if(priceRadio.checked){
			var wineTable = document.getElementById("wineTbody");
			wineTable.innerHTML = '';

			let query = 'SELECT wid, p_name, w_name, country, region, normal, g_name, vintage, alc_perc, price FROM producers, wines, grapes '+
						'where wines.pid = producers.pid and wines.gid=grapes.gid and wines.price<='+priceRadio.value+' ORDER BY price';
			
			var wineList = dbConnection.exec(query)[0].values;
			wineList.forEach(function(wineInfo){
				createWineTableCell(wineInfo);
				$('[data-toggle="popover_'+wineInfo[0]+'"]').popover({
		        		placement : 'left',
		        		trigger : 'hover'
		    	});
			});
			break;
		}
	}
	
}

//Gets all wines above a certain alcohol level
function getAlcoholicWines(alclvl){
	
	var priceSection = document.getElementById("priceRadio");

	for(i=0; i < 5; i++){
		var abvRadio = document.getElementById("abv_"+i);

		if(abvRadio.checked){
			var wineTable = document.getElementById("wineTbody");
			wineTable.innerHTML = '';

			let query = 'SELECT wid, p_name, w_name, country, region, normal, g_name, vintage, alc_perc, price FROM producers, wines, grapes '+
						'where wines.pid = producers.pid and wines.gid=grapes.gid and wines.alc_perc>='+abvRadio.value+' ORDER BY alc_perc';
			
			var wineList = dbConnection.exec(query)[0].values;
			wineList.forEach(function(wineInfo){
				createWineTableCell(wineInfo);
				$('[data-toggle="popover_'+wineInfo[0]+'"]').popover({
		        		placement : 'left',
		        		trigger : 'hover'
		    	});
			});
			break;
		}
	}
}


