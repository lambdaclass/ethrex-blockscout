defmodule Explorer.Repo.Migrations.AddPayerToTransactions do
  use Ecto.Migration

  def change do
    alter table(:transactions) do
      add(:payer_address_hash, :bytea, null: true)
    end
  end
end
