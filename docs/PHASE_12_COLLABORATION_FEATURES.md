# Phase 12: Collaboration Features

Multi-user budget management system with sharing, permissions, activity tracking, and comments.

---

## 🎯 **Overview**

Phase 12 enables collaborative budget management, allowing users to share budgets with family members, partners, or roommates. Features include granular permissions, real-time activity tracking, comment threads, and shared category templates.

---

## 🏗️ **Database Schema**

### **budget_shares**
Manages budget access permissions and invitations.

**Columns:**
- `id` (uuid, PK)
- `budget_id` (uuid, FK → user_budgets)
- `shared_with_user_id` (uuid)
- `permission_level` (text: 'view', 'edit', 'admin')
- `invited_by` (uuid)
- `status` (text: 'pending', 'accepted', 'declined')
- `created_at`, `updated_at`, `accepted_at` (timestamptz)

**Unique Constraint:** (budget_id, shared_with_user_id)

### **budget_activity_log**
Tracks all changes made to budgets.

**Columns:**
- `id` (uuid, PK)
- `budget_id` (uuid, FK → user_budgets)
- `user_id` (uuid)
- `action_type` (text: INSERT, UPDATE, DELETE)
- `action_data` (jsonb)
- `created_at` (timestamptz)

### **budget_comments**
Comment threads on budgets.

**Columns:**
- `id` (uuid, PK)
- `budget_id` (uuid, FK → user_budgets)
- `user_id` (uuid)
- `comment_text` (text)
- `is_edited` (boolean)
- `parent_comment_id` (uuid, FK → self for replies)
- `created_at`, `updated_at` (timestamptz)

### **shared_category_templates**
Reusable category templates for common scenarios.

**Columns:**
- `id` (uuid, PK)
- `template_name` (text)
- `template_type` (text: household, couple, family, roommates, custom)
- `categories` (jsonb)
- `created_by` (uuid)
- `is_public` (boolean)
- `created_at`, `updated_at` (timestamptz)

---

## 🔐 **Permission Levels**

### **View**
- Read-only access to budget data
- Can view activity and comments
- Can add comments
- Cannot modify budget

### **Edit**
- All View permissions
- Can modify budget limits
- Can add/remove categories
- Can update budget settings
- Cannot manage sharing

### **Admin**
- All Edit permissions
- Can invite/remove collaborators
- Can change permission levels
- Can delete budget shares
- Cannot transfer ownership

### **Owner**
- All Admin permissions
- Full control over budget
- Can delete budget
- Cannot be removed

---

## 🎨 **Components**

### **ShareBudgetDialog** (`src/components/budget/ShareBudgetDialog.tsx`)
Modal for inviting collaborators to a budget.

**Features:**
- Email-based invitation
- Permission level selection
- List of current collaborators
- Remove access functionality
- Status indicators (pending/accepted)

**Props:**
- `budgetId` (string)
- `budgetName` (string)

### **BudgetActivityFeed** (`src/components/budget/BudgetActivityFeed.tsx`)
Real-time activity log showing budget changes.

**Features:**
- Chronological activity list
- User attribution
- Action descriptions
- Real-time updates via Supabase subscriptions
- Infinite scroll (up to 50 items)

**Props:**
- `budgetId` (string)

### **BudgetComments** (`src/components/budget/BudgetComments.tsx`)
Comment section for budget discussions.

**Features:**
- Add comments
- Real-time comment updates
- Delete own comments
- User avatars and timestamps
- Comment threading support (parent_comment_id)

**Props:**
- `budgetId` (string)

### **SharedCategoryTemplates** (`src/components/budget/SharedCategoryTemplates.tsx`)
Template manager for common budget categories.

**Features:**
- Built-in templates (Household, Couple, Family, Roommates)
- Preview categories before applying
- Save custom templates
- Public/private template sharing
- Apply templates to current budget

**Props:**
- `onApplyTemplate?: (categories: any[]) => void`

---

## 🪝 **Hooks**

### **useBudgetPermission** (`src/hooks/useBudgetCollaboration.ts`)
Checks user's permission level for a budget.

**Returns:**
```typescript
{
  canEdit: boolean;
  canAdmin: boolean;
  isOwner: boolean;
}
```

