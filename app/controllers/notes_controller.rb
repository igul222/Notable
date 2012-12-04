require 'open-uri'

class NotesController < ApplicationController
  @@nature_api_key = ''

  before_filter :user_signed_in?

  def index
    notes = current_user.lectures.find(params[:lecture_id]).notes.all(:conditions => ['created_at >= ?',Time.at(params[:since].to_i/1000.0)])
    render :text => notes.to_json
  end

  def related
    keyword = params[:text].downcase.gsub(/[^0-9a-zA-Z]/,' ').split(' ').sort_by {|str| -1*str.length}[0]

    ddg = JSON.parse(open("https://duckduckgo.com/?o=json&q=#{keyword}").read)
    @ddg = nil
    if ddg['Abstract'].blank?
      @ddg = keyword+': '+ddg['RelatedTopics'][0]['Result'] rescue nil
    else
      @ddg = "<a href='#{ddg['AbstractURL']}'>#{ddg['Abstract']}</a>" rescue nil
    end
    @ddg = @ddg.html_safe if @ddg

    @nature = nil
    nature = JSON.parse(open("http://api.nature.com/content/opensearch/request?queryType=cql&query=cql.keywords+any+#{keyword}&httpAccept=application/json&api_Key=#{@@nature_api_key}").read) rescue nil
    @nature = "<a href='#{nature['feed']['entry'][0]['link']}'>#{nature['feed']['entry'][0]['title']}</a>" rescue nil
    @nature = @nature.html_safe rescue nil

    dt = 1.minutes
    t0 = Time.at(params[:timestamp].to_i/1000.0) - dt
    t1 = Time.at(params[:timestamp].to_i/1000.0) + dt
    @notes = Note.where(:created_at => t0..t1)
    @notes = Note.all(:conditions => ['created_at > ? AND created_at < ?',t0,t1])
    render :layout => false
  end

  def create
    current_user.lectures.find(params[:lecture_id]).notes.create(:text => params[:text])
    render :text => 'OK'
  end

end