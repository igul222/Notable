class Note < ActiveRecord::Base
  belongs_to :lecture
  validates :text, :presence => true
  attr_accessible :text

  def as_json(options = nil)
    {
      :id => id,
      :timestamp => created_at.to_time.to_i*1000,
      :text => text
    }
  end
end
