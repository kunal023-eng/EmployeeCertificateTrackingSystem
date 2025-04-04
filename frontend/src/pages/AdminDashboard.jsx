import AddCertification from "@/components/shared/AddCertification";
import CustomDataTable from "@/components/shared/CustomTable";
import { useAuth } from "@/context/Auth";
import {
  AdminDashboardColumns,
  certificationColumns,
  employeesColumns,
} from "@/lib/constant";
import axios from "axios";
import Cookies from "js-cookie";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import EmployeeTable from "@/components/shared/EmployeeTable";
import PieChartComponent from "@/components/shared/PieChartComponent";

export const AdminDashboard = () => {
  const [data, setData] = React.useState([]);
  console.log(data);
  const [certificationsData, setCertificationsData] = React.useState([]);
  const token = Cookies.get("token");
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();
  const [statusCounts, setStatusCounts] = React.useState({});

  const calculateFinalStatusCounts = (requests) => {
    const statusCounts = { Approved: 0, Rejected: 0, Reverted: 0, Pending: 0 };

    requests.forEach(({ managerSettledStatus, hrSettledStatus }) => {
      let finalStatus = "Approved"; // Default to Approved

      if (
        managerSettledStatus === "Rejected" ||
        hrSettledStatus === "Rejected"
      ) {
        finalStatus = "Rejected";
      } else if (
        managerSettledStatus === "Reverted" ||
        hrSettledStatus === "Reverted"
      ) {
        finalStatus = "Reverted";
      } else if (
        managerSettledStatus === "Pending" ||
        hrSettledStatus === "Pending"
      ) {
        finalStatus = "Pending";
      }

      statusCounts[finalStatus]++;
    });

    return statusCounts;
  };

  // Example usage
  // const requests = [
  //   { managerSettledStatus: "Approved", hrSettledStatus: "Approved" }, // Approved
  //   { managerSettledStatus: "Pending", hrSettledStatus: "Approved" }, // Pending
  //   { managerSettledStatus: "Approved", hrSettledStatus: "Rejected" }, // Rejected
  //   { managerSettledStatus: "Reverted", hrSettledStatus: "Approved" }, // Reverted
  // ];

  console.log(calculateFinalStatusCounts(data));

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5022/api/certificationrequest/GetAllRequests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
    } catch (error) {
      toast.error("No data found");
    } finally {
      setLoading(false);
    }
  };

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
    if (user) {
      Promise.all([fetchData(), GetAllCertifications()]);
    }
  }, []);
  useEffect(() => {
    setStatusCounts(calculateFinalStatusCounts(data));
  }, [data]);

  const addCertification = async (body) => {
    try {
      const response = await axios.post(
        `http://localhost:5022/api/certification/AddCertification`,
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const deleteCertification = async (item) => {
    try {
      const response = await axios.delete(
        `http://localhost:5022/api/certification/DeleteCertifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { ids: [item.certificationId] },
        }
      );
      toast.success("Certification deleted successfully");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const updateEmployee = async (employeeId, roleId) => {
    try {
      const response = await axios.put(
        `http://localhost:5022/api/auth/update`,
        {
          employeeId,
          roleId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Employee updated successfully");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const actions1 = [
    {
      label: "Delete",
      onClick: (item) => deleteCertification(item),
      icon: <Trash className="h-4 w-4" />,
      className: "text-red-600",
    },
  ];
  const actions2 = [
    {
      label: "Employee",
      onClick: (item) => updateEmployee(item.employeeId, 1),
      icon: <Trash className="h-4 w-4" />,
    },
    {
      label: "Manager",
      onClick: (item) => updateEmployee(item.employeeId, 2),
      icon: <Trash className="h-4 w-4" />,
    },
    {
      label: "HR",
      onClick: (item) => updateEmployee(item.employeeId, 3),
      icon: <Trash className="h-4 w-4" />,
    },
  ];

  return (
    <>
      <h2 className=" text-3xl font-bold tracking-tight my-4">
        Admin Dashboard
      </h2>
      <AddCertification addCertification={addCertification} />
      <div className="flex flex-col md:flex-row justify-center gap-4">
        <div style={{ width: "400px", margin: "0 auto" }}>
          <PieChartComponent
            data={[
              statusCounts.Approved,
              statusCounts.Rejected,
              statusCounts.Reverted,
              statusCounts.Pending,
            ]}
          />
        </div>
        <div>

        
        <CustomDataTable
          data={certificationsData}
          columns={certificationColumns}
          isFilter={false}
          actions={actions1}
          title="All Certifications"
        />
        </div>
      </div>
     
      <CustomDataTable
        data={data}
        columns={AdminDashboardColumns}
        title="All Requests"
      />

      <EmployeeTable></EmployeeTable>
    </>
  );
};
