/*
 * JavaScript for EasyTrain
 *
 * KP
 * Dec 17, 2020
 */

var loginName;
var modFilename;
var resultsOutput;
var moduleInput;

/**************************************************************************/

function getcurrTime() {
	currTime = new Date();
	return (currTime.getMonth() + 1) 
		+ "/" + currTime.getDate() + "/" 
		+ currTime.getFullYear() + " " 
		+ currTime.getHours() + ":" 
		+ currTime.getMinutes() + ":" 
		+ currTime.getSeconds();
}

function getfname(fullname) {
	var tmp = fullname.substring(fullname.lastIndexOf('/')+1);
	tmp = tmp.substring(fullname.lastIndexOf('\\')+1);
	return tmp;
}

/**************************************************************************/

function setupPage() {
	loginName = "";
	modFilename = "";
	resultsOutput = "";
	moduleInput = "";
	
	var fileResults = document.getElementById('fileResults');
	fileResults.addEventListener('change', function(e) {
		var file = fileResults.files[0];
		var reader = new FileReader();

		reader.onload = function(e) {
			var xmlText = resToXml(reader.result, reader.result.length);

			parser = new DOMParser();
			resultsOutput = parser.parseFromString(xmlText,"text/xml");
		};
		reader.readAsBinaryString(file);
	});
	
	var fileInput = document.getElementById('fileEasy');
	fileInput.addEventListener('change', function(e) {
		var file = fileInput.files[0];
		var reader = new FileReader();

		reader.onload = function(e) {
			modFilename = document.getElementById('fileEasy').value;
			var xmlText = modToXml(reader.result, reader.result.length);

			parser = new DOMParser();
			moduleInput = parser.parseFromString(xmlText,"text/xml");
		};
		reader.readAsBinaryString(file);
	});			
}

/**************************************************************************/

function updateResults(sectNum, started, completed, updateTime) {
	var statusElem = document.getElementById("btn" + sectNum);
	var tmp = document.getElementById("btn" + sectNum).innerHTML;
	tmp = tmp.substring(0, tmp.lastIndexOf('(') - 1);
	if (completed ||
		(!resultsOutput.getElementsByTagName("section")[sectNum-1].getElementsByTagName("completetime")[0].innerHTML.startsWith("1/1/0001"))) {
		statusElem.style.backgroundColor = "honeydew";
		statusElem.style.borderColor = "green";	
		tmp += " (COMPLETED)";
		statusElem.innerHTML = tmp;
		if (updateTime 
			&& (resultsOutput.getElementsByTagName("section")[sectNum-1].getElementsByTagName("completetime")[0].innerHTML.startsWith("1/1/0001"))) {
			if (resultsOutput.getElementsByTagName("section")[sectNum-1].getElementsByTagName("completetime")[0].innerHTML.startsWith("1/1/0001")) {
				resultsOutput.getElementsByTagName("section")[sectNum-1].getElementsByTagName("starttime")[0].innerHTML = getcurrTime();
			}
			resultsOutput.getElementsByTagName("section")[sectNum-1].getElementsByTagName("completetime")[0].innerHTML = getcurrTime();
		}
	} else if (started ||
		(!resultsOutput.getElementsByTagName("section")[sectNum-1].getElementsByTagName("starttime")[0].innerHTML.startsWith("1/1/0001"))) {
		statusElem.style.backgroundColor = "lemonchiffon";
		statusElem.style.borderColor = "darkorange";	
		tmp += " (IN PROGRESS)";
		statusElem.innerHTML = tmp;
		if (updateTime 
			&& (resultsOutput.getElementsByTagName("section")[sectNum-1].getElementsByTagName("starttime")[0].innerHTML.startsWith("1/1/0001"))) {
			resultsOutput.getElementsByTagName("section")[sectNum-1].getElementsByTagName("starttime")[0].innerHTML = getcurrTime();
		}
	} else {
		statusElem.style.backgroundColor = "mistyrose";
		statusElem.style.borderColor = "darkred";	
		tmp += " (NOT STARTED)";
		statusElem.innerHTML = tmp;
	}
	var notCount = 0;
	var startCount = 0;
	var compCount = 0;
	var sections = moduleInput.getElementsByTagName("section");
	for (var i = 0; i < sections.length; i++) {
		if (sections[i].getAttribute("type") != "html") {
			if (!resultsOutput.getElementsByTagName("section")[i].getElementsByTagName("completetime")[0].innerHTML.startsWith("1/1/0001")) {
				compCount++;
			} else if (!resultsOutput.getElementsByTagName("section")[i].getElementsByTagName("starttime")[0].innerHTML.startsWith("1/1/0001")) {
				startCount++;
			} else {
				notCount++;
			}
		}
	}
	resultsOutput.getElementsByTagName("notstarted")[0].innerHTML = notCount;
	resultsOutput.getElementsByTagName("started")[0].innerHTML = startCount;
	resultsOutput.getElementsByTagName("completed")[0].innerHTML = compCount;
	document.getElementById('resultCount').innerHTML = "<li>Not Started: " 
		+ notCount + "</li>"
		+ "<li>In Progress: " + startCount + "</li>"
		+ "<li>Completed: "+ compCount + "</li>";
}

