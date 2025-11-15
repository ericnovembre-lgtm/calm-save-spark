import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, UserPlus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function EmployeeOnboarding() {
  const { toast } = useToast();
  const [bulkFile, setBulkFile] = useState<File | null>(null);

  const handleBulkUpload = () => {
    if (!bulkFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Processing employee data",
      description: `Importing employees from ${bulkFile.name}...`,
    });
  };

  const downloadTemplate = () => {
    const csvContent = "email,first_name,last_name,department,employee_id\nexample@company.com,John,Doe,Engineering,EMP001";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_template.csv';
    a.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Onboarding</CardTitle>
        <CardDescription>Add employees individually or in bulk</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bulk">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
            <TabsTrigger value="individual">Individual</TabsTrigger>
          </TabsList>

          <TabsContent value="bulk" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Upload Employee CSV</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                  />
                  <Button onClick={handleBulkUpload}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="individual" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input placeholder="John" />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="john.doe@company.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <Input placeholder="Engineering" />
                </div>
                <div>
                  <Label>Employee ID</Label>
                  <Input placeholder="EMP001" />
                </div>
              </div>
              <Button className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
