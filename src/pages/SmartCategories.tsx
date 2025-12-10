import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryOverview } from '@/components/smart-categories/CategoryOverview';
import { CategoryRuleEditor } from '@/components/smart-categories/CategoryRuleEditor';
import { MerchantCategoryList } from '@/components/smart-categories/MerchantCategoryList';
import { CategoryFeedbackHistory } from '@/components/smart-categories/CategoryFeedbackHistory';
import { useSmartCategories } from '@/hooks/useSmartCategories';
import { Tag, Settings, Store, History } from 'lucide-react';

export default function SmartCategories() {
  const { categoryAnalytics, isLoading } = useSmartCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>();

  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6" data-copilot-id="smart-categories-page">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="w-6 h-6" />
            Smart Categories
          </h1>
          <p className="text-muted-foreground">
            AI-powered transaction categorization with custom rules
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <Tag className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-2">
              <Settings className="w-4 h-4" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="merchants" className="gap-2">
              <Store className="w-4 h-4" />
              Merchants
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <CategoryOverview 
              categories={categoryAnalytics} 
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          </TabsContent>

          <TabsContent value="rules">
            <CategoryRuleEditor />
          </TabsContent>

          <TabsContent value="merchants">
            <MerchantCategoryList />
          </TabsContent>

          <TabsContent value="history">
            <CategoryFeedbackHistory />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
