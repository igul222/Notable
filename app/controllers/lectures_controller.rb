class LecturesController < ApplicationController
  before_filter :user_signed_in?

  def index
    @lectures = current_user.lectures.all(:order => 'created_at DESC')
  
    if params[:phone_number]
      current_user.phone_number = params[:phone_number]
      current_user.save
      flash.now[:alert] = "<strong>You've registered your phone number with Notable!</strong> You can now take notes via SMS to <strong>(484) 685-4865</strong> and they'll be added to your most recent lecture. To start a new note, send a text with the word 'start', followed by the title of your lecture."
    end
  end

  def new
    @lecture = current_user.lectures.new
  end

  def create
    @lecture = current_user.lectures.new(params[:lecture])
    if @lecture.save
      flash[:alert] = "The lecture has been created."
      redirect_to lectures_path
    else
      flash.now[:alert] = "There were errors creating your set."
      render :action => :new
    end
  end

  def show
    @lecture = current_user.lectures.find(params[:id])
  end

end