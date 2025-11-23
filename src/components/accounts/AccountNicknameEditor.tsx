import { useState } from 'react';
import { Pencil, Check, X, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface AccountNicknameEditorProps {
  accountId: string;
  currentNickname?: string | null;
  institutionName: string;
  onUpdate?: () => void;
}

export const AccountNicknameEditor = ({
  accountId,
  currentNickname,
  institutionName,
  onUpdate
}: AccountNicknameEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(currentNickname || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('connected_accounts')
        .update({ nickname: nickname || null })
        .eq('id', accountId);

      if (error) throw error;

      toast.success('Nickname saved!');
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error saving nickname:', error);
      toast.error('Failed to save nickname');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNickname(prev => prev + emojiData.emoji);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-foreground">
          {currentNickname || institutionName}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={nickname}
        onChange={(e) => setNickname(e.target.value.slice(0, 30))}
        placeholder={institutionName}
        className="h-8 text-sm"
        maxLength={30}
        autoFocus
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
          >
            <Smile className="w-3 h-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-0" align="start">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleSave}
        disabled={isSaving}
      >
        <Check className="w-3 h-3 text-success" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => {
          setNickname(currentNickname || '');
          setIsEditing(false);
        }}
        disabled={isSaving}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
};
