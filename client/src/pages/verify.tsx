import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Verify() {
  const [code, setCode] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const email = new URLSearchParams(window.location.search).get("email");

  if (!email) {
    navigate("/register");
    return null;
  }

  const { mutate: verify, isPending: isVerifying } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/verify", { email, code });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message
      });
      navigate("/confirmation");
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const { mutate: resend, isPending: isResending } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/resend-code", { email });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Code Resent",
        description: data.message
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to resend code",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Verify Your Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            We sent a verification code to <span className="font-medium">{email}</span>
          </p>

          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </div>

          <Button
            onClick={() => verify()}
            disabled={isVerifying || code.length !== 6}
            className="w-full"
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>

          <Button
            variant="ghost"
            onClick={() => resend()}
            disabled={isResending}
            className="w-full"
          >
            {isResending ? "Resending..." : "Resend Code"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}