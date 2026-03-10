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
      frame_receipts = Map.get(tx, :frame_receipts, [])

      tx.frames
      |> Enum.map(fn frame ->
        receipt = Enum.find(frame_receipts, fn fr -> fr.frame_index == frame.frame_index end)

        %{
          transaction_hash: tx.hash,
          frame_index: frame.frame_index,
          mode: frame.mode,
          target_address_hash: frame.target_address_hash,
          gas_limit: frame.gas_limit,
          data: frame.data
        }
        |> merge_receipt_data(receipt)
      end)
    end)
  end

  defp merge_receipt_data(frame, nil), do: frame

  defp merge_receipt_data(frame, receipt) do
    status =
      case receipt.status do
        :ok -> true
        :error -> false
        _ -> nil
      end

    frame
    |> Map.put(:status, status)
    |> Map.put(:gas_used, receipt.gas_used)
  end
end
