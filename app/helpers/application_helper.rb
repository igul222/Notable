module ApplicationHelper
  def flashes
    ret = ""
    [:alert, :notice].each do |m|
      ret += "<div class='alert'>#{flash[m]}</div>" if flash[m]
    end
    ret.html_safe
  end
end
