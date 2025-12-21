import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { ArrowLeft, Settings, Shield, Award, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileDetailsForm } from "@/components/profile/ProfileDetailsForm";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfilePictureUpload } from "@/components/settings/ProfilePictureUpload";
import { withPageErrorBoundary } from "@/components/error/withPageErrorBoundary";
import { withPageMemo } from "@/lib/performance-utils";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();

  const quickLinks = [
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: Shield, label: "Security", path: "/security-settings" },
    { icon: Award, label: "Rewards", path: "/rewards" },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Profile not found</p>
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Profile | $ave+</title>
        <meta name="description" content="Manage your $ave+ profile, account details, and preferences." />
      </Helmet>

      <AppLayout>
        <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </motion.div>

          {/* Profile Header */}
          <ProfileHeader
            profile={profile}
            email={user?.email}
          />

          {/* Account Details Form */}
          <ProfileDetailsForm
            profile={profile}
            email={user?.email}
            onSave={updateProfile}
            isSaving={isUpdating}
          />

          {/* Avatar Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Profile Picture
                </CardTitle>
                <CardDescription>
                  Upload or change your profile picture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfilePictureUpload />
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Stats */}
          <ProfileStats profile={profile} />

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>
                  Navigate to related settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {quickLinks.map((link) => (
                    <Button
                      key={link.path}
                      variant="outline"
                      className="flex flex-col items-center gap-2 h-auto py-4"
                      onClick={() => navigate(link.path)}
                    >
                      <link.icon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs">{link.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AppLayout>
    </>
  );
};

export default withPageErrorBoundary(withPageMemo(ProfilePage, 'Profile'), 'Profile');
