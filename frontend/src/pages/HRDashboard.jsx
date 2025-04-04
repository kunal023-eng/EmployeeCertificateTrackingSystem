import CustomDataTable from "@/components/shared/CustomTable";
import { useAuth } from "@/context/Auth";
import { certificationColumns, managerDashboardColumns } from "@/lib/constant";
import axios from "axios";
import Cookies from "js-cookie";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import EmployeeTable from "@/components/shared/EmployeeTable";

export const HRDashboard = () => {
  const [data, setData] = React.useState([]);
  const token = Cookies.get("token");
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();
    const [certificationsData, setCertificationsData] = React.useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5022/api/certificationrequest/GetPendingRequestsForHr`,
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

  const settleRequest = async (body) => {
    try {
      const response = await axios.post(
        `http://localhost:5022/api/certificationrequest/SettledRequestHr`,
        body,

        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Request ${body.SettledType} successfully`);
      // fetchData();
      setData((prev) =>
        prev.filter((item) => item.requestId !== body.requestId)
      );
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const actions = [
    {
      label: "Approve",
      onClick: settleRequest,
      icon: <Check className="h-4 w-4" />,
      className: "text-green-600",
    },
    {
      label: "Revert",
      onClick: settleRequest,
      icon: <X className="h-4 w-4" />,
      className: "text-red-600",
    },
  ];
  const GetAllCertifications = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5022/api/certification/GetAllCertifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCertificationsData(response.data);
    } catch (error) {
      toast.error("No data found");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    GetAllCertifications();
  })

  return (
    <>
      <h2 className=" text-3xl font-bold tracking-tight my-4">HR Dashboard</h2>
      <CustomDataTable
        data={data}
        columns={managerDashboardColumns}
        actions={actions}
        isEmployee={false}
        title="Pending Requests"
      />
            <CustomDataTable
        data={certificationsData}
        columns={certificationColumns}
        isFilter={false}
        // actions={actions1}
        title="All Certifications"
      />
      <EmployeeTable></EmployeeTable>
    </>
  );
};
