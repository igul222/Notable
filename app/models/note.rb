class Note < ActiveRecord::Base
  belongs_to :lecture
  
  validates :text, :presence => true, :length => {:minimum => 2}
  
  attr_accessible :text
end
