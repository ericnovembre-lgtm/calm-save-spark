import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useLifePlans } from "@/hooks/useLifePlans";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateEventModal({ open, onClose }: CreateEventModalProps) {
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState<string>("");
  const [targetDate, setTargetDate] = useState<Date>();
  const [estimatedCost, setEstimatedCost] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { createPlan } = useLifePlans();
  const { toast } = useToast();

  const eventTypes = [
    { value: "wedding", label: "Wedding" },
    { value: "home_purchase", label: "Home Purchase" },
    { value: "baby", label: "Baby" },
    { value: "education", label: "Education" },
    { value: "retirement", label: "Retirement" },
    { value: "vacation", label: "Vacation" },
    { value: "business", label: "Start Business" },
    { value: "other", label: "Other" }
  ];

  const handleCreate = async () => {
    if (!eventName || !eventType || !targetDate || !estimatedCost) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create the life plan
      const { data: plan, error: planError } = await supabase
        .from("life_plans")
        .insert({
          user_id: user.id,
          title: eventName,
          event_type: eventType,
          target_date: targetDate.toISOString(),
          total_estimated_cost: parseFloat(estimatedCost),
          status: "planning"
        })
        .select()
        .single();

      if (planError) throw planError;

      // Generate AI suggestions for scenarios, costs, and checklists
      const { error: aiError } = await supabase.functions.invoke("generate-life-plan-suggestions", {
        body: { 
          lifePlanId: plan.id, 
          eventType, 
          estimatedCost: parseFloat(estimatedCost) 
        }
      });

      if (aiError) throw aiError;

      toast({ title: "Life plan created successfully" });
      onClose();
    } catch (error: any) {
      toast({
        title: "Failed to create plan",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Life Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="event-name">Event Name</Label>
            <Input
              id="event-name"
              placeholder="e.g., My Dream Wedding"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="event-type">Event Type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger id="event-type">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Target Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? format(targetDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={setTargetDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="estimated-cost">Estimated Budget</Label>
            <Input
              id="estimated-cost"
              type="number"
              placeholder="e.g., 25000"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isGenerating} className="flex-1">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Plan"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
