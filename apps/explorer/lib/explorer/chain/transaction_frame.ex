defmodule Explorer.Chain.TransactionFrame do
  @moduledoc """
  Represents a single frame within an EIP-8141 frame transaction.

  Frame transactions (type 6) bundle multiple execution frames into one transaction.
  Each frame has a mode field encoding execution mode (bits 0-7: DEFAULT=0, VERIFY=1, SENDER=2),
  scope restriction (bits 8-9), and atomic batch flag (bit 10), plus a target address, gas limit, and calldata.
  """

  use Explorer.Schema

  alias Explorer.Chain.{Data, Hash, Transaction}

  import Bitwise

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

  @doc "Execution mode name (from lower 8 bits of mode field)"
  def mode_name(mode) when is_integer(mode) do
    case mode &&& 0xFF do
      0 -> "DEFAULT"
      1 -> "VERIFY"
      2 -> "SENDER"
      _ -> "UNKNOWN"
    end
  end

  @doc "Scope restriction from mode bits 8-9 (0=any, 1=sender, 2=payer, 3=combined)"
  def scope_restriction(mode) when is_integer(mode), do: (mode >>> 8) &&& 3

  @doc "Whether this frame is part of an atomic batch (bit 10 of mode)"
  def atomic_batch?(mode) when is_integer(mode), do: ((mode >>> 10) &&& 1) == 1

  @doc "Extract just the execution mode (lower 8 bits)"
  def execution_mode(mode) when is_integer(mode), do: mode &&& 0xFF
end
