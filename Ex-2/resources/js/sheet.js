var isChrome = !!window.chrome && !!window.chrome.webstore;
var isFirefox = typeof InstallTrigger !== 'undefined';

function getMeta(scope, name, defaultValue) {
  "use strict";
  var warn = false
  if (scope===undefined) scope = document;
  if (defaultValue===undefined) warn = true;

  var elements = scope.querySelectorAll('meta[name=' + name + ']');
  if (elements===undefined || elements.length == 0 || elements[0].getAttribute === undefined || elements[0].getAttribute('content') === undefined) {
    if (warn) {
      alert("You need a <meta name=\""+name+"\" content=\"...\"> element in your <head> section")
    } else {
      return defaultValue
    }
  } else {
    return elements[0].getAttribute('content')
  }
}

function formatSheet() {
    "use strict";
    var scope = document;

    var exerciseNr = getMeta(scope, 'exerciseNr');
    var lecture = getMeta(scope, 'lecture');
    var exercisePrefix = getMeta(scope, 'exercisePrefix', 'Exercise');
    var term = getMeta(scope, 'term');
    var dueDate = getMeta(scope, 'dueDate', '');

    var title = exercisePrefix + " #" + exerciseNr;
    var titleElements = scope.querySelectorAll('title');
    if (titleElements!==undefined && titleElements.length > 0) {
      title = titleElements[0]
    } else {
      setupTitle(scope, title)
    }

    if (exercisePrefix && title && lecture && exerciseNr && term) {
      setupHeaders(scope, lecture, exercisePrefix, exerciseNr, term, dueDate)
      //setupFooters(scope, lecture, exercisePrefix, exerciseNr, term, dueDate)

      setupExercises(scope, exerciseNr)
      setupTasks(scope, exerciseNr)
      setSuperResolution(scope)

      //layout finished, show the pages
      var pages = document.querySelectorAll("page")
      for (var i in pages) {
        var page = pages[i]
        if (page.nodeType == Node.ELEMENT_NODE) {
          page.className += "transitionVisible"
        }
      }

      callScripts(scope)
      loadInner(scope)
    }
}

function setupTitle(scope, title) {
  "use strict";

  if (scope===undefined) scope = document;
  var head = scope.querySelectorAll('head')[0];
  var node = document.createElement("title");
  node.innerHTML = title
  head.appendChild(node)
}

function setupHeaders(scope, lecture, prefix, number, term, dueDate) {
    "use strict";

    if (scope===undefined) scope = document;
    var elements = scope.querySelectorAll('page');
    if (dueDate != '') dueDate = '<dueDate>Submission: <b>' + dueDate + '</b></dueDate>';
    for (var i in elements){
        var page = elements[i];
        if (page && page.insertBefore) {
          var header = document.createElement("header");
          header.innerHTML = '<table style="width:100%"><tr><th><h1><lecture>'+lecture+'</lecture>'+prefix+' '+number+'</h1>'+dueDate+'</th><td><img src="./resources/lgdv.png" width=160 /></td></table>';

          page.insertBefore(header, page.firstChild)
        }
    }
}

function setupFooters(scope, lecture, prefix, number, term, dueDate) {
    "use strict";

    if (scope===undefined) scope = document;
    var elements = scope.querySelectorAll('page');
    for (var i in elements){
        var page = elements[i];
        if (page && page.appendChild) {
          var footer = document.createElement("footer");
          footer.innerHTML = '<table style="width:100%"><tr><th>'+lecture+'</th><td>'+term+'</td></table>'

          page.appendChild(footer);
        }
    }
}

function setupExercises(scope, number) {
    "use strict";

    if (scope===undefined) scope = document;
    var elements = scope.querySelectorAll('exercise');
    for (var i in elements){
        var exercise = elements[i];
        if (exercise.nodeType == Node.ELEMENT_NODE) {
          var prefix = "Exercise";
          if (exercise.getAttribute("prefix")) {
            prefix = exercise.getAttribute("prefix")
          }

          var title = "<span style='color:magenta'>[please add a title attribute]</span>";
          if (exercise.getAttribute("title")) {
            title = exercise.getAttribute("title")
          }
		  
		  var pointsExercise = "<span style='color:magenta'>[please add a points attribute]</span>"; if (exercise.getAttribute("points")) {
            pointsExercise = exercise.getAttribute("points")
          }

          var h1 = document.createElement("h1");
          h1.innerHTML = prefix + " " + number + " <strong>" + title + "</strong>" + " [" + pointsExercise +" points]" ;
          exercise.insertBefore(h1, exercise.firstChild)
        }
    }
}

