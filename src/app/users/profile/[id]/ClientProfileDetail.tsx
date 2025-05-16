"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { User } from "@/types/user";
import { useEffect } from "react";
import Image from "next/image";

interface ClientProfileDetailProps {
  userId: string;
}

export default function ClientProfileDetail({
  userId,
}: ClientProfileDetailProps) {
  const router = useRouter();
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
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <div className="flex items-center space-x-4">
        <button
          className="text-gray-600 hover:text-gray-900 flex items-center p-2 bg-white border-2 border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          onClick={() => router.push("/users")}
        >
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-200 transform hover:translate-x-2" />
          <span className="text-lg font-semibold transition-all duration-300">
            Back to Users
          </span>
        </button>
      </div>

      <h1 className="text-5xl font-bold text-cyan-800 mt-4">
        {user.first_name} {user.last_name}
      </h1>
      {user.email && <p className="text-gray-600 mt-2">{user.email}</p>}
      {user.phone && <p className="text-gray-600 mt-2">{user.phone}</p>}
      {user.role && (
        <p className="text-gray-600 mt-2">Role: {user.role.name}</p>
      )}
      {user.status && (
        <p className="text-gray-600 mt-2">Status: {user.status}</p>
      )}
      {user.department_id && (
        <p className="text-gray-600 mt-2">
          Department ID: {user.department?.name}
        </p>
      )}
      {user.profile_picture && (
        <Image
          src={user.profile_picture}
          alt={`${user.first_name} ${user.last_name}`}
          className="mt-4 rounded-full w-32 h-32 object-cover"
        />
      )}
      <div className="mt-4">
        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
          {user.status}
        </span>
      </div>
      <div className="lg:w-2/3 mt-6 lg:mt-0 flex justify-center">
        <div className="w-full bg-gray-50 p-8 rounded-lg shadow-md">
          {/* <h2 className="text-3xl font-semibold text-gray-800 mb-4 text-center">
            User Details
          </h2> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Phone */}
            <div className="flex items-center">
              <span className="bg-yellow-300 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
                Phone: {user.phone}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                Responsibilities
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
