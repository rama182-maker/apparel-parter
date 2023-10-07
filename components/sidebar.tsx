"use client";

import cancelSvg from "../public/cancel.svg";

import { CldUploadButton } from "next-cloudinary";
import { CldImage } from "next-cloudinary";
import { getCldImageUrl } from 'next-cloudinary';

import { addGenimg } from "@/lib/supabaseRequests";
import { useAuth } from "@clerk/nextjs";
import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "./ui/button";

type UploadResult = {
  info: {
    public_id: string;
  };
  event: "success";
};

const Sidebar = () => {
  const [apparelImageId, setApparelImageId] = useState("");
  const [shadeImageId, setShadeImageId] = useState("");
  const [generation, setGeneration] = useState("");
  const [showClearApparelImage, setShowClearApparelImage] = useState(false);
  const [showClearShadeImage, setShowClearShadeImage] = useState(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState(null);

  const clearApparelImage = () => {
    setApparelImageId("");
    setShowClearApparelImage(false);
  };

  const clearShadeImage = () => {
    setShadeImageId("");
    setShowClearShadeImage(false);
  };

  const handleApparelImageUpload = (result: any) => {
    setApparelImageId(result.info.public_id);
    setShowClearApparelImage(true);
  };

  const handleShadeImageUpload = (result: any) => {
    setShadeImageId(result.info.public_id);
    setShowClearShadeImage(true);
  };

  const { userId, getToken } = useAuth();

  // Function to upload an image to Cloudinary and get its URL
  async function uploadImageToCloudinary(imageDataUrl : string) {
    try {

      const formData = new FormData();
      formData.append("file", imageDataUrl);
      formData.append("upload_preset", "apparel-uploads");
      formData.append("api_key", "932336991721693");

      const cldres = await fetch("https://api.cloudinary.com/v1_1/dvrncmjlq/upload", {
        method: "POST",
        headers: {
          "Authorization": "Basic e3thcGlfa2V5fX06e3thcGlfc2VjcmV0fX0="
        },
        body: formData,
      });
      let cldresJson = await cldres.json();
      return cldresJson.secure_url;
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      throw error;
    }
  };


  async function generateImage(apparelImageId: string, shadeImageId: string) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(true);
    const res = await fetch("/api/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ apparelImageUrl: getCloudinaryUrl(apparelImageId), shadeImageUrl: getCloudinaryUrl(shadeImageId) }),
    });

    let newImage = await res.json();
    if (newImage.message !== "OK") {
      setError(newImage);
    } else {
      console.log("replicate success",newImage.resultImage);
      const resultImageCldUrl = await uploadImageToCloudinary(newImage.resultImage);
      setGeneration(resultImageCldUrl);
    }
    setLoading(false);
  }

  // UPLOADED CLOUDINARY URL
  const getCloudinaryUrl = (ImageId: string) => {
    const url = getCldImageUrl({
      src: ImageId
    });
    return url;
  }

  const handleSubmit = async (event: FormEvent) => { 
    event.preventDefault();
    try{
      setLoading(true); // Show loading indicator
      await generateImage(String(apparelImageId), String(shadeImageId));
      console.log("generateImage Done")

    } catch (error) {
      console.error("Error during form submission:", error);
    } finally {
      setLoading(false); // Hide loading indicator when done
    }
    
  };

  useEffect(() => {
    const updateGenimgs = async () => {
        if(generation){
          const token = await getToken({ template: "supabase" });
          const genimgs = await addGenimg({
            userId: String(userId),
            token: String(token),
            apparel_image_url: String(apparelImageId),
            shade_image_url: String(shadeImageId),
            gen_image_url: String(generation),
          });
          console.log(genimgs);
      }
    }
    updateGenimgs();
  }, [generation]);

  return (
    <div className="space-y-4 flex felx-col h-full text-primary bg-secondary">
      <div className="p-3 flex-1 jsutify-center">
        {/* start sidebar */}
        <div className="flex-col h-full overflow-y-scroll border border-[#555555]">
          {/* submit */}
          <form onSubmit={handleSubmit}>
            <div className="scrollable pt-2 pl-[20px]">
              <div className="bg-secondary border border-[#555555] p-4 rounded-lg shadow-md w-[350px]">
                <h2 className="text-lg text-white font-semibold mb-2">
                  Your Apparel
                </h2>
                {/* Apparel URL */}
                <div className="mb-4">
                  <input
                    placeholder="URL of Apparel"
                    // required
                    type="text"
                    className="flex-grow w-full h-12 px-4 mb-2 transition text-sm duration-200 bg- border hover:border-green-400 rounded-xl shadow-sm appearance-none hover:border focus:border-deep-purple-accent-400 focus:outline-none focus:shadow-outline text-black"
                    id="url"
                    name="url"
                  />
                  <div className="mt-2 border-t-2 border-dotted border-[#555555]"></div>
                </div>

                <div className="flex items-center justify-center w-full">
                  {apparelImageId ? (
                    <div className="relative">
                      <span
                        className="absolute top-0 right-0 m-0 text-white cursor-pointer"
                        onClick={clearApparelImage}
                      >
                        <Image src={cancelSvg} alt="Cancel" />
                      </span>
                      <CldImage
                        width="960"
                        height="600"
                        src={apparelImageId}
                        sizes="100vw"
                        alt="Description of my image"
                      />
                    </div>
                  ) : (
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-[#555555] border-dotted rounded-lg cursor-pointer bg-[#2c2c2c] dark:hover:bg-[#555555]dark:bg-[#2c2c2c] hover:bg-[#343434] dark:border-[#555555]dark:hover:border-[#555555] dark:hover:bg-[#343434]"
                    >
                      <CldUploadButton
                        onUpload={handleApparelImageUpload}
                        uploadPreset="apparel-uploads"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                            />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            SVG, PNG, JPG or GIF (MAX. 800x400px)
                          </p>
                        </div>
                        <input
                          required
                          id="dropzone-file"
                          name="image"
                          type="file"
                          className="hidden"
                        />
                      </CldUploadButton>
                    </label>
                  )}
                </div>
              </div>
            </div>
            <div className="scrollable p-2 pl-[20px]">
              <div className="bg-secondary border border-[#555555] p-4 rounded-lg shadow-md w-[350px]">
                <h2 className="text-lg text-white font-semibold mb-2">
                  Your Shade
                </h2>

                <div className="flex items-center justify-center w-full">
                  {shadeImageId ? (
                    <div className="relative">
                      <span
                        className="absolute top-0 right-0 m-0 text-white cursor-pointer"
                        onClick={clearShadeImage}
                      >
                        <Image src={cancelSvg} alt="Cancel" />
                      </span>
                      <CldImage
                        width="960"
                        height="600"
                        src={shadeImageId}
                        sizes="100vw"
                        alt="Description of my image"
                      />
                    </div>
                  ) : (
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-[#555555] border-dotted rounded-lg cursor-pointer bg-[#2c2c2c] dark:hover:bg-[#555555]dark:bg-[#2c2c2c] hover:bg-[#343434] dark:border-[#555555]dark:hover:border-[#555555] dark:hover:bg-[#343434]"
                    >
                      <CldUploadButton
                        onUpload={handleShadeImageUpload}
                        uploadPreset="apparel-uploads"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                            />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            SVG, PNG, JPG or GIF (MAX. 800x400px)
                          </p>
                        </div>
                        <input
                          required
                          id="dropzone-file"
                          name="image"
                          type="file"
                          className="hidden"
                        />
                      </CldUploadButton>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Main Button */}
            <Button type="submit" variant="redefine" size="lg">
                    Redefine
                </Button>
          </form>

          {/* test anything here */}
          {/* {generation && (
            <CldImage
              width="200"
              height="200"
              src={generation}
              sizes="100vw"
              alt="generated image"
            />
          )} */}
          
         
        </div>
        {/* end sidebar */}
      </div>
    </div>
  );
};

export default Sidebar;
