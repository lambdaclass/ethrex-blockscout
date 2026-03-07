defmodule Explorer.Repo.Migrations.CreateTransactionFrames do
  use Ecto.Migration

  def change do
    create table(:transaction_frames, primary_key: false) do
      add(:transaction_hash, references(:transactions, column: :hash, type: :bytea, on_delete: :delete_all),
        null: false,
        primary_key: true
      )

      add(:frame_index, :integer, null: false, primary_key: true)
      add(:mode, :integer, null: false)
      add(:target_address_hash, :bytea, null: true)
      add(:gas_limit, :numeric, precision: 100, null: false)
      add(:data, :bytea, null: false)

      timestamps(null: false, type: :utc_datetime_usec)
    end

    create(index(:transaction_frames, [:transaction_hash]))
  end
end
