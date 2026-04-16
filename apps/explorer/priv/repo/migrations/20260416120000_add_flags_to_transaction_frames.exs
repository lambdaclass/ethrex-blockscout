defmodule Explorer.Repo.Migrations.AddFlagsToTransactionFrames do
  use Ecto.Migration

  def change do
    alter table(:transaction_frames) do
      add(:flags, :integer, default: 0)
    end
  end
end
