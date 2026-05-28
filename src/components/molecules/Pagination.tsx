
import { Box, MenuItem, Pagination, Select, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ArrowLeft2, ArrowRight2 } from 'iconsax-reactjs';
import type { QueryParams } from '../../types';

interface TablePaginationProps {
    qp: QueryParams;
    setQp: (qp: QueryParams) => void;
    totalPages: number;
    totalRecords?: number;
}

export default function TablePagination({
    qp,
    setQp,
    totalPages,
    totalRecords
}: TablePaginationProps) {
    const theme = useTheme();
    const pageSizeOptions = [6, 8, 12, 20, 50, 100];
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));
    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setQp({ ...qp, pageIndex: page });
    };

    const handlePageSizeChange = (event: any) => {
        setQp({ ...qp, pageIndex: 1, pageSize: Number(event.target.value) });
    };

    const goToFirstPage = () => {
        setQp({ ...qp, pageIndex: 1 });
    };

    const goToLastPage = () => {
        setQp({ ...qp, pageIndex: totalPages });
    };

    const goToPreviousPage = () => {
        if (qp?.pageIndex > 1) {
            setQp({ ...qp, pageIndex: qp?.pageIndex - 1 });
        }
    };

    const goToNextPage = () => {
        if (qp?.pageIndex < totalPages) {
            setQp({ ...qp, pageIndex: qp?.pageIndex + 1 });
        }
    };

    if (totalPages === 0) {
        return null;
    }

    return (
        <Box
            // sx={{
            //     background: (theme) => theme.palette.primary.contrastText
            // }}
            className="sticky bottom-0 left-0 right-0 flex justify-between items-center gap-2 flex-wrap pb-4 lg:py-4"
        >
            {/* Page Size Selector */}
            <Box className="hidden lg:flex items-center gap-1">
                <Typography variant="subtitle2" color='text.dark'>Show</Typography>
                <Select
                    value={qp.pageSize}
                    onChange={handlePageSizeChange}
                    size="small"
                    sx={{ minWidth: 50, padding: "4px 12px" }}
                >
                    {pageSizeOptions.map((size) => (
                        <MenuItem key={size} value={size}>
                            {size}
                        </MenuItem>
                    ))}
                </Select>
                <Typography variant="subtitle2" color='text.dark'>
                    per page {totalRecords ? `of ${totalRecords}` : ''}
                </Typography>
            </Box>

            {/* Pagination Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                    component="button"
                    onClick={goToFirstPage}
                    disabled={qp.pageIndex === 1}
                    sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        width: 34,
                        height: 34,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: theme.palette.primary.contrastText,
                        cursor: qp.pageIndex === 1 ? 'not-allowed' : 'pointer',
                        opacity: qp.pageIndex === 1 ? 0.5 : 1,

                        '&:hover': {
                            backgroundColor: qp.pageIndex === 1 ? 'white' : '#f5f5f5',
                        }
                    }}
                >
                    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.74958 11.6199L4.94625 7.81655C4.49708 7.36738 4.49708 6.63238 4.94625 6.18322L8.74958 2.37988" stroke="#111827" strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14.7496 11.6199L10.9463 7.81655C10.4971 7.36738 10.4971 6.63238 10.9463 6.18322L14.7496 2.37988" stroke="#111827" strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                </Box>

                {/* Previous Page Button */}
                <Box
                    component="button"
                    onClick={goToPreviousPage}
                    disabled={qp.pageIndex === 1}
                    sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        width: 34,
                        height: 34,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: theme.palette.primary.contrastText,
                        cursor: qp.pageIndex === 1 ? 'not-allowed' : 'pointer',
                        opacity: qp.pageIndex === 1 ? 0.5 : 1,

                        '&:hover': {
                            backgroundColor: qp.pageIndex === 1 ? 'white' : '#f5f5f5',
                        }
                    }}
                >
                    <ArrowLeft2 size={16} />
                </Box>

                <Pagination
                    count={totalPages}
                    page={qp.pageIndex}
                    onChange={handlePageChange}
                    siblingCount={isXs ? 0 : 1}
                    boundaryCount={isXs ? 0 : 1}
                    shape="rounded"
                    showFirstButton={false}
                    showLastButton={false}
                    hidePrevButton
                    hideNextButton
                />

                {/* Next Page Button */}
                <Box
                    component="button"
                    onClick={goToNextPage}
                    disabled={qp.pageIndex === totalPages}
                    sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        width: 34,
                        height: 34,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: theme.palette.primary.contrastText,
                        cursor: qp.pageIndex === totalPages ? 'not-allowed' : 'pointer',
                        opacity: qp.pageIndex === totalPages ? 0.5 : 1,

                        '&:hover': {
                            backgroundColor: qp.pageIndex === totalPages ? 'white' : '#f5f5f5',
                        }
                    }}
                >
                    <ArrowRight2 size={16} />
                </Box>

                {/* Last Page Button */}
                <Box
                    component="button"
                    onClick={goToLastPage}
                    disabled={qp.pageIndex === totalPages}
                    sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        width: 34,
                        height: 34,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: theme.palette.primary.contrastText,
                        cursor: qp.pageIndex === totalPages ? 'not-allowed' : 'pointer',
                        opacity: qp.pageIndex === totalPages ? 0.5 : 1,

                        '&:hover': {
                            backgroundColor: qp.pageIndex === totalPages ? 'white' : '#f5f5f5',
                        }
                    }}
                >
                    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.2504 11.6199L15.0537 7.81655C15.5029 7.36738 15.5029 6.63238 15.0537 6.18322L11.2504 2.37988" stroke="#111827" strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5.25042 11.6199L9.05375 7.81655C9.50292 7.36738 9.50292 6.63238 9.05375 6.18322L5.25042 2.37988" stroke="#111827" strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                </Box>
            </Box>
        </Box>
    );
}