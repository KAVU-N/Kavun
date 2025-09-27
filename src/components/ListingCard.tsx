"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { FaMoneyBillWave, FaChalkboardTeacher, FaUniversity } from "react-icons/fa";

type Teacher = {
  _id?: string;
  name?: string;
  expertise?: string;
  profilePhotoUrl?: string;
};

export type Ilan = {
  _id: string;
  title: string;
  description: string;
  price: number;
  method: string;
  teacher?: Teacher;
  instructorFrom?: string;
};

type Props = {
  ilan: Ilan;
  t: (key: string) => string;
  userUniversity?: string;
  photoError: boolean;
  onAvatarError: (id: string) => void;
};

function ListingCardBase({ ilan, t, userUniversity, photoError, onAvatarError }: Props) {
  return (
    <div className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-[#FFE5D9] transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-xl font-bold text-[#6B3416] line-clamp-1 group-hover:text-[#FF8B5E] transition-colors duration-200">
          {ilan.title}
        </h2>
        <div className="bg-[#FFF5F0] px-3 py-1 rounded-full text-[#FF8B5E] font-bold text-sm">
          {ilan.price} {t("general.currency")}
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{ilan.description}</p>

      <div className="border-t border-gray-100 my-4"></div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] flex items-center justify-center text-white font-medium mr-3 shadow-sm group-hover:shadow-md transition-all duration-300 overflow-hidden relative">
            {ilan.teacher?.profilePhotoUrl && !photoError ? (
              <Image
                src={ilan.teacher.profilePhotoUrl}
                alt={ilan.teacher?.name ?? (t("general.unknown") as string)}
                width={40}
                height={40}
                className="w-10 h-10 object-cover rounded-full"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => onAvatarError(ilan._id)}
              />
            ) : (
              (ilan.teacher?.name || "?").charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800">{ilan.teacher?.name}</p>
            <p className="text-xs text-gray-500">{ilan.teacher?.expertise || t("general.notSpecified")}</p>
          </div>
        </div>
        <Link
          href={ilan.teacher ? `/egitmen-ilanlari/${ilan.teacher._id}` : "#"}
          prefetch={false}
          className="text-sm text-[#FF8B5E] hover:text-[#FF6B1A] hover:underline transition-colors flex items-center"
        >
          <span>{t("general.allListings")}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center bg-gray-50 p-2 rounded-lg">
          <FaMoneyBillWave className="text-green-600 mr-2" />
          <span className="text-gray-800 text-sm">{ilan.price} {t("general.currency")}/{t("general.hour")}</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 rounded-lg">
          <FaChalkboardTeacher className="text-purple-600 mr-2" />
          <span className="text-gray-800 text-sm capitalize">{ilan.method}</span>
        </div>
        <div className="flex items-center bg-gray-50 p-2 rounded-lg">
          <FaUniversity className="text-orange-600 mr-2" />
          <span className="text-gray-800 text-sm line-clamp-1">{userUniversity}</span>
        </div>
        {ilan.instructorFrom && (
          <div className="flex items-center bg-gray-50 p-2 rounded-lg">
            <FaChalkboardTeacher className="text-indigo-600 mr-2" />
            <span className="text-gray-800 text-sm line-clamp-1">Eğitmen: {ilan.instructorFrom}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Link
          href={`/ilan/${ilan._id}`}
          className="block flex-1 text-center py-3 bg-gradient-to-r from-[#FFB996] to-[#FF8B5E] text-white rounded-lg font-medium hover:shadow-md hover:shadow-[#FFB996]/20 transition-all duration-300 transform group-hover:translate-y-[-2px]"
        >
          {t("general.viewDetails")}
        </Link>
        <Link
          href={ilan.teacher ? `/egitmen-ilanlari/${ilan.teacher._id}` : "#"}
          prefetch={false}
          className="block py-3 px-3 bg-[#FFF5F0] text-[#FF8B5E] rounded-lg font-medium hover:bg-[#FFE5D9] transition-all duration-300 transform group-hover:translate-y-[-2px]"
        >
          <FaChalkboardTeacher size={18} />
        </Link>
      </div>
    </div>
  );
}

const ListingCard = React.memo(ListingCardBase);
export default ListingCard;
