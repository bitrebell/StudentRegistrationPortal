import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface StudentInfo {
  name: string;
  email: string;
  institution: string;
  needsAccommodation: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function Dashboard() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: studentInfo } = useQuery<StudentInfo>({
    queryKey: ["/api/student-info"],
  });

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      toast({
        title: "Logged out successfully"
      });
      navigate("/login");
    }
  });

  const notifications = [
    {
      id: 1,
      title: "Welcome to Student Portal",
      message: "We're glad to have you here! Explore your dashboard to get started.",
      time: "Just now"
    },
    {
      id: 2,
      title: "Complete Your Profile",
      message: "Make sure all your information is up to date.",
      time: "2 minutes ago"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button variant="ghost" onClick={() => logout()}>
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2"
        >
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle>Welcome, {studentInfo?.name}!</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Email:</strong> {studentInfo?.email}</p>
                  <p><strong>Institution:</strong> {studentInfo?.institution}</p>
                  {studentInfo?.needsAccommodation && (
                    <p className="text-blue-500">Accommodation Required</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Notifications</CardTitle>
                <Bell className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="border-b last:border-0 pb-4 last:pb-0"
                    >
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <span className="text-xs text-muted-foreground mt-1">
                        {notification.time}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
