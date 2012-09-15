class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :omniauthable

  has_many :lectures
  
  validate :validate_and_modify_phone_number

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me
  attr_accessible :provider, :uid
  attr_accessible :phone_number
  attr_accessible :name

  def self.find_for_facebook_oauth(auth, signed_in_resource=nil)
    user = User.where(:provider => auth.provider, :uid => auth.uid).first
    unless user
      user = User.create(name:auth.extra.raw_info.name,
                           provider:auth.provider,
                           uid:auth.uid,
                           email:auth.info.email,
                           password:Devise.friendly_token[0,20]
                           )
    end
    user
  end

  def self.new_with_session(params, session)
    super.tap do |user|
      if data = session["devise.facebook_data"] && session["devise.facebook_data"]["extra"]["raw_info"]
        user.email = data["email"] if user.email.blank?
      end
    end
  end
  
  def validate_and_modify_phone_number
    if is_numeric(phone_number)
      add_country_code(phone_number)
      true
    else
      phonenumber=phonenumber.gsub('')[0-9]
      add_country_code(phone_number)
    end
  end
  
  def is_numeric(number)
    true if number=~ /^[0-9]+$/
    rescue false
  end
  
  def add_country_code(number)
    if number[0]='1'
       number="+"+number
    else
       number="+1"+numbers
    end
  end

end
