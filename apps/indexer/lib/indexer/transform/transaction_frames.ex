defmodule Indexer.Transform.TransactionFrames do
  @moduledoc """
  Extracts frame data from EIP-8141 frame transactions (type 6).
  """

  @doc """
  Parses frame data from transactions that have a `:frames` field.

  Returns a list of maps ready for database import into the `transaction_frames` table.
  """
  @spec parse([map()]) :: [map()]
  def parse(transactions) do
    transactions
    |> Enum.filter(&Map.has_key?(&1, :frames))
    |> Enum.flat_map(fn tx ->
      tx.frames
      |> Enum.map(fn frame ->
        %{
          transaction_hash: tx.hash,
          frame_index: frame.frame_index,
          mode: frame.mode,
          target_address_hash: frame.target_address_hash,
          gas_limit: frame.gas_limit,
          data: frame.data
        }
      end)
    end)
  end
end
