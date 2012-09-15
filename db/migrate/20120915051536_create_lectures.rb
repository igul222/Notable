class CreateLectures < ActiveRecord::Migration
  def change
    create_table :lectures do |t|
      t.string :title
      t.integer :user_id

      t.timestamps
    end
  end
end
