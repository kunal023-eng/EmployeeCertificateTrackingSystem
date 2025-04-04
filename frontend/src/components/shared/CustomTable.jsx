import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react"; // Icon for actions dropdown
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { badgeVariants, formatDate } from "@/lib/helpers";

import { useAuth } from "@/context/Auth";
import { toast } from "sonner";
import axios from "axios";
import MessageBox from "./MessageBox";
import Reapply from "./Reapply";

const CustomDataTable = ({
  data,
  columns,
  actions = [],
  isEmployee = false,
  isFilter = true,
  isSearch = true,
  title = "",
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [message, setMessage] = useState("");
  const itemsPerPage = 5;
  const [isReapplyDialogOpen, setIsReapplyDialogOpen] = useState(false);

  const openPdf = async (fileName) => {
    try {
      const response = await axios.get(
        `http://localhost:5022/api/certificationrequest/file/${fileName}`,
        { responseType: "blob" }
      );

      const url = URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error opening PDF:", error);
      toast.error("Error opening PDF");
    }
  };

  // Filter and search logic
  const filteredData = data.filter((item) => {
    const matchesSearch = columns.some((column) => {
      const value = column.key
        .split(".")
        .reduce((obj, key) => obj?.[key], item); // Handle nested keys
      return (
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    const matchesStatus =
  statusFilter === "all" ||
  (statusFilter === "approved" 
    ? item.managerSettledStatus.toLowerCase() === "approved" && 
      item.hrSettledStatus.toLowerCase() === "approved"
    : item.managerSettledStatus.toLowerCase() === statusFilter.toLowerCase() ||
      item.hrSettledStatus.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredData?.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleActionClick = (action, item) => {
    if (user.role.roleName === "Employee" && action.label === "Reapply") {
      setIsReapplyDialogOpen(true);
      console.log("item", item);
      setSelectedItem(item);
      setRequestId(item?.requestId);
      return;
    } else if (
      user.role.roleName === "Manager" ||
      user.role.roleName === "HR"
    ) {
      setSelectedAction(action);
      setSelectedItem(item);
      setIsDialogOpen(true);
      setRequestId(item?.requestId);
    } else {
      action.onClick(item);
    }
  };

  // Handle dialog submit
  const handleDialogSubmit = () => {
    if (selectedAction && selectedItem) {
      selectedAction.onClick({
        requestId,
        Comment: message,
        SettledType:
          selectedAction.label === "Approve" ? "Approved" : "Reverted",
        EmployeeId: user.employeeId,
      });
    }
    setIsDialogOpen(false);
    setMessage("");
  };

  return (
    <div className="space-y-4">
      <div className="text-2xl font-bold my-4">{title}</div>
      {/* Search and Filter Controls */}
      <div className="flex gap-4 justify-between">
        {isSearch && (
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[350px] max-w-md border border-primary"

          />
        )}
        {isFilter && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reverted">Reverted</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <Table className="rounded-md overflow-hidden">
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead className="bg-primary text-white" key={column.key}>{column.header}</TableHead>
            ))}
            {actions.length > 0 && <TableHead className="bg-primary text-white">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
         {paginatedData?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1}>No data found</TableCell>
            </TableRow>
          ) : (
            paginatedData.map((item, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key} className="min-w-32">
                    {column.key === "requestDate" ||
                    column.key === "managerSettledDate" ||
                    column.key === "hrSettledDate" ? (
                      item[column.key] ? (
                        formatDate(item[column.key])
                      ) : (
                        "--"
                      )
                    ) : column.key === "attempts" ? (
                      `${item[column.key]}/3`
                    ) : column.key === "managerSettledStatus" ||
                      column.key === "hrSettledStatus" ? (
                      badgeVariants(item[column.key])
                    ) : column.key === "documentURLs" ? (
                      <div className="flex flex-col space-y-1">
                        {Array.isArray(item[column.key]) &&
                          item[column.key].map((url, idx) => (
                            <p
                              key={idx}
                              onClick={() => openPdf(url)}
                              className="text-blue-600 hover:underline cursor-pointer"
                            >
                              Document {idx + 1}
                            </p>
                          ))}
                      </div>
                    ) : column.key.includes(".") ? (
                      column.key
                        .split(".")
                        .reduce((obj, key) => obj?.[key], item) || "--"
                    ) : (
                      item[column.key] || "--"
                    )}
                  </TableCell>
                ))}

                {actions.length > 0 &&
                  (!isEmployee || // Always show if isEmployee is false
                    item.managerSettledStatus === "Reverted" || // Show if manager status is Reverted
                    item.hrSettledStatus === "Reverted") && ( // Show if HR status is Reverted
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {actions.map((action, actionIndex) => (
                            <DropdownMenuItem
                              key={actionIndex}
                              onClick={() => handleActionClick(action, item)}
                              className={action.className}
                            >
                              {action.icon && (
                                <span className="mr-2">{action.icon}</span>
                              )}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {filteredData?.length > 0 && (
        <div className="flex justify-between items-center">
          <Button
            varint="outline"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            {"previous"}
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            varant="outline"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            {"next"}
          </Button>
        </div>
      )}

      {/* Dialog for Actions */}
      <MessageBox
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        message={message}
        setMessage={setMessage}
        selectedAction={selectedAction}
        handleDialogSubmit={handleDialogSubmit}
      />

      <Reapply
        isDialogOpen={isReapplyDialogOpen}
        setIsDialogOpen={setIsReapplyDialogOpen}
        selectedItem={selectedItem}
      />
    </div>
  );
};

export default CustomDataTable;