**Usage:**
```typescript
const { data: permissions } = useBudgetPermission(budgetId);

if (!permissions?.canEdit) {
  return <div>Read-only access</div>;
}
```

### **useSharedBudgets**
Gets all budgets user has access to (owned + shared).

**Returns:**
```typescript
Array<{
  ...budget,
  isShared: boolean;
  permission: 'view' | 'edit' | 'admin';
}>
```

### **usePendingInvitations**
Gets pending budget share invitations.

**Returns:**
```typescript
Array<{
  id: string;
  budget: { name: string; total_limit: number };
  inviter: { full_name: string };
  permission_level: string;
  created_at: string;
}>
```

---

## 🔄 **Real-time Features**

### **Activity Log Updates**
```typescript
const channel = supabase
  .channel(`budget-activity-${budgetId}`)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "budget_activity_log",
      filter: `budget_id=eq.${budgetId}`,
    },
    () => refetch()
  )
  .subscribe();
```

### **Comment Updates**
```typescript
const channel = supabase
  .channel(`budget-comments-${budgetId}`)
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "budget_comments",
      filter: `budget_id=eq.${budgetId}`,
    },
    () => refetch()
  )
  .subscribe();
```

---

## 🎯 **User Flows**

### **Inviting a Collaborator**

1. Owner opens ShareBudgetDialog
2. Enters collaborator's email
3. Selects permission level
4. Clicks "Send invite"
5. System creates pending share record
6. Collaborator receives notification (future: email)
7. Collaborator accepts/declines invitation
8. Upon acceptance, budget appears in their shared budgets list

### **Viewing Shared Budget**

1. User navigates to budget page
2. If shared, banner shows "Shared budget" with collaborator count
3. User can view activity and comments
4. Edit capabilities depend on permission level
5. Real-time updates show when others make changes

### **Using Templates**

1. User clicks "Templates" button
2. Browses built-in templates (Household, Couple, Family, Roommates)
3. Previews category breakdown
4. Clicks "Apply template"
5. Budget categories populated with template percentages
6. User can customize after applying

---

## 🔒 **Security**

### **Row-Level Security (RLS)**

**Budget Access:**
- Users can view budgets they own OR have accepted share access to
- Users can edit budgets they own OR have edit/admin permission on shared budgets

**Share Management:**
- Only budget owners can create new shares
- Owners and admins can modify/delete shares
- Invited users can update their own share status (accept/decline)

**Activity & Comments:**
- Only collaborators with access can view activity/comments
- Only collaborators can add comments
- Users can only delete their own comments

**Templates:**
- Users can only create/edit/delete their own templates
- Public templates are visible to all users
- Private templates only visible to creator

### **Validation**

- Permission levels validated at database level (CHECK constraints)
- Share status validated (pending, accepted, declined only)
- Unique constraint prevents duplicate shares
- Cascade deletes ensure orphaned records are removed

---

## 📊 **Analytics & Monitoring**

### **Key Metrics**
- Number of shared budgets
- Average collaborators per budget
- Share acceptance rate
- Activity log entries per budget
- Comment engagement rate
- Template usage statistics

### **Activity Tracking**
All budget modifications automatically logged via trigger:
```sql
CREATE TRIGGER log_user_budgets_activity
AFTER INSERT OR UPDATE OR DELETE ON public.user_budgets
FOR EACH ROW
EXECUTE FUNCTION log_budget_activity();
```

---

## 🚀 **Integration Guide**

### **Add Sharing to Budget Page**

```typescript
import { ShareBudgetDialog } from "@/components/budget/ShareBudgetDialog";
import { BudgetActivityFeed } from "@/components/budget/BudgetActivityFeed";
import { BudgetComments } from "@/components/budget/BudgetComments";
import { useBudgetPermission } from "@/hooks/useBudgetCollaboration";

function BudgetPage({ budgetId }) {
  const { data: permissions } = useBudgetPermission(budgetId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1>Budget Name</h1>
        {permissions?.isOwner && (
          <ShareBudgetDialog budgetId={budgetId} budgetName="Budget Name" />
        )}
      </div>

      {/* Budget form - disable if !canEdit */}
      <BudgetForm disabled={!permissions?.canEdit} />

      {/* Activity and Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <BudgetActivityFeed budgetId={budgetId} />
        <BudgetComments budgetId={budgetId} />
      </div>
    </div>
  );
}
```

