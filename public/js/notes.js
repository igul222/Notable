$.ajaxSetup({
  beforeSend: function(xhr) {
    xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
  }
});

function getRelevantLines(timestamp, originaltarget, text) {
  var url = window.related_lecture_notes_url;
  $.get(url, {timestamp: timestamp.getTime(), text: text}, function(data) {
    originaltarget.addClass('selectedline');
    originaltarget.children(':last').append(data);
  });
}

function formatRelevantLines(context, timestamp, originaltarget) {
  if (context) {
    originaltarget.addClass('selectedline');
    originaltarget.after("<div class=\"muted\" id='relevantlines"+timestamp+"'></div>");
    context.map(function(line) {
      $('#relevantlines'+line.timestamp).appendChild(
        formatTime(new Date(line.timestamp)) + " " + line.text + " -- " 
      + line.user);
    });
  }
}

function addLine(id, timestamp, inputline, addedlocally) {
  // local only! this also gets called when we get a line back from the server
  var classes = "";
  var rowclasses= "";
  var important = "";

  if (addedlocally) rowclasses = rowclasses + " addedlocally";
  if (inputline.indexOf("!!") > -1) {
    important = "<i class=\"icon-star\"></i>";
    classes = classes + " importantline";
    rowclasses = rowclasses + " importantrow";
  }
  var confusing = "";
  if (inputline.indexOf("??") > -1) {
    confusing = "<i class=\"icon-question-sign\"></i>";
    classes = classes + " text-error";
    rowclasses = rowclasses + " confusingrow";
  }
  $('#notelog').append(
    "<tr class=\"noteline" + rowclasses + "\" id=\"row"+lines.length+"\"><td>" + confusing + important +
    "</td><td id=\"timestamp" + timestamp.getTime() + "\" class='muted'>" + formatTime(timestamp) +
    "</td><td class=\"" + classes + "\">" +
    inputline +
    "</td></tr>"
  );
  lines[lines.length] = {id: id, timestamp: timestamp, text: inputline};

  // // only get resources if marked as confusing
  // if (confusing != "") {
  //   // very sophisticated keyword extraction algorithm >_>
  //   var keyword = inputline.split(" ").sort(
  //     function(a, b) { return b.length - a.length })[0];
  //   console.log(keyword);
  //   $.getJSON("http://api.springer.com/metadata/jsonp?q=" + "galois" + "&api_Key=" + "a6gkhpf9u4xsw62xc5bmkfpc" + "&callback=?", function (data) {
  //     console.log(data);
  //   });
  // }
  // add little accordiony thing with relevant other notes
  //getRelevantLines(timestamp, $('#row'+(lines.length-1)));
}


/**
 * handles the dropdown to hide certain types of lines
 */
function setShownTypes(type) {
  switch (type) {
    case 'all':
       $('tr').show();
    break;
    case 'important':
      $('tr').hide();
      $('.importantrow').show();
    break;
    case 'confusing':
      $('tr').hide();
      $('.confusingrow').show();
    break;
  }
  $('#headerrow').show();
}
function pollForUpdates() {
  var url = window.lecture_notes_url;
  $.get(url, {since: lastupdatetimestamp}, function(newlines) {
    // if we get data back:
    if (newlines) {
      for (var i = 0; i < newlines.length; i++) {
        // if there aren't any lines already with the same id
        if (lines.filter(function(oldline) {
          return (oldline.id === newlines[i].id);
        }).length === 0) {
          // add line to log
          addLine(
            newlines[i].id, 
            new Date(newlines[i].timestamp), 
            newlines[i].text,
            false
          );
        }
      }
    }
    $('.addedlocally').hide();
  }, "json");
  // make mathjax check for new latex
  MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
  lastupdatetimestamp = Date.now() - 10000;
  // check again in 1 second
  window.setTimeout(pollForUpdates, 1000);
}

function sendLineToServer(text) {
  var url = window.lecture_notes_url;
  $.post(url, {text: text}, function() {
    console.log('sent line: '+text);
  });
}

function formatTime(time) {
  return time.toTimeString().match(/^[0-9]{2}:[0-9]{2}/);
}

$(document).ready(function() {
  lines = []; // GLOBAL. :(
  lastupdatetimestamp = 0;
  $('#noteinput').keypress(function(e) {
    var inputline = $('#noteinput').val();
    if (e.which === 13 && inputline !== '') {
      var timestamp = new Date();
      // id only applies to things pulled from surver
      sendLineToServer(inputline);
      $('#noteinput').val('');
    }
  });
  $(document).on("click", ".noteline", function(e) {
    var id = e.currentTarget.id;
    var target = $('#'+id);
    if (target.hasClass('selectedline')) return;
    var clickedline = lines[id.substring(3)];
    getRelevantLines(clickedline.timestamp, target, clickedline.text)
  });


  $('#showall').on('click', function() {setShownTypes('all')});
  $('#showimportant').on('click', function() {setShownTypes('important')});
  $('#showconfusing').on('click', function() {setShownTypes('confusing')});
  pollForUpdates();

});
