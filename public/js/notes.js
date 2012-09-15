function getRelevantLines(timestamp, s) {
  return {before: [{timestamp: 1347691044295, user: 'Everyone', text: 'arglegarble'},{timestamp: 1347691044999, user: 'Everyone', text: 'This makes complete sense'}], after: [{timestamp: 1347691041111, user: 'Bob', text: 'no it doesn\'t'}]};
}

$(document).ready(function() {
  var linenum = 0;
  var lines = [];
  $('#noteinput').keypress(function(e) {
    if (e.which === 13) {
      var inputline = $('#noteinput').val();
      var timestamp = new Date();
      var important = (inputline.indexOf("!!") < 0) ? "" : "<i class=\"icon-star\"></i>";
      var confusing = (inputline.indexOf("??") < 0) ? "" : "<i class=\"icon-question-sign\"></i>";
      $('#notelog').append(
        "<tr class=\"noteline\" id=\"row"+linenum+"\"><td>" + timestamp.toLocaleTimeString() +
        "</td><td>" + confusing + important + 
        "</td><td>" +
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
    var context = getRelevantLines(lines[id.substring(3)].timestamp, lines[id.substring(3)].text);
    if (context) {
      target.addClass('text-info');
      context.before.map(function(line) {
        var timestamp = new Date(line.timestamp);
        $('#'+e.currentTarget.id).before(
          "<tr class=\"muted\"><td>" + 
          timestamp.toLocaleTimeString() + 
          "</td><td></td><td>" + line.text + " -- " + line.user + "</td></tr>"
        );
      });
      context.after.map(function(line) {
        var timestamp = new Date(line.timestamp);
        $('#'+e.currentTarget.id).after(
          "<tr class=\"muted\"><td>" + 
          timestamp.toLocaleTimeString() + 
          "</td><td></td><td>" + line.text + " -- " + line.user + "</td></tr>"
        );
      });
    }
  });
});
