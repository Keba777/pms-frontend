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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Accessing Credentials...</p>
        </div>
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
    <div className="min-h-screen p-4 sm:p-8 bg-background">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Profile Header */}
        <Card className="overflow-hidden shadow-2xl shadow-black/5 rounded-[2.5rem] border border-border">
          <CardHeader className="bg-primary/5 p-8 sm:p-12 flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
            <Image
              src={currentUser.profile_picture || userAvatar}
              alt={`${currentUser.first_name} ${currentUser.last_name}`}
              width={140}
              height={140}
              className="rounded-[3rem] border-4 border-card shadow-2xl relative z-10"
            />
            <div className="text-center sm:text-left flex-1 relative z-10">
              <h1 className="text-4xl sm:text-5xl font-black text-primary uppercase tracking-tighter">
                {currentUser.first_name} {currentUser.last_name}
              </h1>
              <p className="text-[10px] sm:text-xs font-black text-muted-foreground/60 uppercase tracking-[0.3em] mt-3 flex items-center gap-3 justify-center sm:justify-start">
                <span className="w-12 h-px bg-primary/30" /> {currentUser.role?.name || "OPERATIVE"}
              </p>
              <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                <span className="flex items-center gap-2 px-3 py-1 bg-card rounded-full border border-border">{currentUser.email}</span>
                <span className="flex items-center gap-2 px-3 py-1 bg-card rounded-full border border-border">{currentUser.phone}</span>
              </div>
              <Badge
                variant="secondary"
                className="mt-6 bg-primary text-primary-foreground border-none px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 animate-pulse"
              >
                {currentUser.status || "ACTIVE"}
              </Badge>
            </div>
            <div className="flex flex-col gap-3 relative z-10 min-w-[200px]">
              <Button
                onClick={() => setShowEditForm(true)}
                className="bg-primary text-primary-foreground border-none rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 py-6"
              >
                Override Profile
              </Button>
              <Button
                onClick={() => setShowChangePasswordForm(true)}
                variant="outline"
                className="border-primary/20 text-primary bg-card hover:bg-primary/5 rounded-xl text-[10px] font-black uppercase tracking-widest py-6"
              >
                Security Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-10 space-y-10">
            {/* Department and Site */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-6 rounded-[1.5rem] bg-muted/10 border border-border shadow-inner">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">
                  Sector Assignment
                </h3>
                <p className="text-sm font-bold text-foreground">
                  {currentUser.department?.name || "UNASSIGNED"}
                </p>
              </div>
              <div className="p-6 rounded-[1.5rem] bg-muted/10 border border-border shadow-inner">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">
                  Primary Hub
                </h3>
                <p className="text-sm font-bold text-foreground">
                  {currentUser.site?.name || "UNASSIGNED"}
                </p>
              </div>
            </div>
            {/* Responsibilities */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 ml-1">
                Mission Responsibilities
              </h3>
              <div className="flex flex-wrap gap-3">
                {currentUser.responsibilities?.length ? (
                  currentUser.responsibilities.map((resp, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-primary/5 text-[10px] font-black uppercase tracking-widest text-primary border-primary/20 px-4 py-2 rounded-xl"
                    >
                      {resp}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs font-bold text-muted-foreground/30 italic">No protocols assigned.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Section */}
        <Card className="shadow-2xl shadow-black/5 rounded-[2.5rem] border border-border overflow-hidden">
          <CardHeader className="bg-primary/5 p-8 border-b border-border">
            <CardTitle className="text-xl font-black text-primary uppercase tracking-widest">
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {currentUser.projects?.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10 border-b border-border hover:bg-primary/10">
                      <TableHead className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-widest">
                        Designation
                      </TableHead>
                      <TableHead className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-widest text-center">
                        Priority
                      </TableHead>
                      <TableHead className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-widest text-center">
                        Timeline
                      </TableHead>
                      <TableHead className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-widest text-center">
                        Progress
                      </TableHead>
                      <TableHead className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-widest text-right">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border">
                    {currentUser.projects.map((project) => (
                      <TableRow
                        key={project.id}
                        className="hover:bg-primary/5 transition-all group"
                      >
                        <TableCell className="px-8 py-6 font-black uppercase tracking-tight text-foreground">
                          {project.title}
                        </TableCell>
                        <TableCell className="px-8 py-6 text-center">
                          <Badge className="bg-muted/30 text-[8px] font-black text-muted-foreground uppercase tracking-widest border-none">
                            {project.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-black text-foreground">{formatDate(project.start_date)}</span>
                            <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">thru</span>
                            <span className="text-[10px] font-black text-foreground">{formatDate(project.end_date)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <div className="w-full bg-muted/20 h-1.5 rounded-full overflow-hidden shadow-inner border border-border">
                            <div className="bg-primary h-full transition-all" style={{ width: `${project.progress}%` }} />
                          </div>
                          <p className="text-[8px] font-black text-primary uppercase tracking-widest mt-2 text-center">{project.progress}% COMPLETE</p>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-right">
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-sm"
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
        <Card className="shadow-2xl shadow-black/5 rounded-[2.5rem] border border-border overflow-hidden">
          <CardHeader className="bg-green-500/5 p-8 border-b border-border">
            <CardTitle className="text-xl font-black text-green-700 uppercase tracking-widest">
              Deployment Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {currentUser.tasks?.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-500/10 border-b border-border hover:bg-green-500/10">
                      <TableHead className="px-8 py-5 text-[10px] font-black text-green-700 uppercase tracking-widest">
                        Task Descriptor
                      </TableHead>
                      <TableHead className="px-8 py-5 text-[10px] font-black text-green-700 uppercase tracking-widest text-center">
                        Level
                      </TableHead>
                      <TableHead className="px-8 py-5 text-[10px] font-black text-green-700 uppercase tracking-widest text-center">
                        Timeline
                      </TableHead>
                      <TableHead className="px-8 py-5 text-[10px] font-black text-green-700 uppercase tracking-widest text-center">
                        Completion
                      </TableHead>
                      <TableHead className="px-8 py-5 text-[10px] font-black text-green-700 uppercase tracking-widest text-right">
                        Phase
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border">
                    {currentUser.tasks.map((task) => (
                      <TableRow
                        key={task.id}
                        className="hover:bg-green-500/5 transition-all group"
                      >
                        <TableCell className="px-8 py-6 font-black uppercase tracking-tight text-foreground">
                          {task.task_name}
                        </TableCell>
                        <TableCell className="px-8 py-6 text-center">
                          <Badge className="bg-muted/30 text-[8px] font-black text-muted-foreground uppercase tracking-widest border-none">
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-black text-foreground">{formatDate(task.start_date)}</span>
                            <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">thru</span>
                            <span className="text-[10px] font-black text-foreground">{formatDate(task.end_date)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <div className="w-full bg-muted/20 h-1.5 rounded-full overflow-hidden shadow-inner border border-border">
                            <div className="bg-green-500 h-full transition-all" style={{ width: `${task.progress}%` }} />
                          </div>
                          <p className="text-[8px] font-black text-green-600 uppercase tracking-widest mt-2 text-center">{task.progress}% SYNCED</p>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-right">
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-700 border-green-500/20 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-sm"
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
        <Card className="shadow-2xl shadow-black/5 rounded-[2.5rem] border border-border overflow-hidden">
          <CardHeader className="bg-purple-500/5 p-8 border-b border-border">
            <CardTitle className="text-xl font-black text-purple-700 uppercase tracking-widest">
              Execution Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {currentUser.activities?.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-500/10 border-b border-border hover:bg-purple-500/10">
                      <TableHead className="px-8 py-5 text-[10px] font-black text-purple-700 uppercase tracking-widest">
                        Operation ID
                      </TableHead>
                      <TableHead className="px-8 py-5 text-[10px] font-black text-purple-700 uppercase tracking-widest text-center">
                        Urgency
                      </TableHead>
                      <TableHead className="px-8 py-5 text-[10px] font-black text-purple-700 uppercase tracking-widest text-center">
                        Temporal Range
                      </TableHead>
                      <TableHead className="px-8 py-5 text-[10px] font-black text-purple-700 uppercase tracking-widest text-center">
                        Saturation
                      </TableHead>
                      <TableHead className="px-8 py-5 text-[10px] font-black text-purple-700 uppercase tracking-widest text-right">
                        State
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border">
                    {currentUser.activities.map((activity) => (
                      <TableRow
                        key={activity.id}
                        className="hover:bg-purple-500/5 transition-all group"
                      >
                        <TableCell className="px-8 py-6 font-black uppercase tracking-tight text-foreground">
                          {activity.activity_name}
                        </TableCell>
                        <TableCell className="px-8 py-6 text-center">
                          <Badge className="bg-muted/30 text-[8px] font-black text-muted-foreground uppercase tracking-widest border-none">
                            {activity.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-black text-foreground">{formatDate(activity.start_date)}</span>
                            <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">thru</span>
                            <span className="text-[10px] font-black text-foreground">{formatDate(activity.end_date)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-6">
                          <div className="w-full bg-muted/20 h-1.5 rounded-full overflow-hidden shadow-inner border border-border">
                            <div className="bg-purple-500 h-full transition-all" style={{ width: `${activity.progress}%` }} />
                          </div>
                          <p className="text-[8px] font-black text-purple-600 uppercase tracking-widest mt-2 text-center">{activity.progress}% CAPTURED</p>
                        </TableCell>
                        <TableCell className="px-8 py-6 text-right">
                          <Badge
                            variant="outline"
                            className="bg-purple-500/10 text-purple-700 border-purple-500/20 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-sm"
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
        <Card className="shadow-2xl shadow-black/5 rounded-[2.5rem] border border-border overflow-hidden">
          <CardHeader className="bg-orange-500/5 p-8 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-black text-orange-700 uppercase tracking-widest">
              Directives Issued
            </CardTitle>
            <p className="text-5xl font-black text-orange-600 tracking-tighter">
              {String(currentUser.requests?.length || 0).padStart(2, '0')}
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Edit User Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-[3rem] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
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
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-[3rem] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
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