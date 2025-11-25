import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const addTokenSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(10, "Symbol too long"),
  name: z.string().min(1, "Name is required"),
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Quantity must be a positive number",
  }),
  purchasePrice: z.string().optional(),
  walletAddress: z.string().optional(),
  exchange: z.string().optional(),
});

type AddTokenForm = z.infer<typeof addTokenSchema>;

interface AddTokenDialogProps {
  walletAddress?: string;
}

export function AddTokenDialog({ walletAddress }: AddTokenDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddTokenForm>({
    resolver: zodResolver(addTokenSchema),
    defaultValues: {
      symbol: "",
      name: "",
      quantity: "",
      purchasePrice: "",
      walletAddress: walletAddress || "",
      exchange: "",
    },
  });

  const onSubmit = async (values: AddTokenForm) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("crypto_holdings").insert({
        user_id: user.id,
        symbol: values.symbol.toUpperCase(),
        name: values.name,
        quantity: parseFloat(values.quantity),
        purchase_price: values.purchasePrice ? parseFloat(values.purchasePrice) : null,
        wallet_address: values.walletAddress || null,
        exchange: values.exchange || null,
      });

      if (error) throw error;

      toast({
        title: "Token added successfully",
        description: `${values.quantity} ${values.symbol} added to your portfolio`,
      });

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["wallet-token-holdings"] });
      
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Failed to add token",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-accent/10 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Token
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Token to Portfolio</DialogTitle>
          <DialogDescription>
            Manually add a token holding to track in your portfolio
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="ETH" {...field} className="uppercase" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="1.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ethereum" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchasePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Price (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder="2500.00" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the price you paid per token (in USD)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="walletAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="0x..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="exchange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exchange (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Coinbase, Binance, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Token"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
