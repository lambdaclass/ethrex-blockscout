defmodule Explorer.Chain.TransactionFrame do
  @moduledoc """
  Represents a single frame within an EIP-8141 frame transaction.

  Frame transactions (type 6) bundle multiple execution frames into one transaction.
  Each frame has a mode (DEFAULT=0, VERIFY=1, SENDER=2), a target address, gas limit, and calldata.
  """

  use Explorer.Schema

  alias Explorer.Chain.{Data, Hash, Transaction}

  @type t :: %__MODULE__{
          transaction_hash: Hash.Full.t(),
          frame_index: non_neg_integer(),
          mode: non_neg_integer(),
          target_address_hash: Hash.Address.t() | nil,
          gas_limit: Decimal.t(),
          data: Data.t(),
          status: boolean() | nil,
          gas_used: Decimal.t() | nil
        }

  @primary_key false
  schema "transaction_frames" do
    field(:frame_index, :integer, primary_key: true)
    field(:mode, :integer)
    field(:target_address_hash, Hash.Address)
    field(:gas_limit, :decimal)
    field(:data, Data)
    field(:status, :boolean)
    field(:gas_used, :decimal)

    belongs_to(:transaction, Transaction,
      foreign_key: :transaction_hash,
      primary_key: true,
      references: :hash,
      type: Hash.Full
    )

    timestamps()
  end

  @required_attrs ~w(transaction_hash frame_index mode gas_limit data)a
  @optional_attrs ~w(target_address_hash status gas_used)a

  def changeset(%__MODULE__{} = frame, attrs \\ %{}) do
    frame
    |> cast(attrs, @required_attrs ++ @optional_attrs)
    |> validate_required(@required_attrs)
    |> foreign_key_constraint(:transaction_hash)
    |> unique_constraint([:transaction_hash, :frame_index])
  end

  @doc "Mode name for display"
  def mode_name(0), do: "DEFAULT"
  def mode_name(1), do: "VERIFY"
  def mode_name(2), do: "SENDER"
  def mode_name(_), do: "UNKNOWN"
end
