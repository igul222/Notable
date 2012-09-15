class Note < ActiveRecord::Base
  belongs_to :lecture
  attr_accessible :text
end
