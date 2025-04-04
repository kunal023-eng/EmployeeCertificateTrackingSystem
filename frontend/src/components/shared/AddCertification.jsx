import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AddCertification = ({ addCertification }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    desc: "",
    amount: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setErrors({ ...errors, [e.target.id]: "" }); // Clear error on change
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Name is required";
    if (!formData.provider.trim()) tempErrors.provider = "Provider is required";
    if (!formData.desc.trim()) tempErrors.desc = "Description is required";
    if (!formData.amount) tempErrors.amount = "Amount is required";
    else if (isNaN(formData.amount) || Number(formData.amount) <= 0)
      tempErrors.amount = "Amount must be a positive number";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    addCertification(formData);
    console.log("Form submitted:", formData);
    toast.success("Certification added successfully!");

    // Reset form
    setFormData({ name: "", provider: "", desc: "", amount: "" });
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)} className="my-4">
        Add Certification
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Certification</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter certification name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                placeholder="Enter provider name"
                value={formData.provider}
                onChange={handleChange}
              />
              {errors.provider && (
                <p className="text-red-500 text-sm">{errors.provider}</p>
              )}
            </div>

            <div>
              <Label htmlFor="desc">Description</Label>
              <Input
                id="desc"
                placeholder="Enter certification description"
                value={formData.desc}
                onChange={handleChange}
              />
              {errors.desc && (
                <p className="text-red-500 text-sm">{errors.desc}</p>
              )}
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter certification amount"
                value={formData.amount}
                onChange={handleChange}
              />
              {errors.amount && (
                <p className="text-red-500 text-sm">{errors.amount}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddCertification;
