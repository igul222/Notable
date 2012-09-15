class HomeController < ApplicationController

  def index
    redirect_to lectures_path if user_signed_in?
  end

end