/**************************************************************************/

function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

/**************************************************************************/

function checkAnswer(statusElem, num) {
	var ans = statusElem.getAttribute('data-correct');
	var userAns = document.getElementById('ans' + num).value;
	if (ans == userAns) {
		document.getElementById('status' + num).innerHTML = "Correct";
		updateResults(num, false, true, true);
	} else {
		document.getElementById('status' + num).innerHTML = "Try Again";
		updateResults(num, true, false, true);
	}
}

/**************************************************************************/

function prevLine(statusElem, placeholder) {
	var num = parseInt(statusElem.getAttribute('data-num'));
	var current = parseInt(statusElem.getAttribute('data-current'));
	var last = parseInt(statusElem.getAttribute('data-last'));
	var prevLine = parseInt(statusElem.getAttribute('data-line' + current));
	current--;
	if (current >= 0) {
		var line = parseInt(statusElem.getAttribute('data-line' + current));
		placeholder.innerHTML = moduleInput.getElementsByTagName("section")[num-1].getElementsByTagName("step")[current].getElementsByTagName("body")[0].innerHTML;	
		statusElem.setAttribute('data-current', current);
		statusElem.nextElementSibling.style.maxHeight = statusElem.nextElementSibling.scrollHeight + "px";
		document.getElementById("line" + num + "_" + (prevLine + 1) + "num").style.backgroundColor = "";
		document.getElementById("line" + num + "_" + (prevLine + 1) + "desc").style.backgroundColor = "";
		document.getElementById("line" + num + "_" + (line + 1) + "num").style.backgroundColor = "yellow";
		document.getElementById("line" + num + "_" + (line + 1) + "desc").style.backgroundColor = "yellow";
	}
	updateResults(num, true, false, true);
}

function nextLine(statusElem, placeholder) {
	var num = parseInt(statusElem.getAttribute('data-num'));
	var current = parseInt(statusElem.getAttribute('data-current'));
	var last = parseInt(statusElem.getAttribute('data-last'));
	var prevLine = parseInt(statusElem.getAttribute('data-line' + current));
	current++;
	if (current < last) {
		var line = parseInt(statusElem.getAttribute('data-line' + current));
		placeholder.innerHTML = moduleInput.getElementsByTagName("section")[num-1].getElementsByTagName("step")[current].getElementsByTagName("body")[0].innerHTML;
		statusElem.setAttribute('data-current', current);
		statusElem.nextElementSibling.style.maxHeight = statusElem.nextElementSibling.scrollHeight + "px";
		document.getElementById("line" + num + "_" + (prevLine + 1) + "num").style.backgroundColor = "";
		document.getElementById("line" + num + "_" + (prevLine + 1) + "desc").style.backgroundColor = "";
		document.getElementById("line" + num + "_" + (line + 1) + "num").style.backgroundColor = "yellow";
		document.getElementById("line" + num + "_" + (line + 1) + "desc").style.backgroundColor = "yellow";

		if ((current+1) >= last) {
			updateResults(num, false, true, true);
		} else {
			updateResults(num, true, false, true);
		}
	} else {
		updateResults(num, true, false, true);
	}
}

