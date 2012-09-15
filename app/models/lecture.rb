class Lecture < ActiveRecord::Base
  belongs_to :user
  has_many :notes
  attr_accessible :title
end
