import Image from "next/image";
import React from "react";
import avatar from "@/../public/images/user.png";

interface UserAvatarProps {
  firstName: string;
  lastName: string;
}

const UserAvatar = ({ firstName, lastName }: UserAvatarProps) => {
  return (
    <div className=" rounded-full  text-white flex items-center justify-center">
      {
        //   avatar ? (
        <Image
          src={avatar}
          alt={firstName + " " + lastName}
          className="w-6 h-6"
          width={400}
          height={400}
        />
        //   ) : (
        //     firstName[0].toUpperCase() + lastName[0].toUpperCase()
        //   )
      }
    </div>
  );
};

export default UserAvatar;
