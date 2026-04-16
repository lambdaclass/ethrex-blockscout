defmodule Explorer.Chain.TransactionFrame do
  @moduledoc """
  Represents a single frame within an EIP-8141 frame transaction.

  Frame transactions (type 6) bundle multiple execution frames into one transaction.
  Each frame has a mode (DEFAULT=0, VERIFY=1, SENDER=2) and flags (bits 0-1: approval scope,
  bit 2: atomic batch), plus a target address, gas limit, and calldata.
  """

  use Explorer.Schema

  alias Explorer.Chain.{Data, Hash, Transaction}

  @type t :: %__MODULE__{
          transaction_hash: Hash.Full.t(),
          frame_index: non_neg_integer(),
          mode: non_neg_integer(),
          flags: non_neg_integer(),
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
    field(:flags, :integer, default: 0)
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
  @optional_attrs ~w(target_address_hash flags status gas_used)a

  def changeset(%__MODULE__{} = frame, attrs \\ %{}) do
    frame
    |> cast(attrs, @required_attrs ++ @optional_attrs)
    |> validate_required(@required_attrs)
    |> foreign_key_constraint(:transaction_hash)
    |> unique_constraint([:transaction_hash, :frame_index])
  end

  @doc "Execution mode name"
  def mode_name(0), do: "DEFAULT"
  def mode_name(1), do: "VERIFY"
  def mode_name(2), do: "SENDER"
  def mode_name(_), do: "UNKNOWN"

  @doc "Approval scope from flags bits 0-1 (0x1=PAYMENT, 0x2=EXECUTION, 0x3=both)"
  def scope_restriction(flags) when is_integer(flags), do: Bitwise.band(flags, 0x03)

  @doc "Whether this frame is part of an atomic batch (bit 2 of flags)"
  def atomic_batch?(flags) when is_integer(flags), do: Bitwise.band(Bitwise.bsr(flags, 2), 1) == 1
end
