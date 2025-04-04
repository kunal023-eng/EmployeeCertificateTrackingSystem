import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "../ui/button";
import { MoreVertical, Trash, Edit } from "lucide-react";
import { useAuth } from "@/context/Auth";
import { Input } from "@/components/ui/input";

const EmployeeTable = ({ isAdmin = true }) => {
  const { user } = useAuth();
  const token = Cookies.get("token");
  const [employeesData, setEmployeesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const roles = [
    { value: 1, label: "Employee" },
    { value: 2, label: "Manager" },
    { value: 3, label: "HR" },
  ];

  const departments = [
    { id: 1, name: "Microsoft" },
    { id: 3, name: "Salesforce" },
    { id: 4, name: "SAP" },
    { id: 2, name: "Human Resources" },
  ];

  useEffect(() => {
    getAllEmployees();
  }, []);

  useEffect(() => {
    // Filter data based on search term
    const filtered = employeesData.filter(employee => 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, employeesData]);

  const getAllEmployees = async () => {
    try {
      const response = await axios.get(`http://localhost:5022/api/auth/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredEmployees = response.data.filter((e) => e.role.roleName !== "Admin");
      setEmployeesData(filteredEmployees);
      setFilteredData(filteredEmployees);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const updateEmployee = async (body) => {
    try {
      if (
        (body.roleId === 3 && body.departmentId !== 2) ||
        (body.roleId !== 3 && body.departmentId === 2)
      ) {
        toast("HR can only be assigned to HR department");
        return;
      }
      await axios.put(`http://localhost:5022/api/auth/update`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Employee updated successfully");
      getAllEmployees();
      setOpen(false);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const deleteEmployee = async (userId) => {
    try {
      await axios.delete(`http://localhost:5022/api/auth/delete/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Employee deleted successfully");
      getAllEmployees();
    } catch (error) {
      toast.error(error);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Filter employees based on admin status
  const getDisplayedEmployees = () => {
    return !isAdmin
      ? filteredData.filter(
          (item) =>
            item.department.departmentId === user.department.departmentId &&
            item.employeeId !== user.employeeId
        )
      : filteredData.filter(item => item.employeeId !== user.employeeId);
  };

  const displayedEmployees = getDisplayedEmployees();
  const paginatedDisplayedEmployees = displayedEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const displayedTotalPages = Math.ceil(displayedEmployees.length / itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="text-2xl font-bold my-4">All Employees</div>
      
      {/* Search Input */}
      <Input
        placeholder="Search employees..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-[350px] max-w-md border border-primary"
      />

      <Table className="rounded-md overflow-hidden">
        <TableHeader>
          <TableRow>
            <TableHead className="bg-primary text-white">Name</TableHead>
            <TableHead className="bg-primary text-white">Email</TableHead>
            <TableHead className="bg-primary text-white">Role</TableHead>
            <TableHead className="bg-primary text-white">Department</TableHead>
            <TableHead className="bg-primary text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedDisplayedEmployees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No employees found
              </TableCell>
            </TableRow>
          ) : (
            paginatedDisplayedEmployees.map((user) => (
              <TableRow key={user.employeeId}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {roles.find((r) => r.value === user.roleId)?.label}
                </TableCell>
                <TableCell>
                  {departments.find((d) => d.id === user.departmentId)?.name}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedEmployee(user);
                          setOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteEmployee(user.employeeId)}
                        className="text-red-600"
                      >
                        <Trash className="h-4 w-4 mr-2 text-red-600" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {displayedEmployees.length > 0 && (
        <div className="flex justify-between items-center">
          <Button
            varint="outline"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            {"previous"}
          </Button>
          <span>
            Page {currentPage} of {displayedTotalPages}
          </span>
          <Button
            varant="outline"
            disabled={currentPage === displayedTotalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            {"next"}
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div>Name: {selectedEmployee.name}</div>
              <div>Email: {selectedEmployee.email}</div>
              <Select
                value={selectedEmployee.roleId.toString()}
                onValueChange={(value) =>
                  setSelectedEmployee({
                    ...selectedEmployee,
                    roleId: Number(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value.toString()}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedEmployee.departmentId.toString()}
                onValueChange={(value) =>
                  setSelectedEmployee({
                    ...selectedEmployee,
                    departmentId: Number(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button onClick={() => updateEmployee(selectedEmployee)}>
                  Save
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeTable;