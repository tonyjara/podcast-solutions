import {
    Box,
    Card,
    CardHeader,
    chakra,
    Flex,
    Menu,
    MenuDivider,
    MenuGroup,
    MenuItem,
    MenuList,
    Portal,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorModeValue,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import SkeletonRows from "./Utils/SkeletonRows";
import { CloseIcon, TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import type { ColumnDef, Header, SortingState } from "@tanstack/react-table";
import {
    useReactTable,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
} from "@tanstack/react-table";
import { customScrollbar } from "@/styles/CssUtils";
import TablePagination from "./TablePagination";
import TableTitleMenu from "./Utils/TableTitleMenu";
import ColumnFilter from "./ColumnFilter";

export interface TableOptions {
    onClick: () => void;
    label: string;
}
export type RowOptionsType = (props: {
    x: any;
    setMenuData: React.Dispatch<
        React.SetStateAction<{
            x: number;
            y: number;
            rowData: any | null;
        }>
    >;
}) => JSX.Element;

export interface DynamicTableProps<T extends object> {
    title?: string;
    showFooter?: boolean;
    headerComp?: React.ReactNode;
    headerLeftComp?: React.ReactNode;
    headerRightComp?: React.ReactNode;
    subTitle?: string;
    options?: TableOptions[]; // enables three dot menu
    searchBar?: React.ReactNode;
    loading?: boolean;
    noHeader?: boolean;
    data?: T[];
    h?: string;
    columns?: ColumnDef<T, any>[];
    pageIndex: number;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
    pageSize: number;
    setPageSize: React.Dispatch<React.SetStateAction<number>>;
    count?: number;
    sorting: SortingState;
    setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
    globalFilter?: boolean;
    colorRedKey?: string[];
    rowOptions?: RowOptionsType;
    enableColumnFilters?: boolean; // If enabled by default all columns will have a filter.
    whereFilterList?: any[];
    setWhereFilterList?: React.Dispatch<React.SetStateAction<any[]>>;
    rowActions?: (x: any) => void; // Function that takes row data and as parameter
}

const DynamicTable = <T extends object>({
    title,
    showFooter,
    options,
    subTitle,
    searchBar,
    loading,
    noHeader,
    data,
    headerLeftComp,
    headerRightComp,
    columns,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    count,
    sorting,
    setSorting,
    globalFilter,
    headerComp,
    colorRedKey,
    rowOptions,
    enableColumnFilters,
    whereFilterList,
    setWhereFilterList,
    rowActions,
}: DynamicTableProps<T>) => {
    const [menuData, setMenuData] = useState<{
        x: number;
        y: number;
        rowData: any | null;
    }>({ x: 0, y: 0, rowData: null });

    const backgroundColor = useColorModeValue("white", "gray.800");

    const table = useReactTable({
        columns: columns ?? [],
        data: data ?? [],
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: !globalFilter ? setSorting : undefined,
        getSortedRowModel: !globalFilter ? getSortedRowModel() : undefined,
        state: { sorting },
        enableColumnFilters: !!enableColumnFilters,
    });

    const handleToggleSorting = (header: Header<T, unknown>) => {
        if (!sorting.length) {
            setSorting([{ id: header.column.id, desc: true }]);
        }
        if (sorting[0]?.desc) {
            setSorting([{ id: header.column.id, desc: false }]);
        }
        if (sorting[0] && !sorting[0].desc) {
            setSorting([]);
        }
    };

    const redRowColor = useColorModeValue("red.700", "red.300");
    const rowHoverColor = useColorModeValue("gray.100", "gray.700");

    const cellRef = useRef(null);

    return (
        <Card
            w="100%"
            css={customScrollbar}
            overflow={"auto"}
            backgroundColor={backgroundColor}
            maxH="calc(100vh - 80px)"
        >
            {!noHeader && (
                <CardHeader display="flex" w="100%" flexDirection="column">
                    <Flex flexDirection={{ base: "column", md: "row" }} gap="10px">
                        <Flex flexDirection={"column"}>
                            <Flex alignItems={"center"} gap="20px" flexDirection={"row"}>
                                {headerLeftComp}
                                <TableTitleMenu
                                    globalFilter={globalFilter}
                                    label={title}
                                    options={options}
                                />
                                {headerRightComp}
                            </Flex>
                            {subTitle && (
                                <Text as="em" py="10px" px="5px">
                                    {subTitle}
                                </Text>
                            )}
                        </Flex>
                        {searchBar}
                    </Flex>
                    <Box alignSelf="start">{headerComp}</Box>
                </CardHeader>
            )}
            <Table
                css={customScrollbar}
                overflowX={"scroll"}
                size={["sm", "md"]}
                variant={"simple"}
                backgroundColor={backgroundColor}
            >
                <Thead>
                    {!loading && !data?.length && (
                        <Tr>
                            <Th>
                                <Text>No data</Text>
                            </Th>
                        </Tr>
                    )}
                    {data &&
                        data?.length > 0 &&
                        table.getHeaderGroups().map((headerGroup) => (
                            <Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
                                    const meta: any = header.column.columnDef.meta;

                                    return (
                                        <Th
                                            cursor={
                                                header.column.accessorFn?.length ? "pointer" : undefined
                                            }
                                            key={header.id}
                                            onClick={() => handleToggleSorting(header)}
                                            isNumeric={meta?.isNumeric}
                                            color={
                                                globalFilter && header.id === "no-global-sort"
                                                    ? "red.300"
                                                    : undefined
                                            }
                                        >
                                            <Flex>
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}

                                                <chakra.span pl="4">
                                                    {!globalFilter && header.column.getIsSorted() ? (
                                                        header.column.getIsSorted() === "desc" ? (
                                                            <TriangleDownIcon aria-label="sorted descending" />
                                                        ) : (
                                                            <TriangleUpIcon aria-label="sorted ascending" />
                                                        )
                                                    ) : null}
                                                    {globalFilter &&
                                                        sorting[0] &&
                                                        sorting[0].id === header.column.id ? (
                                                        sorting[0]?.desc ? (
                                                            <TriangleDownIcon aria-label="sorted descending" />
                                                        ) : (
                                                            <TriangleUpIcon aria-label="sorted ascending" />
                                                        )
                                                    ) : null}
                                                </chakra.span>
                                            </Flex>
                                        </Th>
                                    );
                                })}
                            </Tr>
                        ))}
                    {enableColumnFilters &&
                        whereFilterList &&
                        setWhereFilterList &&
                        table.getHeaderGroups().map((headerGroup) => (
                            <Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <Th key={header.id}>
                                            <ColumnFilter
                                                whereFilterList={whereFilterList}
                                                setWhereFilterList={setWhereFilterList}
                                                column={header.column}
                                            />
                                        </Th>
                                    );
                                })}
                            </Tr>
                        ))}
                </Thead>
                <Tbody>
                    {!loading &&
                        data &&
                        table?.getRowModel().rows.map((row) => (
                            <Tr
                                color={
                                    //Colors rows, used for cancelled rows
                                    //@ts-ignore
                                    colorRedKey && colorRedKey.some((key) => !!row.original[key])
                                        ? redRowColor
                                        : undefined
                                }
                                key={row.id}
                                _hover={
                                    rowOptions || rowActions
                                        ? { backgroundColor: rowHoverColor, cursor: "pointer" }
                                        : undefined
                                }
                                //Opens a menu at the clicked row.
                                onClick={(e) => {
                                    rowActions && rowActions(row.original);
                                    // Limits on how far should the menu open to the right or left
                                    const handleX = () => {
                                        const limit = innerWidth - 300;
                                        if (e.pageX > limit) {
                                            return innerWidth - 300;
                                        }
                                        return e.pageX;
                                    };
                                    const handleY = () => {
                                        return e.pageY;
                                    };

                                    setMenuData({
                                        x: handleX(),
                                        y: handleY(),
                                        rowData: row.original,
                                    });
                                }}
                            >
                                {row.getVisibleCells().map((cell, i) => {
                                    // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
                                    const meta: any = cell.column.columnDef.meta;

                                    return (
                                        <Td ref={cellRef} key={cell.id} isNumeric={meta?.isNumeric}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </Td>
                                    );
                                })}
                            </Tr>
                        ))}
                    {/* Invisible cell to open the menu */}
                    {(!data || loading) && <SkeletonRows />}
                </Tbody>
                {showFooter && (
                    <Thead>
                        {table.getFooterGroups().map((footerGroup) => (
                            <Tr key={footerGroup.id}>
                                {footerGroup.headers.map((header) => (
                                    <Th key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.footer,
                                                header.getContext(),
                                            )}
                                    </Th>
                                ))}
                            </Tr>
                        ))}
                    </Thead>
                )}
            </Table>
            {rowOptions && (
                <Menu isOpen={menuData.rowData}>
                    <Portal>
                        <MenuList
                            //Close the menu when any item is clicked, NOT WORKING FOR PRINTING
                            /* onClick={() => setMenuData({ ...menuData, index: null, rowData: null })} */
                            position={"absolute"}
                            top={menuData?.y}
                            left={menuData?.x}
                        >
                            <MenuGroup>
                                <MenuItem
                                    onClick={() =>
                                        setMenuData((prev) => ({ ...prev, rowData: null }))
                                    }
                                    icon={<CloseIcon />}
                                >
                                    Cerrar menú
                                </MenuItem>
                            </MenuGroup>
                            <MenuDivider />
                            <MenuGroup>
                                {menuData.rowData
                                    ? rowOptions({ x: menuData.rowData, setMenuData })
                                    : []}
                            </MenuGroup>
                        </MenuList>
                    </Portal>
                </Menu>
            )}
            {!!count && (
                <TablePagination
                    pageIndex={pageIndex}
                    setPageIndex={setPageIndex}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    count={count}
                    data={data}
                />
            )}
        </Card>
    );
};

export default DynamicTable;