### **Add Templates to Budget Creation**

```typescript
import { SharedCategoryTemplates } from "@/components/budget/SharedCategoryTemplates";

function CreateBudgetDialog() {
  const [categories, setCategories] = useState([]);

  return (
    <Dialog>
      <DialogContent>
        <h2>Create Budget</h2>
        
        <SharedCategoryTemplates
          onApplyTemplate={(templateCategories) => {
            setCategories(templateCategories);
          }}
        />

        {/* Budget form with applied categories */}
      </DialogContent>
    </Dialog>
  );
}
```

### **Show Pending Invitations**

```typescript
import { usePendingInvitations } from "@/hooks/useBudgetCollaboration";

function NotificationBell() {
  const { data: invitations } = usePendingInvitations();

  return (
    <Badge count={invitations?.length || 0}>
      <Bell />
    </Badge>
  );
}
```

---

## 🎓 **Best Practices**

### **Permission Checking**
Always check permissions before allowing actions:
```typescript
const { data: perms } = useBudgetPermission(budgetId);

if (!perms?.canEdit) {
  return <ReadOnlyView />;
}
```

### **Real-time Updates**
Clean up subscriptions to prevent memory leaks:
```typescript
useEffect(() => {
  const channel = supabase.channel('budget-activity');
  // ... subscription setup
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [budgetId]);
```

### **Optimistic Updates**
Use React Query's optimistic updates for better UX:
```typescript
const mutation = useMutation({
  mutationFn: addComment,
  onMutate: async (newComment) => {
    await queryClient.cancelQueries(['comments', budgetId]);
    const previous = queryClient.getQueryData(['comments', budgetId]);
    
    queryClient.setQueryData(['comments', budgetId], (old) => [
      ...old,
      { ...newComment, id: 'temp' }
    ]);
    
    return { previous };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(['comments', budgetId], context.previous);
  },
});
```

---

## 🐛 **Troubleshooting**

### **"User not found" error when sharing**
- Ensure the email belongs to a registered user
- Check that user has completed onboarding
- Verify profile table has email field

### **Permission denied errors**
- Verify RLS policies are correctly applied
- Check user's share status is 'accepted'
- Ensure share hasn't expired or been revoked

### **Real-time updates not working**
- Confirm Supabase realtime is enabled for tables
- Check channel subscription is active
- Verify network connection
- Look for subscription errors in console

---

## ✅ **Testing Checklist**

- [ ] Owner can share budget with view permission
- [ ] Owner can share budget with edit permission
- [ ] Owner can share budget with admin permission
- [ ] Invited user receives pending invitation
- [ ] Invited user can accept invitation
- [ ] Invited user can decline invitation
- [ ] View permission users cannot edit
- [ ] Edit permission users can modify budget
- [ ] Admin users can manage sharing
- [ ] Activity log captures all changes
- [ ] Real-time updates work for activity
- [ ] Users can add comments
- [ ] Users can delete own comments
- [ ] Real-time updates work for comments
- [ ] Templates can be applied
- [ ] Custom templates can be saved
- [ ] Public templates visible to all
- [ ] Private templates only visible to creator
- [ ] Owner can remove collaborators
- [ ] Admins can change permissions
- [ ] Cascade deletes work correctly

---

## 🔮 **Future Enhancements**

### **Short-term**
- Email notifications for invitations
- Push notifications for comments/activity
- Mention users in comments (@username)
- Comment reactions (👍, ❤️, etc.)
- Rich text comments (bold, italic, links)

### **Medium-term**
- Approval workflows (require approval for changes)
- Budget version history with rollback
- Conflict resolution for simultaneous edits
- Export activity log to PDF
- Advanced permission templates

### **Long-term**
- Video comments
- Budget co-creation mode (live editing)
- AI-powered comment suggestions
- Integration with family accounts
- Shared savings goals across budgets

---

**Phase 12 Complete! 🎉**  
$ave+ now supports full collaborative budget management with sharing, permissions, activity tracking, and comments.
