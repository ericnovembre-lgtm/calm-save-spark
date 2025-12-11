import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SecurityNotificationPreferences } from "@/components/settings/SecurityNotificationPreferences";
import { TestSecurityAlert } from "@/components/settings/TestSecurityAlert";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Shield, KeyRound, Fingerprint, MonitorSmartphone, AlertOctagon, ArrowRight, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function SecuritySettings() {
  const prefersReducedMotion = useReducedMotion();

  const securityLinks = [
    {
      title: "Guardian Security Center",
      description: "View active sessions, connected apps, and threat monitoring",
      icon: Shield,
      href: "/guardian",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Change Password",
      description: "Update your account password",
      icon: KeyRound,
      href: "/settings",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Biometric Authentication",
      description: "Set up fingerprint or face recognition",
      icon: Fingerprint,
      href: "/settings",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      title: "Active Sessions",
      description: "Manage devices logged into your account",
      icon: MonitorSmartphone,
      href: "/guardian",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      title: "Emergency Lockdown",
      description: "Instantly secure your account if compromised",
      icon: AlertOctagon,
      href: "/guardian",
      color: "text-rose-400",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Header */}
        <div className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
          
          <div className="relative max-w-5xl mx-auto px-4 py-12">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                <Settings2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Security Settings</h1>
                <p className="text-muted-foreground mt-1">
                  Manage your security preferences and notification alerts
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          {/* Security Notification Preferences */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <SecurityNotificationPreferences />
          </motion.div>

          {/* Test Security Alert */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <TestSecurityAlert />
          </motion.div>

          {/* Quick Access Links */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security Controls
                </CardTitle>
                <CardDescription>
                  Quick access to security features and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {securityLinks.map((link) => (
                    <Link key={link.title} to={link.href}>
                      <div className="group p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-accent/50 hover:border-primary/30 transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${link.bg}`}>
                            <link.icon className={`h-4 w-4 ${link.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                {link.title}
                              </h3>
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {link.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security Tips */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-border/50 bg-gradient-to-br from-emerald-500/5 to-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <Shield className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Security Best Practices</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Enable all security alerts to stay informed about account activity
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Review your active sessions regularly and revoke unfamiliar devices
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Use a strong, unique password and consider enabling two-factor authentication
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Review connected apps periodically and remove ones you no longer use
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Back to Settings */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center"
          >
            <Link to="/settings">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                ← Back to Settings
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
