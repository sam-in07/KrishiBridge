// src/pages/Auth.jsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, UserCircle, ShoppingBasket, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

import { auth, googleProvider } from "../Firebase/firebase.config";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

const Auth = () => {
  const [selectedRole, setSelectedRole] = useState("farmer");
  const [isLogin, setIsLogin] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Track auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setCurrentUser(user);
      else setCurrentUser(null);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    const name = !isLogin ? e.target.name.value.trim() : "";
    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    if (!validateEmail(email)) {
      return toast({ title: "Invalid Email", description: "Please enter a valid email address" });
    }
    if (password.length < 6) {
      return toast({ title: "Weak Password", description: "Password must be at least 6 characters" });
    }

    try {
      let userCredential;

      if (isLogin) {
        // Login
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Login Successful!", description: `Welcome back, ${userCredential.user.displayName || "User"}` });
      } else {
        // Sign up
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update display name
        await updateProfile(userCredential.user, { displayName: name });
        toast({ title: "Account Created!", description: `Welcome to KrishiBridge ${selectedRole} portal` });
      }

      // Store info locally
      localStorage.setItem("userName", userCredential.user.displayName || name || "User");
      localStorage.setItem("userEmail", userCredential.user.email);
      localStorage.setItem("userRole", selectedRole);

      // Navigate based on role
      if (selectedRole === "farmer") navigate("/farmer");
      else if (selectedRole === "buyer") navigate("/buyer");
      else navigate("/admin");

    } catch (error) {
      console.log("Firebase Error:", error.code, error.message);
      toast({ title: "Authentication Error", description: error.message });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Store info locally
      localStorage.setItem("userName", user.displayName || "User");
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userRole", selectedRole);

      toast({ title: "Google Login Successful!", description: `Welcome ${user.displayName || "User"}` });

      if (selectedRole === "farmer") navigate("/farmer");
      else if (selectedRole === "buyer") navigate("/buyer");
      else navigate("/admin");

    } catch (error) {
      console.log("Firebase Google SignIn Error:", error.code, error.message);
      toast({ title: "Google SignIn Error", description: error.message });
    }
  };

  const roles = [
    { id: "farmer", title: "Farmer", subtitle: "কৃষক", icon: UserCircle, description: "Sell your produce directly" },
    { id: "buyer", title: "Buyer", subtitle: "ক্রেতা", icon: ShoppingBasket, description: "Buy fresh local produce" },
    { id: "admin", title: "Admin", subtitle: "প্রশাসক", icon: Shield, description: "Platform management" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">KrishiBridge</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">{isLogin ? "Welcome Back" : "Join KrishiBridge"}</h1>
          <p className="text-muted-foreground">Choose your role and continue</p>
        </div>

        {/* Role Cards */}
        <div className="grid gap-8 lg:grid-cols-3 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all ${isSelected ? "border-2 border-primary shadow-lg scale-105" : "hover:bg-primary/5 hover:shadow-md"}`}
                onClick={() => setSelectedRole(role.id)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Icon className={`h-8 w-8 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <CardTitle>{role.title}</CardTitle>
                  <CardDescription>{role.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Auth Form */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>
              {isLogin ? "Login" : "Create Account"} as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
            </CardTitle>
            <CardDescription>
              {isLogin ? "Enter your credentials to continue" : "Fill in your details to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name / পূর্ণ নাম</Label>
                  <Input id="name" name="name" placeholder="Enter your name" required />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email / ইমেইল</Label>
                <Input id="email" name="email" type="text" placeholder="name@example.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password / পাসওয়ার্ড</Label>
                <Input id="password" name="password" type="password" placeholder="Enter password" required />
              </div>

              {!isLogin && selectedRole === "farmer" && (
                <div className="space-y-2">
                  <Label htmlFor="nid">NID Number / জাতীয় পরিচয়পত্র নম্বর</Label>
                  <Input id="nid" name="nid" placeholder="Enter your NID" />
                </div>
              )}

              <Button type="submit" className="w-full" variant="hero">
                {isLogin ? "Login / লগইন" : "Create Account / অ্যাকাউন্ট তৈরি করুন"}
              </Button>

              <Button type="button" onClick={handleGoogleSignIn} className="w-full mt-2" variant="outline">
                Continue with Google
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-8">
          By continuing, you agree to KrishiBridge's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;
