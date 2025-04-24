
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateOfficeForm } from "@/components/office/CreateOfficeForm";
import { useCreateOffice } from "@/hooks/use-create-office";

const CreatePage = () => {
  const { loading, slugAvailable, errors, setErrors, handleSubmit } = useCreateOffice();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-indigo-950 dark:to-slate-900">
      <Card className="w-full max-w-xl p-2 rounded-3xl shadow-2xl" dir="rtl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-extrabold">
            إنشاء صفحة المكتب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CreateOfficeForm
            loading={loading}
            onSubmit={handleSubmit}
            slugAvailable={slugAvailable}
            errors={errors}
            setErrors={setErrors}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePage;
