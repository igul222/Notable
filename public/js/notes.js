function getRelevantLines(timestamp, s) {
  return [
    {timestamp: 1347691044295, user: 'Everyone', text: 'arglegarble'},
    {timestamp: 1347691044999, user: 'Everyone', text: 'This makes complete sense'},
    {timestamp: 1347691041111, user: 'Bob', text: 'no it doesn\'t'},
    {timestamp: 1347791041111, user: 'Bob', text: 'I\'M FROM THE FUTURE'}
  ];
}

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

$(document).ready(function() {
  var linenum = 0;
  var lines = [];
  $('#noteinput').keypress(function(e) {
    var inputline = $('#noteinput').val();
    if (e.which === 13 && inputline !== '') {
      var timestamp = new Date();
      var classes = "";
      var rowclasses= "";
      var important = "";
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
        "<tr class=\"noteline" + rowclasses + "\" id=\"row"+linenum+"\"><td>" + timestamp.toLocaleTimeString() +
        "</td><td>" + confusing + important + 
        "</td><td class=\"" + classes + "\">" +
        inputline +
        "</td></tr>"
      );
      lines[linenum] = {timestamp: timestamp, text: inputline};
      linenum++;
      $('#noteinput').val('');
    }
  });
  $(document).on("click", ".noteline", function(e) {
    var id = e.currentTarget.id;
    var target = $('#'+id);
    if (target.hasClass('text-info')) return;
    var clickedline = lines[id.substring(3)];
    var context = getRelevantLines(clickedline.timestamp, clickedline.text);
    if (context) {
      target.addClass('selectedline');
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
});
