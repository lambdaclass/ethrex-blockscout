defmodule Explorer.Chain.Import.Runner.TransactionFrames do
  @moduledoc """
  Bulk imports `t:Explorer.Chain.TransactionFrame.t/0`.
  """

  require Ecto.Query

  import Ecto.Query, only: [from: 2]

  alias Ecto.{Changeset, Multi, Repo}
  alias Explorer.Chain.{Import, TransactionFrame}
  alias Explorer.Prometheus.Instrumenter

  @behaviour Import.Runner

  # milliseconds
  @timeout 60_000

  @type imported :: [TransactionFrame.t()]

  @impl Import.Runner
  def ecto_schema_module, do: TransactionFrame

  @impl Import.Runner
  def option_key, do: :transaction_frames

  @impl Import.Runner
  def imported_table_row do
    %{
      value_type: "[#{ecto_schema_module()}.t()]",
      value_description: "List of `t:#{ecto_schema_module()}.t/0`s"
    }
  end

  @impl Import.Runner
  def run(multi, changes_list, %{timestamps: timestamps} = options) do
    insert_options =
      options
      |> Map.get(option_key(), %{})
      |> Map.take(~w(on_conflict timeout)a)
      |> Map.put_new(:timeout, @timeout)
      |> Map.put(:timestamps, timestamps)

    Multi.run(multi, :transaction_frames, fn repo, _ ->
      Instrumenter.block_import_stage_runner(
        fn -> insert(repo, changes_list, insert_options) end,
        :block_referencing,
        :transaction_frames,
        :transaction_frames
      )
    end)
  end

  @impl Import.Runner
  def timeout, do: @timeout

  @spec insert(Repo.t(), [map()], %{
          optional(:on_conflict) => Import.Runner.on_conflict(),
          required(:timeout) => timeout,
          required(:timestamps) => Import.timestamps()
        }) ::
          {:ok, [TransactionFrame.t()]}
          | {:error, [Changeset.t()]}
  defp insert(repo, changes_list, %{timeout: timeout, timestamps: timestamps} = options) when is_list(changes_list) do
    on_conflict = Map.get_lazy(options, :on_conflict, &default_on_conflict/0)
    conflict_target = [:transaction_hash, :frame_index]
    ordered_changes_list = Enum.sort_by(changes_list, &{&1.transaction_hash, &1.frame_index})

    {:ok, _} =
      Import.insert_changes_list(
        repo,
        ordered_changes_list,
        for: TransactionFrame,
        on_conflict: on_conflict,
        conflict_target: conflict_target,
        returning: true,
        timeout: timeout,
        timestamps: timestamps
      )
  end

  defp default_on_conflict do
    from(
      frame in TransactionFrame,
      update: [
        set: [
          mode: fragment("EXCLUDED.mode"),
          flags: fragment("EXCLUDED.flags"),
          target_address_hash: fragment("EXCLUDED.target_address_hash"),
          gas_limit: fragment("EXCLUDED.gas_limit"),
          data: fragment("EXCLUDED.data"),
          status: fragment("EXCLUDED.status"),
          gas_used: fragment("EXCLUDED.gas_used"),
          inserted_at: fragment("LEAST(?, EXCLUDED.inserted_at)", frame.inserted_at),
          updated_at: fragment("GREATEST(?, EXCLUDED.updated_at)", frame.updated_at)
        ]
      ],
      where:
        fragment(
          "(EXCLUDED.mode, EXCLUDED.target_address_hash, EXCLUDED.gas_limit, EXCLUDED.data, EXCLUDED.status, EXCLUDED.gas_used) IS DISTINCT FROM (?, ?, ?, ?, ?, ?)",
          frame.mode,
          frame.target_address_hash,
          frame.gas_limit,
          frame.data,
          frame.status,
          frame.gas_used
        )
    )
  end
end
