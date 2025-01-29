<script lang="ts">
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import {
    type ColumnDef,
    type ColumnFiltersState,
    type PaginationState,
    type RowSelectionState,
    type SortingState,
    type VisibilityState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel
  } from "@tanstack/table-core";
  import { createRawSnippet } from "svelte";
  // import DataTableCheckbox from "./data-table/data-table-checkbox.svelte";
  import * as Table from "$lib/components/ui/table/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import {
    FlexRender,
    createSvelteTable,
    renderComponent,
    renderSnippet
  } from "$lib/components/ui/data-table/index.js";

  // Import the email-specific components
  import { EmailTag, EmailPreview, EmailAmount, EmailSubject, RowAction } from "./email-table-components/index.js";

  type EmailTransaction = {
    id: string;
    amount: number;
    currency: string;
    subject: string;
    body: string;
    tag: string;
  };

  let { emails, emailTags, selectedLabels, handleSelect, closeAndFocusTrigger } = $props();

  // Define Table Columns with Rendered Components
  const columns: ColumnDef<EmailTransaction>[] = [
    // {
    //   id: "select",
    //   header: ({ table }) =>
    //     renderComponent(DataTableCheckbox, {
    //       checked: table.getIsAllPageRowsSelected(),
    //       indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
    //       onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
    //       "aria-label": "Select all"
    //     }),
    //   cell: ({ row }) =>
    //     renderComponent(DataTableCheckbox, {
    //       checked: row.getIsSelected(),
    //       onCheckedChange: (value) => row.toggleSelected(!!value),
    //       "aria-label": "Select row"
    //     }),
    //   enableSorting: false,
    //   enableHiding: false
    // },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: { row: any }) =>
        renderComponent(EmailAmount, {
          amount: row.original.amount,
          currency: row.original.currency,
      
        })
    },
    {
      accessorKey: "subject",
      header: "Transaction",
      cell: ({ row }: { row: any }) =>
        renderComponent(EmailSubject, {
          subject: row.original.subject,
      
        })
    },
    {
      accessorKey: "tag",
      header: "Tag",
      cell: ({ row }: { row: any }) =>
        renderComponent(EmailTag, {
          tag: row.original.tag
        })
    },
    {
      accessorKey: "body",
      header: "Details",
      cell: ({ row }: { row: any }) =>
        renderComponent(EmailPreview, {
          body: row.original.body
        })
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }: { row: any }) =>
        renderComponent(RowAction, {
          id: row.original.id,
          emailTags: emailTags,
          selectedLabels: selectedLabels,
          i: row.index,
          handleSelect: handleSelect,
          closeAndFocusTrigger: closeAndFocusTrigger
        })
    }
  ];

  // Table States
  let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
  let sorting = $state<SortingState>([]);
  let columnFilters = $state<ColumnFiltersState>([]);
  let rowSelection = $state<RowSelectionState>({});
  let columnVisibility = $state<VisibilityState>({});

  const table = createSvelteTable({
    get data() {
      return emails;
    },
    columns,
    state: {
      get pagination() {
        return pagination;
      },
      get sorting() {
        return sorting;
      },
      get columnVisibility() {
        return columnVisibility;
      },
      get rowSelection() {
        return rowSelection;
      },
      get columnFilters() {
        return columnFilters;
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: (updater: any) => (pagination = typeof updater === "function" ? updater(pagination) : updater),
    onSortingChange: (updater: any) => (sorting = typeof updater === "function" ? updater(sorting) : updater),
    onColumnFiltersChange: (updater: any) => (columnFilters = typeof updater === "function" ? updater(columnFilters) : updater),
    onColumnVisibilityChange: (updater: any) => (columnVisibility = typeof updater === "function" ? updater(columnVisibility) : updater),
    onRowSelectionChange: (updater: any) => (rowSelection = typeof updater === "function" ? updater(rowSelection) : updater)
  });
</script>

<!-- Table UI -->
<div class="w-full">
  <div class="flex items-center py-4">
    <Input
      placeholder="Filter transactions..."
      value={(table.getColumn("subject")?.getFilterValue() as string) ?? ""}
      oninput={(e) => table.getColumn("subject")?.setFilterValue(e.currentTarget.value)}
      class="max-w-sm"
    />
  </div>

  <div class="rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head>
                {#if !header.isPlaceholder}
                  <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>

      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row>
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell>
                <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
              </Table.Cell>
            {/each}
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell colspan={columns.length} class="h-24 text-center">
              No results found.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  <div class="flex items-center justify-end space-x-4 py-4">
    <Button variant="outline" size="sm" onclick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
      Previous
    </Button>
    <Button variant="outline" size="sm" onclick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
      Next
    </Button>
  </div>
</div>
