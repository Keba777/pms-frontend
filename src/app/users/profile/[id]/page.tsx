"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { User } from "@/types/user";
import { useEffect } from "react";
import Image from "next/image";
import avatar from "@/../public/images/user.png";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const users = useUserStore((state) => state.users);
  const user = users.find((u: User) => u.id === userId);

  useEffect(() => {
    if (!user) {
      router.push("/users");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="text-center text-red-500 mt-10">User not found.</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
      {/* Back Button */}
      <button
        onClick={() => router.push("/users")}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Users
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          {user.profile_picture ? (
            <Image
              src={user.profile_picture || avatar}
              alt={`${user.first_name} ${user.last_name}`}
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}
        </div>

        {/* Name & Status */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-cyan-800">
            {user.first_name} {user.last_name}
          </h1>
          <span
            className={`inline-block mt-2 px-3 py-1 text-sm font-semibold rounded-full ${user.status === "Active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
              }`}
          >
            {user.status}
          </span>
        </div>
      </div>

      {/* Two-column Info Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
        <div>
          <p>
            <span className="font-semibold">Email:</span> {user.email}
          </p>
          <p className="mt-2">
            <span className="font-semibold">Phone:</span> {user.phone}
          </p>
          <p className="mt-2">
            <span className="font-semibold">Role:</span> {user.role?.name}
          </p>
        </div>
        <div>
          <p>
            <span className="font-semibold">Site:</span> {user.site?.name}
          </p>
          <p className="mt-2">
            <span className="font-semibold">Department:</span>{" "}
            {user.department?.name || "—"}
          </p>
          {/* <p className="mt-2">
            <span className="font-semibold">Password:</span> ••••••••
          </p> */}
        </div>
      </div>

      {/* Responsibilities */}
      {user.responsiblities && user.responsiblities.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Responsibilities
          </h2>
          <div className="flex flex-wrap gap-2">
            {user.responsiblities.map((r, i) => (
              <span
                key={i}
                className="inline-flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related Counts */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-xl font-bold">{user.projects?.length || 0}</p>
          <p className="text-sm text-gray-500">Projects</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-xl font-bold">{user.tasks?.length || 0}</p>
          <p className="text-sm text-gray-500">Tasks</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-xl font-bold">{user.activities?.length || 0}</p>
          <p className="text-sm text-gray-500">Activities</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-xl font-bold">{user.requests?.length || 0}</p>
          <p className="text-sm text-gray-500">Requests</p>
        </div>
      </div>
    </div>
  );
}