function setupTasks(scope, number) {
    "use strict";

    if (scope===undefined) scope = document;
    var elements = scope.querySelectorAll('task');
    var partNr = 1;
	
	
    for (var i in elements){
        var task = elements[i];
        if (task.nodeType == Node.ELEMENT_NODE) {

          //make sure that a task that is the first child of an exercise does not have a top-margin
          var zeroTopMargin = false;
          if (task.parentElement && task.parentElement.childNodes) {
            var lastWasHeadline = false;
            for (var c in task.parentElement.childNodes) {
              var child = task.parentElement.childNodes[c]
              if (child.nodeType == Node.COMMENT_NODE || child.nodeType == Node.TEXT_NODE) continue;

              if (child.nodeType == Node.ELEMENT_NODE) {
                if (lastWasHeadline && child === task) {
                  zeroTopMargin = true;
                }

                if (child.nodeName === "H1" || child.nodeName === "H2" || child.nodeName === "H3" || child.nodeName === "H4") {
                  lastWasHeadline = true
                } else {
                  lastWasHeadline = false
                }
              } else {
                lastWasHeadline = false
              }
            }
          }

          //add a default header
          var prefix = "Task";
          if (task.getAttribute("prefix")) {
            prefix = task.getAttribute("prefix")
          }

          var title = "<span style='color:magenta'>[please add a title attribute]</span>";
          if (task.getAttribute("title")) {
            title = task.getAttribute("title")
          }
		  
          var pointsTask = "<span style='color:magenta'>[please add a points attribute]</span>";
          if (task.getAttribute("points")) {
            pointsTask = task.getAttribute("points")
          }

          var submitFile = "<span style='color:magenta'>[please add a submit file attribute]</span>";
          if (task.getAttribute("submitfile")) {
              submitFile = task.getAttribute("submitfile")
          }

          var h2 = document.createElement("h2");
          if (zeroTopMargin == true) {
            if (h2.style) {
              h2.style.marginTop = "0cm"
            }
          }
          h2.innerHTML = prefix + " " + number + "." + partNr + " <strong>" + title + "</strong>" + " [" + pointsTask +" points]" + " - Submission file: <i>" + submitFile + "</i>";
          task.insertBefore(h2, task.firstChild)

          setupSubTasks(task, number, partNr, pointsTask)
          partNr++;
        }
    }
}

function setupSubTasks(scope, number, taskNr, pointsTask) {
    "use strict";

    if (scope===undefined) scope = document;
    var elements = scope.querySelectorAll('subtask');
    var partNr = 0;
	
	var sumPoints = 0
	
    for (var i in elements){
        var subtask = elements[i];
        if (subtask.nodeType == Node.ELEMENT_NODE) {
          var title = document.createElement("h1");

          var title = "<span style='color:magenta'>[please add a title attribute]</span>";
          if (subtask.getAttribute("title")) {
            title = subtask.getAttribute("title")
          }

		  var pointsSubTask = "<span style='color:magenta'>[please add a points attribute]</span>"; if (subtask.getAttribute("points")) {
            pointsSubTask = subtask.getAttribute("points")
          }
		  sumPoints += parseInt(pointsSubTask);

          var h3 = document.createElement("h3");
          h3.innerHTML = "<span class='enum'>" + String.fromCharCode(97 + partNr) + ")</span> <strong>" + title + "</strong>"  + " [" + pointsSubTask +"/"+ pointsTask + "]";
          subtask.insertBefore(h3, subtask.firstChild)

          partNr++;
        }
    }
	if(sumPoints > pointsTask)
	window.alert("Sum of subtask points exceeds task points");
}

function setSuperResolution(scope){
  "use strict";

  if (scope===undefined) scope = document;
  var elements = scope.querySelectorAll('[superResolution]');
  for (var i in elements){
    var canvas = elements[i]
    if (canvas.nodeType == Node.ELEMENT_NODE) {
      var ctx = canvas.getContext('2d');

      if (ctx) {
          var scale = canvas.getAttribute("superResolution")
      //if (window.devicePixelRatio > 1) {
          var canvasWidth = canvas.width;
          var canvasHeight = canvas.height;

          canvas.width = canvasWidth * scale;
          canvas.height = canvasHeight * scale;
          canvas.style.width = canvasWidth;
          canvas.style.height = canvasHeight;

          ctx.scale(scale, scale);
      }
    }
  }
}

Function.prototype.applyAsync = function(params, delay){
      var function_context = this;
      setTimeout(function(){
          var val = function_context.apply(undefined, params);
      }, delay);
}

var didNagChromers = false
function loadResource(url, payload, didLoad, didFail) {
  url = url + '?t=' + Math.random()
  var xmlhttp = new XMLHttpRequest(),
  localTest = /^(?:file):/
  xmlhttp.payload = payload
  xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState === 4) {
				status = xmlhttp.status;
			}
			if (localTest.test(location.href) && xmlhttp.responseText) {
				status = 200;
			}

			if (xmlhttp.readyState == 4 && status == 200) {
				text = xmlhttp.responseText;
        didLoad.applyAsync([text, xmlhttp.payload]);
        //didLoad(text, xmlhttp.payload)
      } else if (xmlhttp.readyState == 4) {
        console.log("Failed to load", url, status, xmlhttp.readyState, "to", xmlhttp.payload)
        if (isChrome && !didNagChromers) {
          didNagChromers = true
          if (navigator.appVersion.indexOf("Win")!=-1)
            alert("Please start Chrome using Chrome.exe --allow-file-access-from-files "+ window.location)
          if (navigator.appVersion.indexOf("Mac")!=-1)
            alert("Please start Chrome using /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --allow-file-access-from-files " + window.location)
          else
            alert("Please start Chrome using chrome --allow-file-access-from-files " + window.location)
        }
        try {
          didFail(status, xmlhttp.readyState, xmlhttp.payload)
        } catch(err) {

        }
      }
  }

  try {
			xmlhttp.open("GET", url, true);
			xmlhttp.send();
	} catch (err) {
    try {
      didFail(-1)
    } catch(err) {

    }
    if (isChrome && !didNagChromers) {
      didNagChromers = true
      if (navigator.appVersion.indexOf("Win")!=-1)
        alert("Please start Chrome using Chrome.exe --allow-file-access-from-files "+ window.location)
      if (navigator.appVersion.indexOf("Mac")!=-1)
        alert("Please start Chrome using /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --allow-file-access-from-files " + window.location)
      else
        alert("Please start Chrome using chrome --allow-file-access-from-files " + window.location)
    }
	}
}

