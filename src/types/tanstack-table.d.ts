declare module '@tanstack/table-core' {
    export type ColumnDef<T> = any;
    export type ColumnFiltersState = any;
    export type PaginationState = any;
    export type RowSelectionState = any;
    export type SortingState = any;
    export type VisibilityState = any;
    
    export function getCoreRowModel(): any;
    export function getFilteredRowModel(): any;
    export function getPaginationRowModel(): any;
    export function getSortedRowModel(): any;
}