import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Module {
  id: string;
  title: string;
  duration: string;
  description: string;
}

export function CurriculumBuilder() {
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([
    { id: '1', title: 'Introduction to Banking', duration: '30 min', description: 'Basic banking concepts' },
    { id: '2', title: 'Budgeting Basics', duration: '45 min', description: 'How to create and maintain a budget' },
  ]);

  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      title: 'New Module',
      duration: '30 min',
      description: '',
    };
    setModules([...modules, newModule]);
  };

  const removeModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
  };

  const saveCurriculum = () => {
    toast({
      title: "Curriculum saved",
      description: `${modules.length} modules configured successfully`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Curriculum Builder</CardTitle>
        <CardDescription>Design custom learning paths for your program</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {modules.map((module, index) => (
            <div key={module.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-move" />
                <div className="flex-1 space-y-3">
                  <div>
                    <Label>Module {index + 1}: Title</Label>
                    <Input
                      value={module.title}
                      onChange={(e) => {
                        const updated = [...modules];
                        updated[index].title = e.target.value;
                        setModules(updated);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Duration</Label>
                      <Input
                        value={module.duration}
                        onChange={(e) => {
                          const updated = [...modules];
                          updated[index].duration = e.target.value;
                          setModules(updated);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={module.description}
                        onChange={(e) => {
                          const updated = [...modules];
                          updated[index].description = e.target.value;
                          setModules(updated);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeModule(module.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={addModule} className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
          <Button onClick={saveCurriculum}>Save Curriculum</Button>
        </div>
      </CardContent>
    </Card>
  );
}