function loadInner(scope) {
  "use strict";

  if (scope===undefined) scope = document;
  var elements = scope.querySelectorAll('[data-inner]');

  var svgid = 1
  for (var i in elements){
    var node = elements[i]

    if (node.getAttribute) {
      var url = node.getAttribute("data-inner")
      url = url + '?t=' + Math.random()

      loadResource(url, node, function(text, payload) {
        //console.log("Did Load", text, node, payload)
        payload.innerHTML = text
      })

      /*node.setAttribute("data-inner-id", "node"+svgid)
      var container = document.createElement("object");
      container.setAttribute('id', 'svg'+svgid)
      container.setAttribute('data-inner-link', "node"+svgid)
      container.setAttribute('type', 'text/html')
      container.setAttribute('data', url)
      container.style['position'] = 'absolute'
      container.style['left'] = '-9999px'
      container.style['right'] = '-9999px'
      //container.style['visibility'] = 'hidden';
      container.addEventListener("load", function(e){
        var svg = scope.querySelector('[data-inner-id='+e.target.getAttribute('data-inner-link')+']');
        console.log(e.target, e, e.target.contentDocument.querySelector('body').firstChild.innerHTML)
        if (e.target.contentDocument.querySelector('body').firstChild.nodeName === "SVG") {
          svg.innerHTML = e.target.contentDocument.querySelector('body').firstChild.innerHTML
        } else {
          svg.innerHTML = e.target.contentDocument.querySelector('body').innerHTML
        }
        //e.target.parentNode.removeChild(e.target)
      });
      node.parentNode.insertBefore(container, node)
      svgid++
      console.log("added", container)*/
    }
  }
}

function stopTheWait(id) {
  var img = document.querySelector("[data-call-id=img"+id+"]")
  if (img) {
    img.className += "transitionHidden"
  }
}

function callScripts(scope) {
  "use strict";

  if (scope===undefined) scope = document;
  var elements = scope.querySelectorAll('[data-call]');
  var files = {}
  var callId = 1;

  //collect call information from dom enteties
  for (var i in elements){
    var node = elements[i]


    if (node.getAttribute) {
      var img = undefined
      if (!isFirefox) {
        var container = document.createElement("div");
        var parent = document.createElement("overlayContainer");
        var img = document.createElement("img");
        img.setAttribute("data-call-id", "img"+callId)
        var computedStyle = window.getComputedStyle(node, null);
        var completeStyle = computedStyle.cssText;
        if (isChrome) {
          completeStyle = completeStyle.replace(/,/g , ".")
        }
        container.style.cssText = completeStyle;
        container.style['padding'] = "0"
        container.style['border'] = "0px solid white"
        container.style['margin'] = "59,4px"
        node.style['margin'] = "0px"

        container.appendChild(parent)

        node.parentNode.replaceChild(container, node);
        parent.appendChild(node)
        parent.appendChild(img)
      }

      node.setAttribute("data-call-id", "call"+callId)

      var methodName = node.getAttribute("data-call")
      var src = node.getAttribute("data-call-src")

      var list = files[src]
      if (!list) {
        list = Array()
        files[src] = list
      }

      list.push({name:methodName, element:node, id:callId, waitImage:img})
      callId++
    }
  }

  executeCalls.applyAsync([files, container], 200)
}

function executeCalls(files, container){
  if (container===undefined) {
    container = document.querySelector('body')
  }
  //async load each referenced file once, evaluate and call all methods in sequence
  for (var file in files) {
    var data = files[file]
    var helper = "eval(__mySuperInjectedValue.name + \"(__mySuperInjectedValue.element);\")"

    var calls = ""
    for (var i in data) {
      var info = data[i]
      calls +=  info.name+"(document.querySelector('[data-call-id=call"+info.id+"]'));" + " stopTheWait("+info.id+");"
    }
    //console.log(file, calls)
    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript")
    script.setAttribute("src", file+"?t=9")
    script.setAttribute("async", "")
    script.setAttribute("onload", calls )
    container.appendChild(script)
  }
}

window.onload = function(e){
  formatSheet()
  try {
    onLoad()
  } catch(err){

  }
}
