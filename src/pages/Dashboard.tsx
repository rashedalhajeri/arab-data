
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-indigo-950 dark:to-slate-900 p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>لوحة التحكم</CardTitle>
        </CardHeader>
        <CardContent>
          <p>مرحباً بك في لوحة التحكم الخاصة بك!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
