require 'open-uri'

class TwilioController < ApplicationController
  protect_from_forgery :except => [:process_sms, :process_call]

  # put your own credentials here
  account_sid = ''
  auth_token = ''

  # set up a client to talk to the Twilio REST API
  @client = Twilio::REST::Client.new(account_sid, auth_token)
  
  def process_sms
    from = params[:From]
    to = params[:To]
    body = params[:Body]
    
    user = User.find_by_phone_number(from)
    
    if body.strip.split(' ')[0].downcase == 'start'
      user.lectures.create(:title => body.strip.split(' ')[1..-1].join(' '))
    else
      lecture = user.lectures.first(:order=>"created_at DESC")
      lecture.notes.create(:text => body.strip)
    end

    render :text => 'OK'
  end
  
  def process_call
    from =(params[:From]).gsub"%2B","+1"
    user = User.find_by_phone_number(from)
    # build up a response
    response = Twilio::TwiML::Response.new do |r|
      r.Say 'Hello there, your lecture is now recording', :voice => 'woman'
      r.Record :finishOnKey => '#', :maxLength => '7200'
    end
    
    # print the result
    render :text => response.text
   end
   
   def self.get_audio(start_time, interval, user)
     @user=user
     phone_number=@user.phone_number
     account = @client.account
     calls=account.calls.list({})
     return nil if account.recordings.list({}).blank?
          
     user_recordings=Array.new
     account.recordings.list({}).each do |r|
       #rJsonUrl=r.mp3.gsub"mp3","json"
       rJson=JSON.parse(open(r.mp3.gsub "mp3","json").read)
       callsid=rJson['call_sid']
       call=account.calls.get(callsid)

       if call.from==phone_number && ( (call.start_time.to_time - start_time) < interval.minutes)
          user_recordings << {:recording => r, :start_time => call.start_time.to_time}
       end
     end
     user_recordings.sort_by!{|ur| -1*ur[:start_time].to_i }
     (user_recordings.count > 0 ? user_recordings.first : nil)
   end
   
  end
