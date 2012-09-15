class LecturesController < ApplicationController
  before_filter :user_signed_in?

  def index
    @lectures = current_user.lectures
  end

  def show
  end

end
