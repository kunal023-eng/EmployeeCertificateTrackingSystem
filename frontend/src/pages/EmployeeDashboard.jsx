import CustomDataTable from "@/components/shared/CustomTable";
import { useAuth } from "@/context/Auth";
import { employeeDashboardColumns } from "@/lib/constant";
import axios from "axios";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import CreateRequest from "@/components/shared/CreateRequest";
import { Button } from "@/components/ui/button";

export const EmployeeDashboard = () => {
  const [data, setData] = useState([]);
  const token = Cookies.get("token");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5022/api/certificationrequest/GetEmployeeRequests/${user?.employeeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
    } catch (error) {
      toast.error("No data found");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user) fetchData();
  }, []);

  const actions = [
    {
      label: "Reapply",
      icon: <RotateCcw className="h-4 w-4" />,
      className: "text-green-600",
    },
  ];

  return (
    <>
      <h2 className=" text-3xl font-bold tracking-tight my-4">
        Employee Dashboard
      </h2>
      <Button onClick={() => setIsDialogOpen(true)} className="my-4">
        Create Certification Request
      </Button>
      <CreateRequest setIsDialogOpen={()=>setIsDialogOpen(!isDialogOpen)} isDialogOpen={isDialogOpen} />
      <CustomDataTable
        data={data}
        columns={employeeDashboardColumns}
        actions={actions}
        isEmployee={true}
        title="All Requests"
      />
    </>
  );
};
