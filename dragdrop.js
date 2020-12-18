/*
 * JavaScript for DragDrop
 *
 * KP
 * Dec 17, 2020
 */
 
/* Requires jQuery */
/*
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
*/

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
  var statusElem = document.getElementById(ev.target.getAttribute('data-status'));
  var num = parseInt(statusElem.getAttribute('data-num'));
  targetId = "drag" + ev.target.id;
  sourceId = ev.dataTransfer.getData("text") + "d";
  if (sourceId == targetId) {
	ev.preventDefault();
	var data = ev.dataTransfer.getData("text");
	ev.target.appendChild(document.getElementById(data));
	statusElem.setAttribute('data-correct', parseInt(statusElem.getAttribute('data-correct')) + 1);
	if (parseInt(statusElem.getAttribute('data-correct')) >= parseInt(statusElem.getAttribute('data-total'))) {
		/*
		statusElem.style.backgroundColor = "honeydew";
		statusElem.style.borderColor = "green";
		statusElem.classList.remove("failed");
		statusElem.classList.add("passed");
		statusElem.innerHTML = "COMPLETED: " + statusElem.innerHTML;
		*/
		updateResults(num, false, true, true);
	} else {
		updateResults(num, true, false, true);
	}
  } else {
	updateResults(num, true, false, true);
  }
}
