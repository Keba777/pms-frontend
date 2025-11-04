// src/app/profile/page.tsx
"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditUserForm from "@/components/forms/EditUserForm";
import ChangePasswordForm from "@/components/forms/ChangePasswordForm";  // New import
import userAvatar from "@/../public/images/user.png";
import { UpdateUserInput } from "@/types/user";
import { useUpdateUser, useUser } from "@/hooks/useUsers";  // Added useChangePassword
import { format } from "date-fns";
import { useChangePassword } from "@/hooks/useAuth";

export default function ProfilePage() {
  const authUser = useAuthStore((state) => state.user);
  const updateMutation = useUpdateUser();
  const changePasswordMutation = useChangePassword();  // New mutation
  const { data: currentUser, isLoading } = useUser(authUser?.id || "");
  const [showEditForm, setShowEditForm] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);  // New state

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Loading...
      </div>
    );
  }

  const handleUpdateUser = (data: UpdateUserInput) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        setShowEditForm(false);
      },
    });
  };

  const handleChangePassword = (data: { oldPassword: string; newPassword: string }) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        setShowChangePasswordForm(false);
      },
    });
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    return format(new Date(date), "PPP");
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className="overflow-hidden shadow-xl rounded-2xl border border-gray-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <Image
              src={currentUser.profile_picture || userAvatar}
              alt={`${currentUser.first_name} ${currentUser.last_name}`}
              width={100}
              height={100}
              className="rounded-full border-4 border-white shadow-md"
            />
            <div className="text-center sm:text-left flex-1">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
                {currentUser.first_name} {currentUser.last_name}
              </CardTitle>
              <p className="text-base sm:text-lg text-gray-700 mt-1">
                {currentUser.role?.name || "Role not assigned"}
              </p>
              <p className="text-sm sm:text-md text-gray-600 mt-1">
                {currentUser.email} • {currentUser.phone}
              </p>
              <Badge
                variant="secondary"
                className="mt-2 bg-blue-100 text-blue-800"
              >
                {currentUser.status || "Status not set"}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">  {/* New container for buttons */}
              <Button
                onClick={() => setShowEditForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 flex-1 sm:flex-none"
              >
                Edit Profile
              </Button>
              <Button
                onClick={() => setShowChangePasswordForm(true)}  // New button
                variant="outline"
                className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold py-2 px-4 rounded-lg transition duration-300 flex-1 sm:flex-none"
              >
                Change Password
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Department and Site */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold text-gray-800 mb-1">
                  Department
                </h3>
                <p className="text-gray-600">
                  {currentUser.department?.name || "Not assigned"}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-base font-semibold text-gray-800 mb-1">
                  Site
                </h3>
                <p className="text-gray-600">
                  {currentUser.site?.name || "Not assigned"}
                </p>
              </div>
            </div>
            {/* Responsibilities */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">
                Responsibilities
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentUser.responsiblities?.length ? (
                  currentUser.responsiblities.map((resp, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-gray-50 text-gray-700 border-gray-300"
                    >
                      {resp}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500">None assigned</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Section */}
        <Card className="shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-blue-50 p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-blue-900">
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {currentUser.projects?.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-100">
                      <TableHead className="px-4 py-3 text-left text-blue-900">
                        Name
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-blue-900">
                        Priority
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-blue-900">
                        Start Date
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-blue-900">
                        End Date
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-blue-900">
                        Progress
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-blue-900">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUser.projects.map((project) => (
                      <TableRow
                        key={project.id}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <TableCell className="px-4 py-3 font-medium">
                          {project.title}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {project.priority}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {formatDate(project.start_date)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {formatDate(project.end_date)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {project.progress}%
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="text-blue-700 border-blue-300"
                          >
                            {project.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="p-6 text-center text-gray-600">
                You have no assigned projects.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tasks Section */}
        <Card className="shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-green-50 p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-green-900">
              Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {currentUser.tasks?.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-100">
                      <TableHead className="px-4 py-3 text-left text-green-900">
                        Name
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-green-900">
                        Priority
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-green-900">
                        Start Date
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-green-900">
                        End Date
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-green-900">
                        Progress
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-green-900">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUser.tasks.map((task) => (
                      <TableRow
                        key={task.id}
                        className="hover:bg-green-50 transition-colors"
                      >
                        <TableCell className="px-4 py-3 font-medium">
                          {task.task_name}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {task.priority}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {formatDate(task.start_date)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {formatDate(task.end_date)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {task.progress}%
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="text-green-700 border-green-300"
                          >
                            {task.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="p-6 text-center text-gray-600">
                You have no assigned tasks.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Activities Section */}
        <Card className="shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-purple-50 p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-purple-900">
              Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {currentUser.activities?.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-100">
                      <TableHead className="px-4 py-3 text-left text-purple-900">
                        Name
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-purple-900">
                        Priority
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-purple-900">
                        Start Date
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-purple-900">
                        End Date
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-purple-900">
                        Progress
                      </TableHead>
                      <TableHead className="px-4 py-3 text-left text-purple-900">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUser.activities.map((activity) => (
                      <TableRow
                        key={activity.id}
                        className="hover:bg-purple-50 transition-colors"
                      >
                        <TableCell className="px-4 py-3 font-medium">
                          {activity.activity_name}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {activity.priority}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {formatDate(activity.start_date)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {formatDate(activity.end_date)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {activity.progress}%
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="text-purple-700 border-purple-300"
                          >
                            {activity.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="p-6 text-center text-gray-600">
                You have no assigned activities.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Requests Section */}
        <Card className="shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-orange-50 p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-orange-900">
              Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-orange-600">
              {currentUser.requests?.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <EditUserForm
              user={currentUser}
              onClose={() => setShowEditForm(false)}
              onSubmit={handleUpdateUser}
              usePasswordField={false}
            />
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <ChangePasswordForm
              onClose={() => setShowChangePasswordForm(false)}
              onSubmit={handleChangePassword}
            />
          </div>
        </div>
      )}
    </div>
  );
}