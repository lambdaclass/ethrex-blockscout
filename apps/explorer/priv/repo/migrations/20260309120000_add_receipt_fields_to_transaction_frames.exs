defmodule Explorer.Repo.Migrations.AddReceiptFieldsToTransactionFrames do
  use Ecto.Migration

  def change do
    alter table(:transaction_frames) do
      add(:status, :boolean, null: true)
      add(:gas_used, :numeric, precision: 100, null: true)
    end
  end
end