/**************************************************************************/

function downloadResults() {
	// https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
		
	var element = document.createElement('a');
	var resultsString = (new XMLSerializer()).serializeToString(resultsOutput);
	if (!resultsString.startsWith('<?xml')) {
		resultsString = '<?xml version="1.0" encoding="utf-16"?>' + resultsString;
	}
	var tmp = xmlToRes(resultsString, resultsString.length);
	var textToWrite = "";
	for (var i = 0; i < resultsString.length; i++) {
		textToWrite += String.fromCharCode(getXmlResChar(i));
	}
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(textToWrite));
	
	var downFile = getfname(modFilename);
	downFile = downFile.substring(0, downFile.lastIndexOf('.')) + "_" + loginName + ".etr";
	element.setAttribute('download', downFile);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

/**************************************************************************/

function buildResults() {
	if (resultsOutput == "") {
		res = document.implementation.createDocument("", "", null);
		var resultsElem = res.createElement("results");

		var idElem = res.createElement("id");
			tmpElem = res.createElement("name");
			tmpElem.innerHTML = loginName;
			idElem.appendChild(tmpElem);
			
			tmpElem = res.createElement("notstarted");
			var count = 0;
			var sections = moduleInput.getElementsByTagName("section");
			for (var i = 0; i < sections.length; i++) {
				if (sections[i].getAttribute("type") != "html") {
					count++;
				}
			}
			tmpElem.innerHTML = count;
			idElem.appendChild(tmpElem);
			
			tmpElem = res.createElement("started");
			tmpElem.innerHTML = "0";
			idElem.appendChild(tmpElem);
			
			tmpElem = res.createElement("completed");
			tmpElem.innerHTML = "0";
			idElem.appendChild(tmpElem);
			
			tmpElem = res.createElement("mod");
			tmpElem.innerHTML = getfname(modFilename);
			idElem.appendChild(tmpElem);
			
			tmpElem = res.createElement("fullmod");
			tmpElem.innerHTML = modFilename;
			idElem.appendChild(tmpElem);
			
			tmpElem = res.createElement("version");
			tmpElem.innerHTML = moduleInput.getElementsByTagName("module")[0].getAttribute("version");
			idElem.appendChild(tmpElem);
		resultsElem.appendChild(idElem);
		for (var i = 0; i < sections.length; i++) {
			var sectElem = res.createElement("section");
				tmpElem = res.createElement("name");
				tmpElem.innerHTML = sections[i].getAttribute("name");
				sectElem.appendChild(tmpElem);

				tmpElem = res.createElement("type");
				tmpElem.innerHTML = sections[i].getAttribute("type");
				sectElem.appendChild(tmpElem);

				tmpElem = res.createElement("starttime");
				tmpElem.innerHTML = "1/1/0001 12:00:00 AM";
				sectElem.appendChild(tmpElem);

				tmpElem = res.createElement("completetime");
				tmpElem.innerHTML = "1/1/0001 12:00:00 AM";
				sectElem.appendChild(tmpElem);
				
			resultsElem.appendChild(sectElem);	
		}	
		res.appendChild(resultsElem);
		resultsOutput = res;
	}
}

function replaceLeadingSpace(s) {
	var count = 0;
	var replaceStr = "";
	while (s[count] == ' ') {
		count++;
		replaceStr += '&nbsp;';
	}
	return replaceStr + s.substr(count);
}

