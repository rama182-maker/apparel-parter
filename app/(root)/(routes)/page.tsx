"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getGenimgs } from "@/lib/supabaseRequests";
import { CldImage } from "next-cloudinary";

const RootPage = () => {
    const { userId, getToken } = useAuth();
    const [loadingGenimgs, setLoadingGenimgs] = useState(false); // Initial loading state
    const [genimgs, setGenimgs] = useState<any[]>([]);
    const [resimg, setResimg] = useState<any[]>([]);

    const loadGenimgs = async () => {
        try {
            setLoadingGenimgs(true); // Set loading state to true
            const token = await getToken({ template: "supabase" });
            const genimgss = await getGenimgs({ userId: String(userId), token: String(token) });
            setGenimgs(genimgss || []);
        } catch (error) {
            console.error("Error loading genimgs:", error);
        } finally {
            setLoadingGenimgs(false); // Set loading state to false after the operation completes
        }
    };

    useEffect(() => {
        loadGenimgs();
        // Set up an interval to refresh the data every 5 minutes (adjust as needed)
        const intervalId = setInterval(() => {
            loadGenimgs();
        }, 5000); // 5 seconds

        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="h-full p-4 space-y-2">
            <h2 className="text-lg  md:block  font-bold mb-2 text-white">
                Recently Redefined
            </h2>
            
            <div className="text-center">
                <div className="mb-5 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div className={`h-2 ${loadingGenimgs ? 'animate-pulse rounded-full bg-gradient-to-r from-green-500 to-blue-500' : 'bg-[#555555]'} `}></div>
                </div>
            </div>

            {genimgs.map((genimg) => (
            <div key={genimg.id} className="border-4 border-[#555555] border-double rounded-lg p-2 mb-4">
                <div className="flex flex-row space-x-4">
                <div  className=" flex space-x-1 border-4 border-[#555555] border-solid rounded-lg p-1 mb-2">
                <CldImage
                    width="200"
                    height="200"
                    src={genimg.apparel_image_url}
                    sizes="100vw"
                    alt="apparel image"
                />
                <CldImage
                    width="200"
                    height="200"
                    src={genimg.shade_image_url}
                    sizes="100vw"
                    alt="shade image"
                />
                </div>
                <div  className=" flex space-x-4 border-4 border-[#555555] border-solid rounded-lg p-1 mb-2">
                <CldImage
                    width="200"
                    height="200"
                    src={genimg.gen_image_url}
                    sizes="100vw"
                    alt="generated image"
                />
                </div>
                </div>
            </div>
            ))}
        </div>
    );
};

export default RootPage;
