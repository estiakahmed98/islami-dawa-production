"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableColumn {
  id: string; // Unique identifier for the column
  label: string; // Column display name
  className?: string; // Optional custom class
}

interface TableData {
  [key: string]: string | number | React.ReactNode; // Flexible data type
}

interface DynamicTableProps {
  columns: TableColumn[]; // Columns configuration
  data: TableData[]; // Data to display
  caption?: string; // Optional caption
  onCellEdit?: (rowIndex: number, columnId: string, newValue: string) => void; // Cell edit handler
  onColumnEdit?: (columnId: string, updatedValues: string[]) => void; // Column edit handler
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  columns,
  data,
  caption,
  onCellEdit,
  onColumnEdit,
}) => {
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    columnId: string;
    initialValue: string | number;
  } | null>(null);

  const [editValue, setEditValue] = useState<string | number>("");

  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [columnEditValues, setColumnEditValues] = useState<string[]>([]);

  // Handle cell editing
  const handleEditCellClick = (
    rowIndex: number,
    columnId: string,
    value: string | number
  ) => {
    setEditingCell({ rowIndex, columnId, initialValue: value });
    setEditValue(value);
  };

  const handleSaveCellEdit = () => {
    if (editingCell && onCellEdit) {
      onCellEdit(
        editingCell.rowIndex,
        editingCell.columnId,
        editValue as string
      );
    }
    setEditingCell(null);
  };

  const handleCancelCellEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  // Handle column editing
  const handleEditColumnClick = (columnId: string) => {
    const values = data.map((row) => row[columnId] as string);
    setEditingColumn(columnId);
    setColumnEditValues(values);
  };

  const handleColumnInputChange = (index: number, newValue: string) => {
    setColumnEditValues((prev) =>
      prev.map((val, idx) => (idx === index ? newValue : val))
    );
  };

  const handleSaveColumnEdit = () => {
    if (editingColumn && onColumnEdit) {
      onColumnEdit(editingColumn, columnEditValues);
    }
    setEditingColumn(null);
  };

  const handleCancelColumnEdit = () => {
    setEditingColumn(null);
    setColumnEditValues([]);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} className={column.className}>
                <div className="flex items-center justify-between">
                  {column.label}
                  <button
                    onClick={() => handleEditColumnClick(column.id)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit Column
                  </button>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={column.id} className={column.className}>
                  {editingCell &&
                  editingCell.rowIndex === rowIndex &&
                  editingCell.columnId === column.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="border border-gray-300 p-1 rounded"
                      />
                      <button
                        onClick={handleSaveCellEdit}
                        className="text-green-600 hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelCellEdit}
                        className="text-red-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="relative group">
                      {row[column.id]}
                      <button
                        onClick={() =>
                          handleEditCellClick(
                            rowIndex,
                            column.id,
                            row[column.id] as string
                          )
                        }
                        className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-blue-600"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Column Edit Modal */}
      {editingColumn && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              Edit Column: {editingColumn}
            </h3>
            {columnEditValues.map((value, index) => (
              <div className="mb-4" key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Row {index + 1}
                </label>
                <input
                  type="text"
                  className="border border-gray-300 p-2 w-full"
                  value={value}
                  onChange={(e) =>
                    handleColumnInputChange(index, e.target.value)
                  }
                />
              </div>
            ))}
            <div className="flex justify-end gap-4">
              <button
                className="p-2 bg-gray-300 rounded"
                onClick={handleCancelColumnEdit}
              >
                Cancel
              </button>
              <button
                className="p-2 bg-teal-700 text-white rounded"
                onClick={handleSaveColumnEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicTable;
