$.ajaxSetup({
  beforeSend: function(xhr) {
    xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
  }
});

function getRelevantLines(timestamp, s) {
  return [
    {timestamp: 1347691044295, user: 'Everyone', text: 'arglegarble'},
    {timestamp: 1347691044999, user: 'Everyone', text: 'This makes complete sense'},
    {timestamp: 1347691041111, user: 'Bob', text: 'no it doesn\'t'},
    {timestamp: 1347791041111, user: 'Bob', text: 'I\'M FROM THE FUTURE'}
  ];
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
        // if there aren't any lines already with  the same id
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
  }, "json");
  $('.addedlocally').hide();
  lastupdatetimestamp = Date.now();
  // check again in 1 second
  window.setTimeout(pollForUpdates, 1000);
}

function sendLineToServer(text) {
  var url = window.lecture_notes_url;
  $.post(url, {text: text}, function() {
    console.log('sent line: '+text);
  });
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
    "<tr class=\"noteline" + rowclasses + "\" id=\"row"+lines.length+"\"><td>" + timestamp.toLocaleTimeString() +
    "</td><td>" + confusing + important + 
    "</td><td class=\"" + classes + "\">" +
    inputline +
    "</td></tr>"
  );
  lines[lines.length] = {id: id, timestamp: timestamp, text: inputline};
}

$(document).ready(function() {
  lines = []; // GLOBAL. :(
  lastupdatetimestamp = 0;
  $('#noteinput').keypress(function(e) {
    var inputline = $('#noteinput').val();
    if (e.which === 13 && inputline !== '') {
      var timestamp = new Date();
      // id only applies to things pulled from surver
      addLine(null, timestamp, inputline, true);
      $('#noteinput').val('');
      sendLineToServer(inputline);
    }
  });
  $(document).on("click", ".noteline", function(e) {
    var id = e.currentTarget.id;
    var target = $('#'+id);
    if (target.hasClass('selectedline')) return;
    var clickedline = lines[id.substring(3)];
    var context = getRelevantLines(clickedline.timestamp, clickedline.text);
    if (context) {
      target.addClass('selectedline');
console.log('timestamp: '+line.timestamp);
      var before = context.filter(function (line) {
        return(line.timestamp < clickedline.timestamp);
      });
      var after = context.filter(function (line) {
        return(line.timestamp > clickedline.timestamp);
      });
      before.map(function(line) {
        var timestamp = new Date(line.timestamp);
        $('#'+e.currentTarget.id).before(
          "<tr class=\"muted\"><td>" + 
          timestamp.toLocaleTimeString() + 
          "</td><td></td><td>" + line.text + " -- " + line.user + "</td></tr>"
        );
      });
      after.map(function(line) {
        var timestamp = new Date(line.timestamp);
        $('#'+e.currentTarget.id).after(
          "<tr class=\"muted\"><td>" + 
          timestamp.toLocaleTimeString() + 
          "</td><td></td><td>" + line.text + " -- " + line.user + "</td></tr>"
        );
      });
    }
  });
  $('#showall').on('click', function() {setShownTypes('all')});
  $('#showimportant').on('click', function() {setShownTypes('important')});
  $('#showconfusing').on('click', function() {setShownTypes('confusing')});
  pollForUpdates();
});
