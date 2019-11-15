# frozen_string_literal: true

Sequel.migration do
  up do
    create_table(:users) do
      primary_key :id
      Date :created_at, null: false
      String :github_token, null: false
      String :login, null: false
    end
  end

  down do
    drop_table(:users)
  end
end
