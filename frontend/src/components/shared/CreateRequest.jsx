import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useAuth } from "@/context/Auth";

const CertificationDialog = ({ isDialogOpen, setIsDialogOpen }) => {
  const { user } = useAuth();
  const [certifications, setCertifications] = useState([]);
  const [selectedCertificationId, setSelectedCertificationId] = useState(""); // Updated state for certification ID
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const token = Cookies.get("token");

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://localhost:5022/api/certification/GetAllCertifications",
          { headers: { Authorization: `Bearer ${token}` } }
        ); 
        setCertifications(response.data);
      } catch (error) {
        console.error("Failed to fetch certifications:", error);
        toast.error("Failed to fetch certifications. Please try again later."); // Show error notification
      } finally {
        setIsLoading(false);
      }
    };

    if (isDialogOpen) {
      fetchCertifications();
    }
  }, [isDialogOpen]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 3) {
      toast.error("You can upload a maximum of 3 files.");
      return;
    }

    const validFiles = selectedFiles.filter((file) => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds the maximum size of 2MB.`);
        return false;
      }
      return true;
    });

    setFiles(validFiles.slice(0, 3));
  };

  const handleSubmit = async () => {
    if (!selectedCertificationId) {
      toast.error("Please select a certification.");
      return;
    }

    if (files.length === 0) {
      toast.error("Please upload at least one file.");
      return;
    }

    const formData = new FormData();
    formData.append("CertificationId", selectedCertificationId);
    formData.append("EmployeeId", user?.employeeId);
    files.forEach((file) => formData.append("files", file));
    console;
    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:5022/api/certificationrequest/createrequest",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      toast.success("Files uploaded successfully!");
      setIsDialogOpen(false);
      setSelectedCertificationId("");
      setFiles([]);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error(
        "Error uploading files or certification request already exists."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Certification Proof</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Select
              value={selectedCertificationId}
              onValueChange={setSelectedCertificationId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a certification" />
              </SelectTrigger>
              <SelectContent>
                {certifications.map((certification) => (
                  <SelectItem
                    key={certification.certificationId}
                    value={certification.certificationId}
                  >
                    {certification.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileChange}
            />
            <p className="text-sm text-gray-500">
              You can upload up to 3 PDF files (max 2MB each).
            </p>

            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Selected Files:</p>
                <ul className="list-disc list-inside">
                  {files.map((file, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Uploading..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CertificationDialog;
