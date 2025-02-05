import React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import StudentTable from "../../../components/staff/StudentTable";

const PublishDialog = ({
  open,
  onClose,
  handlePublish,
  students,
  selectedStudents,
  setSelectedStudents,
  filters,
  setFilters,
  sortConfig,
  setSortConfig,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  openFilterDialog,
  setOpenFilterDialog,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>Select Students</DialogTitle>
      <DialogContent>
        <StudentTable
          students={students}
          selectedStudents={selectedStudents}
          setSelectedStudents={setSelectedStudents}
          filters={filters}
          setFilters={setFilters}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
          page={page}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          openFilterDialog={openFilterDialog}
          setOpenFilterDialog={setOpenFilterDialog}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="primary"
          variant="outlined"
        >
          Cancel
        </Button>
        <Button onClick={handlePublish} color="primary" variant="contained">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PublishDialog;
