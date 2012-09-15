class Lecture < ActiveRecord::Base
  belongs_to :user
  has_many :notes
  
  validates :title, :presence => true, :length => {:minimum => 2}
  
  attr_accessible :title

end
