import React, { useState } from "react";
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
import { toast } from "sonner";
import axios from "axios";
import Cookies from "js-cookie";

const Reapply = ({
  isDialogOpen,
  setIsDialogOpen,
  selectedItem, // Callback for when certification changes
}) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = Cookies.get("token");

  console.log("selectedItem", selectedItem);

  // Handle file upload
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 3) {
      toast.error("You can upload a maximum of 3 files."); // Show error notification
      return;
    }

    const validFiles = selectedFiles.filter((file) => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds the maximum size of 2MB.`); // Show error notification
        return false;
      }
      return true;
    });

    setFiles(validFiles.slice(0, 3)); // Limit to 3 files
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedItem) {
      toast.error("Please select a certification."); // Show error notification
      return;
    }

    if (files.length === 0) {
      toast.error("Please upload at least one file."); // Show error notification
      return;
    }

    const formData = new FormData();
    formData.append(
      "requestId",
      selectedItem?.requestId
    );
    files.forEach((file) => formData.append("files", file)); // Add files

    try {
      setIsLoading(true);
      const response = await axios.put(
        "http://localhost:5022/api/certificationrequest/updateRequest",
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
      setFiles([]);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error(
        "Error uploading files or certification request already exists."
      );
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{`Reapply for CertificationId ${selectedItem?.certification.certificationId}`}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Certification Selection */}
            <Select
              value={selectedItem?.certification.name} // Use prop value
              // Callback for value change
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a certification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  key={selectedItem?.certification.certificationId}
                  value={selectedItem?.certification.name}
                >
                  {selectedItem?.certification.name}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* File Upload */}
            <Input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileChange}
            />
            <p className="text-sm text-gray-500">
              You can upload up to 3 PDF files (max 2MB each).
            </p>

            {/* Display selected files */}
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

export default Reapply;
