
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Mail, UserPlus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Define the form schema with zod
const inviteFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  memberType: z.enum(['adult', 'child', 'senior'], {
    required_error: "Please select a member type",
  }),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

const FamilyInvitePage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize react-hook-form with zod validation
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      memberType: 'adult',
    },
  });

  const onSubmit = async (data: InviteFormValues) => {
    setLoading(true);
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to invite family members');
      }
      
      // Check if the user has a family group
      const { data: existingGroups, error: groupError } = await supabase
        .from('family_groups')
        .select('id')
        .eq('created_by', user.id)
        .limit(1);
        
      if (groupError) throw groupError;
      
      // Create a family group if one doesn't exist
      let familyGroupId;
      if (!existingGroups || existingGroups.length === 0) {
        const { data: newGroup, error: newGroupError } = await supabase
          .from('family_groups')
          .insert({
            name: 'My Family',
            created_by: user.id
          })
          .select('id')
          .single();
          
        if (newGroupError) throw newGroupError;
        familyGroupId = newGroup?.id;
      } else {
        familyGroupId = existingGroups[0].id;
      }
      
      // Check if the member has already been invited
      const { data: existingInvitations, error: invitationError } = await supabase
        .from('family_invitations')
        .select('id')
        .eq('email', data.email)
        .eq('family_group_id', familyGroupId)
        .eq('status', 'pending')
        .limit(1);
        
      if (invitationError) throw invitationError;
      
      if (existingInvitations && existingInvitations.length > 0) {
        toast({
          title: 'Already invited',
          description: 'This family member has already been invited.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      // Generate unique invitation code (simplified for demo)
      const invitationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Create the invitation
      const { error: insertError } = await supabase
        .from('family_invitations')
        .insert({
          family_group_id: familyGroupId,
          email: data.email,
          invitation_code: invitationCode,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        });
        
      if (insertError) throw insertError;
      
      // In a real app, you would send an email here
      // For now, we'll just show a success message
      
      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${data.email}.`,
      });
      
      // Navigate back to the family page
      navigate('/family');
      
    } catch (error) {
      console.error('Error inviting family member:', error);
      toast({
        title: 'Error',
        description: 'Failed to invite family member. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10 animate-fade-in">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/family')} 
        className="mb-6 hover:bg-transparent p-0"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Family
      </Button>
      
      <div className="flex items-center space-x-2 mb-6">
        <UserPlus className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Invite Family Member</h1>
      </div>
      
      <p className="text-muted-foreground mb-6">
        Invite a family member to join your family group. They'll receive an invitation via email.
      </p>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Family Member Details</CardTitle>
          <CardDescription>
            Enter the details of the family member you want to invite.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="family.member@example.com" 
                        type="email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      An invitation link will be sent to this email.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="memberType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Member type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="adult" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Adult
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="child" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Child
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="senior" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Senior
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Invitation'}
                <Mail className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex flex-col items-start">
          <Separator className="mb-4" />
          <div className="text-sm text-muted-foreground">
            <p>Up to 4 family members can be connected to your account.</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FamilyInvitePage;
