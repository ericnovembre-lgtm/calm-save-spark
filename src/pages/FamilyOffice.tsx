import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Scale, FileText, Users, Shield, Download, Plus, 
  CheckCircle2, AlertTriangle, Calendar, Bell 
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const estateDocs = [
  {
    id: "will",
    name: "Last Will & Testament",
    status: "complete",
    lastUpdated: "2025-01-10",
    nextReview: "2026-01-10"
  },
  {
    id: "trust",
    name: "Revocable Living Trust",
    status: "draft",
    lastUpdated: "2024-12-15",
    nextReview: "2025-03-15"
  },
  {
    id: "poa",
    name: "Power of Attorney",
    status: "complete",
    lastUpdated: "2024-11-20",
    nextReview: "2025-11-20"
  },
  {
    id: "healthcare",
    name: "Healthcare Directive",
    status: "missing",
    lastUpdated: null,
    nextReview: null
  }
];

const beneficiaries = [
  {
    id: "1",
    name: "Sarah Johnson",
    relationship: "Spouse",
    allocation: 50,
    assets: ["Primary Residence", "Investment Accounts", "Life Insurance"]
  },
  {
    id: "2",
    name: "Michael Johnson",
    relationship: "Son",
    allocation: 25,
    assets: ["Education Trust", "529 Plan"]
  },
  {
    id: "3",
    name: "Emily Johnson",
    relationship: "Daughter",
    allocation: 25,
    assets: ["Education Trust", "529 Plan"]
  }
];

const lifeEvents = [
  {
    event: "Marriage",
    detected: false,
    action: "Update beneficiaries and consider estate tax planning"
  },
  {
    event: "Birth of Child",
    detected: false,
    action: "Create trust, update will, add guardianship provisions"
  },
  {
    event: "Home Purchase",
    detected: true,
    action: "Add property to trust, review title ownership"
  },
  {
    event: "Inheritance Received",
    detected: false,
    action: "Review estate plan, consider trust structure"
  }
];

export default function FamilyOffice() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreateDocument = (docType: string) => {
    toast({
      title: "Document Generation Started",
      description: `Your ${docType} is being prepared. You'll receive an email when it's ready for review.`,
    });
  };

  const handleUpdateBeneficiary = () => {
    toast({
      title: "Beneficiary Updated",
      description: "Changes saved successfully. Documents will be regenerated within 24 hours.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete": return "default";
      case "draft": return "secondary";
      case "missing": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-display font-bold text-foreground">
              Mass-Affluent Digital Family Office
            </h1>
          </div>
          <p className="text-muted-foreground">
            Enterprise-grade estate planning and legacy management, democratized for mass-affluent families
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Estate Plan Status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">75%</div>
              <p className="text-xs text-muted-foreground mt-1">Complete</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Protected Assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$1.2M</div>
              <p className="text-xs text-muted-foreground mt-1">In trusts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Beneficiaries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3</div>
              <p className="text-xs text-muted-foreground mt-1">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3/4</div>
              <p className="text-xs text-muted-foreground mt-1">Up to date</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
            <TabsTrigger value="vault">Digital Vault</TabsTrigger>
            <TabsTrigger value="legacy-agent">Legacy Agent</TabsTrigger>
          </TabsList>

          {/* Estate Documents */}
          <TabsContent value="documents" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Estate Planning Documents</CardTitle>
                    <CardDescription>All documents are generated via attorney-reviewed APIs</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Document
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {estateDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <FileText className="w-6 h-6 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{doc.name}</h4>
                            <Badge variant={getStatusColor(doc.status)}>
                              {doc.status}
                            </Badge>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            {doc.lastUpdated && (
                              <span>Updated: {doc.lastUpdated}</span>
                            )}
                            {doc.nextReview && (
                              <span>Review: {doc.nextReview}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {doc.status === "missing" ? (
                          <Button onClick={() => handleCreateDocument(doc.name)}>
                            Create
                          </Button>
                        ) : (
                          <>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Document Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Available Templates</CardTitle>
                <CardDescription>Generate attorney-reviewed documents in minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["Irrevocable Trust", "Charitable Trust", "GRAT", "QPRT", "Dynasty Trust", "Special Needs Trust"].map((template) => (
                    <Button key={template} variant="outline" className="h-auto py-4">
                      <div className="text-center">
                        <FileText className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-semibold">{template}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Beneficiaries */}
          <TabsContent value="beneficiaries" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Beneficiary Management</CardTitle>
                    <CardDescription>Allocate assets and manage inheritance distribution</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Beneficiary
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {beneficiaries.map((beneficiary) => (
                    <Card key={beneficiary.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{beneficiary.name}</h4>
                              <p className="text-sm text-muted-foreground">{beneficiary.relationship}</p>
                              <div className="mt-3">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Allocation</span>
                                  <span className="font-semibold">{beneficiary.allocation}%</span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${beneficiary.allocation}%` }}
                                  />
                                </div>
                              </div>
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Assets</p>
                                <div className="flex flex-wrap gap-2">
                                  {beneficiary.assets.map((asset, idx) => (
                                    <Badge key={idx} variant="secondary">{asset}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" onClick={handleUpdateBeneficiary}>
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Digital Vault */}
          <TabsContent value="vault" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Secure Digital Inheritance Vault</CardTitle>
                <CardDescription>End-to-end encrypted storage for critical documents and credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Military-Grade Encryption</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Store passwords, account numbers, safe combinations, and other sensitive information 
                    that your beneficiaries will need to access
                  </p>
                  <Button size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Add First Item
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="text-center p-4 border rounded-lg">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-semibold">Documents</p>
                    <p className="text-sm text-muted-foreground">0 files</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-semibold">Credentials</p>
                    <p className="text-sm text-muted-foreground">0 items</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-semibold">Contacts</p>
                    <p className="text-sm text-muted-foreground">0 contacts</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-semibold">Instructions</p>
                    <p className="text-sm text-muted-foreground">0 notes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Proactive Legacy Agent */}
          <TabsContent value="legacy-agent" className="space-y-4 mt-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Bell className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Proactive Legacy Agent Active</h3>
                    <p className="text-sm text-muted-foreground">
                      Your AI agent monitors life events and automatically triggers estate plan updates when needed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monitored Life Events</CardTitle>
                <CardDescription>Automatic triggers for estate plan reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lifeEvents.map((event, idx) => (
                    <div key={idx} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3 flex-1">
                        {event.detected ? (
                          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                        ) : (
                          <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{event.event}</h4>
                            {event.detected && (
                              <Badge variant="secondary">Detected</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{event.action}</p>
                        </div>
                      </div>
                      {event.detected && (
                        <Button>Review Now</Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Agent Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span>Detected home purchase - Added property to living trust</span>
                    <span className="text-muted-foreground ml-auto">2 days ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span>Scheduled annual review notification</span>
                    <span className="text-muted-foreground ml-auto">1 week ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span>Updated beneficiary ages in trust documents</span>
                    <span className="text-muted-foreground ml-auto">3 weeks ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