function loadEasyTrain() {
	loginName = document.getElementById("loginName").value;
	if (loginName == "" || moduleInput == "") {
		alert('Need to enter name and etm before continuing');
		return;
	}
	if (resultsOutput == "") {
		buildResults();
	} else {
		if (resultsOutput.getElementsByTagName("id")[0].getElementsByTagName("mod")[0].innerHTML != getfname(modFilename)) {
			alert("Warning - results file does not match module, starting with no results");
			resultsOutput = "";
			buildResults();
		}
		if (resultsOutput.getElementsByTagName("id")[0].getElementsByTagName("name")[0].innerHTML != loginName) {
			alert("Warning - results file does not match username, starting with no results");
			resultsOutput = "";
			buildResults();
		}
	}
		
	document.getElementById('setup').innerHTML = "";
	document.getElementById('easytrain').innerHTML = moduleInput.getElementsByTagName("module")[0].getAttribute("version") + "<br>";
	var easyDivText = "<div  class='grid-results'><div class='grid-results-item'>Name: " + loginName
		+ "<br/>Module: " + getfname(modFilename)
		+ "<br/><span style='background-color: yellow'>*** Before you leave this page, please SAVE your results!</span></div>"
		+ "<div class='grid-results-item'><ul id='resultCount'><li>Not Started: " 
			+ resultsOutput.getElementsByTagName("id")[0].getElementsByTagName("notstarted")[0].innerHTML + "</li>"
		+ "<li>In Progress: "+ resultsOutput.getElementsByTagName("id")[0].getElementsByTagName("started")[0].innerHTML + "</li>"
		+ "<li>Completed: "+ resultsOutput.getElementsByTagName("id")[0].getElementsByTagName("completed")[0].innerHTML + "</li></ul></div></div>"
		+ "<button id='saveBtn1' name='saveBtn1' class='widebutton' onclick='downloadResults();'>Save</button><br/><br/>";
	var sections = moduleInput.getElementsByTagName("module")[0].getElementsByTagName("section");

	for (let j = 0; j < sections.length; j++) {
		var btnName = "btn" + (j+1);
		var nameText = "";
		var extraNameText = " (NOT STARTED)";
								
		var borderStyle = "background-color: mistyrose; border: 3px darkred solid";
		if (resultsOutput != "") {
			if (!resultsOutput.getElementsByTagName("section")[j].getElementsByTagName("completetime")[0].innerHTML.startsWith("1/1/0001")) {
				borderStyle = "background-color: honeydew; border: 3px green solid";
				extraNameText = " (COMPLETED)";
			} else if (!resultsOutput.getElementsByTagName("section")[j].getElementsByTagName("starttime")[0].innerHTML.startsWith("1/1/0001")) {
				borderStyle = "background-color: lemonchiffon; border: 3px darkorange solid";
				extraNameText = " (IN PROGRESS)";
			}
		}
		
		if (sections[j].hasAttribute("direction"))
		{
			nameText = sections[j].getAttribute("direction");
		}
		if (sections[j].getAttribute("type") == 'html') {
			easyDivText += '<div class="htmlSect">' + sections[j].getElementsByTagName("body")[0].innerHTML + '</div>';
		} else if (sections[j].getAttribute("type") == 'match') {
			var lefts = [];
			var centers = [];
			var rights = [];
			var dummyText = "";
			if (nameText == "") {
				nameText = "Match items";
			}
			dummyText = '<div class="grid-container-match">';
			var pairs = sections[j].getElementsByTagName("pair");
			for (let m = 0; m < pairs.length; m++) {
				lefts.push('<div class="grid-item">'
					+ replaceLeadingSpace(pairs[m].getElementsByTagName("left")[0].innerHTML)
					+ '</div>');
				centers.push('<div class="grid-item" '
					+ ' data-status="' + btnName + '"'
					+ ' id="mat'
					+ (j+1) + (m+1) + 'd" ondrop="drop(event)" ondragover="allowDrop(event)"></div>');
				rights.push('<div class="grid-item" id="mat'
					+ (j+1) + (m+1)+ '" ondrop="drop(event)" ondragover="allowDrop(event)">'
					+ '<div draggable="true" ondragstart="drag(event)" id="dragmat'
					+ (j+1) + (m+1) + '">'
					+ replaceLeadingSpace(pairs[m].getElementsByTagName("right")[0].innerHTML)
					+ '</div></div>');
			}
			var nopairs = sections[j].getElementsByTagName("nopair");
			for (let n = 0; n < nopairs.length; n++) {
				lefts.push('<div>&nbsp;</div>');
				centers.push('<div>&nbsp;</div>');
				rights.push('<div class="grid-item" id="mat'
					+ (j+1) + (n+1)+ 'x" ondrop="drop(event)" ondragover="allowDrop(event)">'
					+ '<div draggable="true" ondragstart="drag(event)" id="dragmat'
					+ (j+1) + (n+1) + 'x">'
					+ replaceLeadingSpace(nopairs[n].getElementsByTagName("right")[0].innerHTML)
					+ '</div></div>');
			}
			shuffleArray(rights);
			for (let k = 0; k < lefts.length; k++) {
				dummyText += lefts[k] + centers[k] + rights[k];
			}
			dummyText += "</div>";
			
			easyDivText += 
				'<button class="collapsible"' +
				' id="' + btnName + '"' +
				' style="' + borderStyle + '"' +
				' data-num="' + (j+1) + '"' +
				' data-correct="' + 0 + '"' +
				' data-total="' + pairs.length + '"' +
				'>' + 
				nameText + extraNameText +
				"</button>" +
				"<div class=\"content\">" +
				dummyText +
				"</div>";
		} else if (sections[j].getAttribute("type") == 'animation') {
			if (nameText == "") {
				nameText = "Click through animation";
			}
			var lineText = '<div class="grid-container-inner-animate">';
			var lines = sections[j].getElementsByTagName("line");
			var backColor = ' style="background: yellow"';
			for (let m = 0; m < lines.length; m++) {
				lineText += '<div class="grid-item"'
					+ ' id="line' + (j+1) + "_" + (m+1)+ 'num"'
					+ backColor + '>'
					+ (m+1)
					+ '</div>'
					+ '<div class="grid-item"'
					+ ' id="line' + (j+1) + "_" + (m+1)+ 'desc"'
					+ backColor + '>'
					//+ "<pre>" + lines[m].innerHTML.replace(/ /g, '&nbsp;') + "</pre>"
					+ replaceLeadingSpace(lines[m].innerHTML)
					+ '</div>';
				backColor = "";
			}
			lineText += '</div>';
			
			var extraAttr = "";
			var steps = sections[j].getElementsByTagName("step");
			for (let m = 0; m < steps.length; m++) {
				extraAttr += 'data-line' + m + '="' + steps[m].getAttribute("line") + '"';
			}
			
			dummyText = '<div class="grid-container-animate">';
			dummyText += '<div class="grid-item">' 
				+ lineText + '</div>'
				+ '<div class="grid-item">'
				+ '<div id="animate' + (j+1) + '">'
				+ steps[0].getElementsByTagName("body")[0].innerHTML
				+ ' </div>'
				+ ' <button id="next' + (j+1) + '" class="halfwidebutton"'
				+ ' onclick="prevLine(' + btnName + ',animate' + (j+1) + ');">&lt;&lt;</button>'
				+ ' <button id="next' + (j+1) + '" class="halfwidebutton"'
				+ ' onclick="nextLine(' + btnName + ',animate' + (j+1) + ');">&gt;&gt;</button>'
				+ '</div>';
			dummyText += '</div>';		

			easyDivText += 
				'<button class="collapsible "' +
				' id="' + btnName + '"' +
				' style="' + borderStyle + '"' +
				extraAttr +
				' data-num="' + (j+1) + '"' +
				' data-current="' + 0 + '"' +
				' data-last="' + steps.length + '"' +
				'>' + 
				nameText + extraNameText +
				"</button>" +
				"<div class=\"content\">" +
				dummyText +
				"</div>";

		} else if (sections[j].getAttribute("type") == 'order') {
			var lefts = [];
			var centers = [];
			var rights = [];
			var dummyText = "";
			var count = 0;
			var sticks = 0;
			if (nameText == "") {
				nameText = "Place items in order";
			}
			dummyText = '<div class="grid-container-order">';
			var items = sections[j].getElementsByTagName("item");
			for (let m = 0; m < items.length; m++) {
				lefts.push('<div class="grid-item">'
					+ (m+1)
					+ '</div>');
				if (items[m].hasAttribute('stick')) {
					centers.push('<div class="grid-item">'
						//+ "<pre>" + items[m].innerHTML.replace(/ /g, '&nbsp;') + "</pre>"
						+ replaceLeadingSpace(items[m].innerHTML)
						+ '</div>');
					sticks++;
				} else {
					centers.push('<div class="grid-item" '
						+ ' data-status="' + btnName + '"'
						+ ' id="mat'
						+ (j+1) + (m+1) + 'd" ondrop="drop(event)" ondragover="allowDrop(event)"></div>');
					rights.push('<div class="grid-item" id="mat'
						+ (j+1) + (m+1)+ '" ondrop="drop(event)" ondragover="allowDrop(event)">'
						+ '<div draggable="true" ondragstart="drag(event)" id="dragmat'
						+ (j+1) + (m+1) + '">'
						//+ "<pre>" + items[m].innerHTML.replace(/ /g, '&nbsp;') + "</pre>"
						+ replaceLeadingSpace(items[m].innerHTML)
						+ '</div></div>');
					count++;
				}
			}
			var noitems = sections[j].getElementsByTagName("noitem");
			for (let n = 0; n < noitems.length; n++) {
				lefts.push('<div>&nbsp;</div>');
				centers.push('<div>&nbsp;</div>');
				rights.push('<div class="grid-item" id="mat'
					+ (j+1) + (n+1)+ 'x" ondrop="drop(event)" ondragover="allowDrop(event)">'
					+ '<div draggable="true" ondragstart="drag(event)" id="dragmat'
					+ (j+1) + (n+1) + 'x">'
					//+ "<pre>" + noitems[n].innerHTML.replace(/ /g, '&nbsp;') + "</pre>"
					+ replaceLeadingSpace(noitems[n].innerHTML)
					+ '</div></div>');
			}
			shuffleArray(rights);
			for (let k = 0; k < sticks; k++) {
				rights.push('<div>&nbsp;</div>');
			}

			for (let k = 0; k < lefts.length; k++) {
				dummyText += lefts[k] + centers[k] + rights[k];
			}
			dummyText += "</div>";
			
			easyDivText += 
				'<button class="collapsible "' +
				' id="' + btnName + '"' +
				' style="' + borderStyle + '"' +
				' data-num="' + (j+1) + '"' +
				' data-correct="' + 0 + '"' +
				' data-total="' + count + '"' +
				'>' + 
				nameText + extraNameText +
				"</button>" +
				"<div class=\"content\">" +
				dummyText +
				"</div>";
		} else if (sections[j].getAttribute("type") == 'fillin') {
			if (nameText == "") {
				nameText = "Fill in the blank";
			}
			dummyText = '<div class="grid-container-fillin">';
			dummyText += '<div class="grid-item">' 
				+ sections[j].getElementsByTagName("question")[0].innerHTML + '</div>'
				+ '<div class="grid-item">'
				+ '<input id="ans' + (j+1) + '"'
				+ ' type="text"'
				+ ' onkeydown="if (event.keyCode == 13) { document.getElementById(\'check' + (j+1) + '\').click(); }">'
				+ ' <button id="check' + (j+1) + '"'
				+ ' data-status="' + btnName + '"'
				+ ' onclick="checkAnswer(' + btnName + ',' + (j+1) + ');">Check</button>'
				+ ' <p id="status' + (j+1) + '">Enter an answer</p>'
				+ '</div>';
			dummyText += '</div>';

			easyDivText += 
				'<button class="collapsible "' +
				' id="' + btnName + '"' +
				' style="' + borderStyle + '"' +
				' data-num="' + (j+1) + '"' +
				' data-correct="' + sections[j].getElementsByTagName("answer")[0].innerHTML + '"' +
				' data-total="' + count + '"' +
				'>' + 
				nameText + extraNameText +
				"</button>" +
				"<div class=\"content\">" +
				dummyText +
				"</div>";
		}
	}
	easyDivText += "<br/><button id='saveBtn' name='saveBtn'  class='widebutton' onclick='downloadResults();'>Save</button>"

	document.getElementById('easytrain').innerHTML = easyDivText;
	setupCollapsible();
}

